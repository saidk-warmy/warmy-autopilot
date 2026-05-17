const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

/* ─────────────────────────────────────────────────────
   /api/claude — Anthropic API proxy
───────────────────────────────────────────────────── */
app.post("/api/claude", async (req, res) => {
  try {
    const { default: fetch } = await import("node-fetch");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "mcp-client-2025-04-04",
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

/* ─────────────────────────────────────────────────────
   /api/avoma-sync — Pull completed meetings from Avoma
   and use Claude to extract deal context for each one
───────────────────────────────────────────────────── */
app.post("/api/avoma-sync", async (req, res) => {
  const AVOMA_KEY = process.env.AVOMA_API_KEY;
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

  if (!AVOMA_KEY) {
    return res.status(400).json({ error: "AVOMA_API_KEY not set in environment variables" });
  }

  try {
    const { default: fetch } = await import("node-fetch");

    // ── 1. Fetch recent completed meetings from Avoma ──
    const existingIds = req.body.existingMeetingIds || [];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const aevomaUrl = `https://api.avoma.com/v1/meetings/?from_date=${sevenDaysAgo}&to_date=${now}&page_size=50&o=-start_at`;

    const avomaResp = await fetch(aevomaUrl, {
      headers: {
       "Authorization": `Bearer ${AVOMA_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!avomaResp.ok) {
      const errText = await avomaResp.text();
      return res.status(500).json({ error: `Avoma API error: ${avomaResp.status} — ${errText}` });
    }

    const avomaData = await avomaResp.json();
    const allMeetings = avomaData.results || [];

    // Filter: completed, has transcript, external (not internal), not already in app
    const WARMY_EMAILS = [
      "saidk@warmy.io", "gokhank@warmy.io", "felipev@warmy.io",
      "sofiiar@warmy.io", "jorget@warmy.io", "jamesp@warmy.io",
      "alinas@warmy.io", "felipev@warmy.io",
    ];

    const newMeetings = allMeetings.filter(m => {
      if (m.is_internal) return false;
      if (m.state !== "completed") return false;
      if (!m.transcript_ready) return false;
      if (existingIds.includes(m.uuid)) return false;

      // Must have at least one external attendee
      const attendeeEmails = (m.attendees || []).map(a => a.email.toLowerCase());
      const hasExternal = attendeeEmails.some(e => !WARMY_EMAILS.includes(e));
      if (!hasExternal) return false;

      return true;
    });

    if (newMeetings.length === 0) {
      return res.json({ newTasks: [], message: "No new meetings found" });
    }

    // ── 2. For each new meeting, fetch transcript + analyze with Claude ──
    const newTasks = [];

    for (const meeting of newMeetings.slice(0, 10)) { // cap at 10 per sync
      try {
        // Fetch transcript
        const transcriptResp = await fetch(
          `https://api.avoma.com/v1/meetings/${meeting.uuid}/transcript/`,
          {
            headers: {
              "Authorization": `Token ${AVOMA_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        let transcriptText = "";
        if (transcriptResp.ok) {
          const transcriptData = await transcriptResp.json();
          // Build readable transcript from segments
          const segments = transcriptData.transcript || transcriptData.segments || [];
          transcriptText = segments
            .map(s => `${s.speaker || "Speaker"}: ${s.text || s.content || ""}`)
            .join("\n")
            .slice(0, 8000); // limit for Claude context
        }

        // Identify which AE ran the call
        const attendeeEmails = (meeting.attendees || []).map(a => a.email.toLowerCase());
        const aeEmail = attendeeEmails.find(e => WARMY_EMAILS.includes(e)) || "gokhank@warmy.io";
        const externalAttendees = (meeting.attendees || []).filter(a =>
          !WARMY_EMAILS.includes(a.email.toLowerCase())
        );
        const primaryContact = externalAttendees[0] || {};

        // Ask Claude to analyze the meeting
        const claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 800,
            system: "You are a sales intelligence assistant for Warmy.io. Analyze sales meeting transcripts and extract structured deal context. Be specific — reference actual numbers, names, and pain points from the transcript. Return ONLY valid JSON, no markdown, no explanation.",
            messages: [{
              role: "user",
              content: `Analyze this Warmy.io sales meeting and return a JSON object.

Meeting subject: ${meeting.subject || "Warmy.io Demo"}
Meeting type: ${meeting.type?.label || "Demo"}
Meeting outcome: ${meeting.outcome?.label || "Unknown"}
Meeting date: ${meeting.start_at?.split("T")[0] || "Unknown"}
Duration: ${Math.round((meeting.duration || 0) / 60)} minutes
AE: ${aeEmail}
Primary contact: ${primaryContact.name || "Unknown"} <${primaryContact.email || "unknown@unknown.com"}>
All external attendees: ${externalAttendees.map(a => `${a.name} <${a.email}>`).join(", ")}

Transcript (may be partial):
${transcriptText || "(No transcript available)"}

Return ONLY this JSON structure:
{
  "contactName": "full name of primary prospect",
  "contactEmail": "primary prospect email",
  "company": "company name + brief descriptor e.g. 'Acme Corp (SaaS startup)'",
  "dealValue": "estimated deal value e.g. '$199/mo' or 'TBD' if not discussed",
  "dealStage": "Demo Done|Price Proposal Sent|Proposal Done",
  "followUpType": "fu1",
  "meetingContext": "3-4 sentences: what their business does, their pain point, what was discussed/offered, what the next step is. Be specific with numbers if mentioned.",
  "nextStep": "one sentence on exactly what needs to happen next",
  "urgency": "high|medium|low",
  "pipelineStatus": "pending|done"
}`,
            }],
          }),
        });

        if (!claudeResp.ok) continue;

        const claudeData = await claudeResp.json();
        const claudeText = (claudeData.content || []).map(b => b.text || "").join("");

        let taskData;
        try {
          const jsonMatch = claudeText.match(/\{[\s\S]*\}/);
          taskData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch {
          continue;
        }

        if (!taskData) continue;

        const daysAgo = Math.floor(
          (Date.now() - new Date(meeting.start_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        newTasks.push({
          id: `SYNC_${meeting.uuid.slice(0, 8).toUpperCase()}`,
          dealId: `DEAL_${meeting.uuid.slice(0, 8).toUpperCase()}`,
          type: "fu1",
          contactName: taskData.contactName || primaryContact.name || "Unknown",
          contactEmail: taskData.contactEmail || primaryContact.email || "",
          company: taskData.company || meeting.subject || "Unknown",
          ae: aeEmail,
          meetingDate: meeting.start_at?.split("T")[0] || new Date().toISOString().split("T")[0],
          daysSinceMeeting: daysAgo,
          dealStage: taskData.dealStage || "Demo Done",
          dealValue: taskData.dealValue || "TBD",
          meetingContext: taskData.meetingContext || "Meeting context not available.",
          nextStep: taskData.nextStep || "Send follow-up email.",
          transcriptId: meeting.uuid,
          status: "pending",
          draft: "",
          pipelineStatus: taskData.pipelineStatus || "pending",
          syncedAt: new Date().toISOString(),
          isNew: true,
        });

      } catch (meetingErr) {
        console.error(`Error processing meeting ${meeting.uuid}:`, meetingErr.message);
        continue;
      }
    }

    res.json({
      newTasks,
      totalFound: allMeetings.length,
      newCount: newMeetings.length,
      processed: newTasks.length,
      message: `Synced ${newTasks.length} new meeting${newTasks.length !== 1 ? "s" : ""}`,
    });

  } catch (err) {
    console.error("Avoma sync error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────
   Catch-all — serve React app
───────────────────────────────────────────────────── */
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
