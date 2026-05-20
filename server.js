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
   /api/hubspot-update — Update a deal stage directly
───────────────────────────────────────────────────── */
app.post("/api/hubspot-update", async (req, res) => {
  const HS_TOKEN = process.env.HUBSPOT_TOKEN;
  if (!HS_TOKEN) return res.status(400).json({ error: "HUBSPOT_TOKEN not set" });

  const { dealId, stage, note } = req.body;
  if (!dealId || !stage) return res.status(400).json({ error: "dealId and stage required" });

  const STAGE_ID_MAP = {
    meeting_scheduled: "86886808",
    proposal_sent:     "86886810",
    negotiation:       "86886811",
    closed_won:        "86886813",
    closed_lost:       "86886814",
    disqualified:      "86907056",
  };

  const stageId = STAGE_ID_MAP[stage];
  if (!stageId) return res.status(400).json({ error: `Unknown stage: ${stage}` });

  try {
    const { default: fetch } = await import("node-fetch");

    // Update deal stage
    const updateResp = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HS_TOKEN}`,
      },
      body: JSON.stringify({ properties: { dealstage: stageId } }),
    });

    if (!updateResp.ok) {
      const err = await updateResp.text();
      return res.status(500).json({ error: `HubSpot update failed: ${err}` });
    }

    // Add note if provided
    if (note) {
      await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${HS_TOKEN}`,
        },
        body: JSON.stringify({
          properties: {
            hs_note_body: note,
            hs_timestamp: new Date().toISOString(),
          },
          associations: [{
            to: { id: dealId },
            types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 214 }],
          }],
        }),
      });
    }

    res.json({ success: true, dealId, stage, stageId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────
   /api/hubspot-log — Log activity on a deal
───────────────────────────────────────────────────── */
app.post("/api/hubspot-log", async (req, res) => {
  const HS_TOKEN = process.env.HUBSPOT_TOKEN;
  if (!HS_TOKEN) return res.status(400).json({ error: "HUBSPOT_TOKEN not set" });

  const { dealId, note } = req.body;
  if (!dealId) return res.status(400).json({ error: "dealId required" });

  try {
    const { default: fetch } = await import("node-fetch");

    await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HS_TOKEN}`,
      },
      body: JSON.stringify({
        properties: {
          hs_note_body: note || `Activity logged — ${new Date().toLocaleDateString("en-GB")}`,
          hs_timestamp: new Date().toISOString(),
        },
        associations: [{
          to: { id: dealId },
          types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 214 }],
        }],
      }),
    });

    // Also update notes_last_contacted on the deal so the Negotiation clock resets correctly
    await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HS_TOKEN}`,
      },
      body: JSON.stringify({
        properties: { notes_last_contacted: new Date().toISOString() }
      }),
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/hubspot-pipeline", async (req, res) => {
  const HS_TOKEN = process.env.HUBSPOT_TOKEN;
  if (!HS_TOKEN) {
    return res.status(400).json({ error: "HUBSPOT_TOKEN not set in environment variables" });
  }

  const AE_OWNER_IDS = ["88489253", "87333667", "75485407", "91804682", "79157594"];
  const PIPELINE_ID = "41302146";

  // Stage ID → label + internal key mapping
  const STAGE_MAP = {
    "86886808": { key: "meeting_scheduled", label: "Meeting Scheduled" },
    "86886810": { key: "proposal_sent",     label: "Price Proposal Sent" },
    "86886811": { key: "negotiation",       label: "Negotiation" },
    "86886813": { key: "closed_won",        label: "Closed Won ✓" },
    "86886814": { key: "closed_lost",       label: "Closed Lost" },
    "86907056": { key: "disqualified",      label: "Disqualified" },
  };

  try {
    const { default: fetch } = await import("node-fetch");

    // Search HubSpot for all deals owned by AEs in the main pipeline
    const searchBody = {
      filterGroups: [{
        filters: [
          { propertyName: "pipeline", operator: "EQ", value: PIPELINE_ID },
          { propertyName: "hubspot_owner_id", operator: "IN", values: AE_OWNER_IDS },
        ]
      }],
      properties: [
        "dealname", "dealstage", "amount", "hubspot_owner_id",
        "hs_lastmodifieddate", "createdate", "closedate",
        "hs_deal_stage_probability", "notes_last_contacted",
      ],
      sorts: [{ propertyName: "hs_lastmodifieddate", direction: "DESCENDING" }],
      limit: 200,
    };

    let allDeals = [];
    let after = undefined;

    // Paginate through all deals (HubSpot max 200 per page)
    while (true) {
      if (after) searchBody.after = after;
      const hsResp = await fetch("https://api.hubapi.com/crm/v3/objects/deals/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${HS_TOKEN}` },
        body: JSON.stringify(searchBody),
      });
      if (!hsResp.ok) {
        const err = await hsResp.text();
        return res.status(500).json({ error: `HubSpot API error: ${hsResp.status} — ${err}` });
      }
      const hsData = await hsResp.json();
      allDeals = allDeals.concat(hsData.results || []);
      if (!hsData.paging?.next?.after || allDeals.length >= 600) break;
      after = hsData.paging.next.after;
    }

    const deals = allDeals;

    // For active deals, fetch property history to get exact stage entry date
    const ACTIVE_STAGES = new Set(["86886808", "86886810", "86886811"]);
    const activeDeals = deals.filter(d => ACTIVE_STAGES.has(d.properties.dealstage));

    const dealStageEntryDates = {};
    // Batch in groups of 5 to stay within rate limits
    for (let i = 0; i < activeDeals.length; i += 5) {
      const batch = activeDeals.slice(i, i + 5);
      await Promise.all(batch.map(async (deal) => {
        try {
          const r = await fetch(
            `https://api.hubapi.com/crm/v3/objects/deals/${deal.id}?propertiesWithHistory=dealstage`,
            { headers: { "Authorization": `Bearer ${HS_TOKEN}` } }
          );
          if (r.ok) {
            const d = await r.json();
            const history = d.propertiesWithHistory?.dealstage || [];
            const currentStage = deal.properties.dealstage;
            // Find the most recent entry where this stage was set
            const stageEntry = history.find(h => h.value === currentStage);
            if (stageEntry?.timestamp) {
              dealStageEntryDates[deal.id] = new Date(stageEntry.timestamp);
            }
          }
        } catch {}
      }));
    }

    // Map owner IDs to AE emails
    const OWNER_EMAIL_MAP = {
      "88489253": "felipev@warmy.io",
      "87333667": "jorget@warmy.io",
      "75485407": "sofiiar@warmy.io",
      "91804682": "gokhank@warmy.io",
      "79157594": "saidk@warmy.io",
    };

    const pipeline = deals.map(deal => {
      const p = deal.properties;
      const stageId = p.dealstage || "";
      const stageInfo = STAGE_MAP[stageId] || { key: "meeting_scheduled", label: p.dealstage || "Unknown" };

      // For Negotiation: clock resets on last activity (notes_last_contacted or hs_lastmodifieddate)
      // For other stages: use actual stage entry date from property history
      let stageEntryDate;
      if (stageInfo.key === "negotiation") {
        // Use the most recent of: notes_last_contacted, hs_lastmodifieddate
        const lastContacted = p.notes_last_contacted ? new Date(p.notes_last_contacted) : null;
        const lastModified = new Date(p.hs_lastmodifieddate || p.createdate);
        stageEntryDate = lastContacted && lastContacted > lastModified ? lastContacted : lastModified;
      } else {
        stageEntryDate = dealStageEntryDates[deal.id]
          || new Date(p.createdate || p.hs_lastmodifieddate);
      }
      const daysInStage = Math.max(0, Math.floor((Date.now() - stageEntryDate.getTime()) / (1000 * 60 * 60 * 24)));

      // Extract contact name from deal name (format: "Name <> Warmy.io -date")
      const dealName = p.dealname || "";
      const contactName = dealName.replace(/<> Warmy\.io.*$/i, "").replace(/-\d+\/\d+\/\d+.*$/, "").trim() || dealName;

      return {
        id: `HS_${deal.id}`,
        hubspotId: deal.id,
        contactName,
        contactEmail: "",
        company: dealName,
        ae: OWNER_EMAIL_MAP[p.hubspot_owner_id] || "gokhank@warmy.io",
        stage: stageInfo.key,
        stageLabel: stageInfo.label,
        daysInStage: Math.max(0, daysInStage),
        dealValue: p.amount ? `$${parseFloat(p.amount).toFixed(0)}` : "TBD",
        followUpSentDay3: false,
        noShow: stageInfo.key === "disqualified",
        lastActivity: p.hs_lastmodifieddate?.split("T")[0] || new Date().toISOString().split("T")[0],
        notes: `HubSpot: ${stageInfo.label}${p.amount ? ` · $${p.amount}` : ""}`,
        closedate: p.closedate,
        probability: p.hs_deal_stage_probability,
      };
    });

    res.json({
      pipeline,
      total: pipeline.length,
      synced_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error("HubSpot pipeline sync error:", err);
    res.status(500).json({ error: err.message });
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
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    // Fetch multiple pages to get all recent meetings
    let allMeetings = [];
    let nextUrl = `https://api.avoma.com/v1/meetings/?from_date=${fourteenDaysAgo}&to_date=${now}&page_size=100&o=-start_at`;

    while (nextUrl && allMeetings.length < 300) {
      const avomaResp = await fetch(nextUrl, {
        headers: { "Authorization": `Bearer ${AVOMA_KEY}`, "Content-Type": "application/json" },
      });
      if (!avomaResp.ok) {
        const errText = await avomaResp.text();
        return res.status(500).json({ error: `Avoma API error: ${avomaResp.status} — ${errText}` });
      }
      const avomaData = await avomaResp.json();
      allMeetings = allMeetings.concat(avomaData.results || []);
      nextUrl = avomaData.next || null;
    }

    // Filter: completed, has transcript, external (not internal), not already in app
    const WARMY_EMAILS = [
      "saidk@warmy.io", "gokhank@warmy.io", "felipev@warmy.io",
      "sofiiar@warmy.io", "jorget@warmy.io", "jamesp@warmy.io",
      "alinas@warmy.io", "felipev@warmy.io",
    ];

    const newMeetings = allMeetings.filter(m => {
      if (m.is_internal) return false;
      if (m.is_private) return false;
      // state = "completed" means the meeting happened (past)
      if (m.state !== "completed") return false;
      // Must have transcript ready OR audio ready (transcription might still be processing)
      if (!m.transcript_ready && !m.audio_ready) return false;
      if (existingIds.includes(m.uuid)) return false;

      // Must have at least one external attendee
      const attendeeEmails = (m.attendees || []).map(a => (a.email || "").toLowerCase());
      const hasExternal = attendeeEmails.some(e => e && !WARMY_EMAILS.includes(e));
      if (!hasExternal) return false;

      // Must have a Warmy AE as attendee
      const hasAE = attendeeEmails.some(e => WARMY_EMAILS.includes(e));
      if (!hasAE) return false;

      return true;
    });

    if (newMeetings.length === 0) {
      return res.json({
        newTasks: [],
        message: "No new meetings found",
        debug: {
          totalFetched: allMeetings.length,
          completed: allMeetings.filter(m => m.state === "completed").length,
          withTranscript: allMeetings.filter(m => m.transcript_ready).length,
          alreadyKnown: allMeetings.filter(m => existingIds.includes(m.uuid)).length,
        }
      });
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
              "Authorization": `Bearer ${AVOMA_KEY}`,
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
