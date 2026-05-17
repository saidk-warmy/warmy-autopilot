import { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   AE STYLE PROFILES — learned from Avoma transcripts
═══════════════════════════════════════════════════════ */
const AE_PROFILES = {
  "saidk@warmy.io": {
    name: "Said Karaca", initials: "SK", color: "#f59e0b",
    greeting: "Hi [Name],", closing: "Cheers,\nSaid",
    tone: "direct, warm, consultative. Gets to the point fast. References the exact things discussed on the call.",
    avgWords: 75, role: "Head of Sales",
    phrases: ["Yeah I mean, look —", "Alright, so here's the thing:", "Exactly, and by the way,"],
  },
  "gokhank@warmy.io": {
    name: "Gokhan Koluman", initials: "GK", color: "#3b82f6",
    greeting: "Hi [Name],", closing: "Best,\nGokhan",
    tone: "educational, structured, builds trust through expertise. Explains the 'why' behind everything. Consultative.",
    avgWords: 100, role: "AE",
    phrases: ["Just to clarify,", "As I mentioned on the call,", "When it comes to"],
  },
  "felipev@warmy.io": {
    name: "Felipe Vargas", initials: "FV", color: "#10b981",
    greeting: "Hey [Name],", closing: "Cheers,\nFelipe",
    tone: "energetic, casual but professional. Moves fast. Friendly and direct.",
    avgWords: 65, role: "AE",
    phrases: ["Quick one —", "Following up from our call,", "Just checking in —"],
  },
  "sofiiar@warmy.io": {
    name: "Sofiia Rapatska", initials: "SR", color: "#8b5cf6",
    greeting: "Hi [Name],", closing: "Best,\nSofiia",
    tone: "professional, product-focused, precise. References specific platform features discussed.",
    avgWords: 80, role: "AE / Demo",
    phrases: ["As we discussed during the demo,", "Just to recap what we covered,", "Happy to clarify"],
  },
  "jorget@warmy.io": {
    name: "Jorge Marttins", initials: "JM", color: "#ef4444",
    greeting: "Hi [Name],", closing: "Best,\nJorge",
    tone: "professional, straightforward, action-oriented.",
    avgWords: 70, role: "AE",
    phrases: ["Following up from our conversation,", "As discussed,", "Reaching out to"],
  },
};

/* ═══════════════════════════════════════════════════════
   FOLLOW-UP SEQUENCE CONFIG
═══════════════════════════════════════════════════════ */
const FU_CONFIG = {
  fu1: {
    label: "Post-Meeting Follow-up",
    day: 0,
    badge: "FU1",
    color: "#3b82f6",
    instruction: "Thank them for the meeting. Recap the 2-3 KEY things discussed (be specific — names, numbers, use cases). Confirm agreed next steps. Excited, warm tone. Under 90 words.",
    pipelineAction: "Move to Price Proposal Sent",
    pipelineStage: "Price Proposal Sent",
  },
  fu2: {
    label: "3-Day Follow-up",
    day: 3,
    badge: "FU2",
    color: "#f59e0b",
    instruction: "Brief, low-pressure check-in. Reference the previous email naturally. Ask one direct question to keep things moving. Under 60 words.",
    pipelineAction: null,
  },
  fu3: {
    label: "6-Day Follow-up",
    day: 6,
    badge: "FU3",
    color: "#f97316",
    instruction: "Honest and direct. Offer a specific piece of value (insight, resource) relevant to their use case. Soft CTA. Under 60 words.",
    pipelineAction: null,
  },
  fu4: {
    label: "9-Day Final Follow-up",
    day: 9,
    badge: "FU4",
    color: "#ef4444",
    instruction: "Final check-in before closing the file. Honest — tell them you're checking in one last time. Make it easy to say yes or no. Under 50 words.",
    pipelineAction: "Close Lost or Negotiation",
    pipelineStage: "Closed Lost",
  },
};

/* ═══════════════════════════════════════════════════════
   SEEDED PIPELINE — from real Avoma transcripts
═══════════════════════════════════════════════════════ */
const INITIAL_TASKS = [
  {
    id: "T001", dealId: "MAX_001", type: "fu2",
    contactName: "Max Nyirenda", contactEmail: "max.nyirenda@goinspire.co.uk",
    company: "GoInspire", ae: "saidk@warmy.io",
    meetingDate: "2026-05-14", daysSinceMeeting: 2,
    dealStage: "Price Proposal Sent", dealValue: "$1,900/mo",
    meetingContext: "Upsell call. Two new domains for EE telecom campaigns. Amazon SES integration. 10k daily seed list recommended. Offered $1,600/mo with 15% testimonial discount. Annual = $16k/yr. Max needs CTO (Sat) sign-off. Said promised to send comparison email seed list vs standard.",
    transcriptId: "1af383c9-640a-4515-8044-310c37375e6d",
    status: "pending", draft: "", pipelineStatus: "done",
  },
  {
    id: "T002", dealId: "BILL_001", type: "fu1",
    contactName: "Bill Bowden", contactEmail: "bill@maior.ai",
    company: "maior.ai (lending)", ae: "gokhank@warmy.io",
    meetingDate: "2026-05-14", daysSinceMeeting: 1,
    dealStage: "Demo Done", dealValue: "~$25–39/mailbox × 5",
    meetingContext: "Demo with Bill + Craig. HTML emails tanked deliverability on Apollo. Google Workspace, 5 mailboxes, 50 emails/day. Comparing vs MX Tools ($129/mo). Sofiia showed platform demo. Bill said 'sounds extremely fair' and open to annual. Decision pending CEO approval. Expected answer next day.",
    transcriptId: "c014a5a1-ae9b-4131-a15f-691f274b6dd1",
    status: "pending", draft: "", pipelineStatus: "pending",
  },
  {
    id: "T003", dealId: "JACK_001", type: "fu2",
    contactName: "Jamie Anderson", contactEmail: "jamie.anderson@kodiakhub.com",
    company: "KodiakHub", ae: "gokhank@warmy.io",
    meetingDate: "2026-05-13", daysSinceMeeting: 2,
    dealStage: "Price Proposal Sent", dealValue: "$4,500/yr (30 mailboxes)",
    meetingContext: "Jack Butzu + Jamie Anderson. Stockholm. 10 SDRs, 50 emails/day, Microsoft 365. Never done warming. Offered 30 mailboxes × $15/mo = $450/mo or $4,500/yr. Jamie needs CFO approval. Timeline end of May. Also cc Jack Butzu (jack.butzu@kodiakhub.com).",
    transcriptId: "5cb81583-90a8-465a-bde1-346e6f24556f",
    status: "pending", draft: "", pipelineStatus: "done",
  },
  {
    id: "T004", dealId: "VIHAR_001", type: "fu1",
    contactName: "Vihar Naik", contactEmail: "viharnaik@callhippo.com",
    company: "CallHippo", ae: "gokhank@warmy.io",
    meetingDate: "2026-05-13", daysSinceMeeting: 2,
    dealStage: "Demo Done", dealValue: "TBD",
    meetingContext: "Demo completed May 13. CallHippo is a VoIP/communication platform. Outcome: Scheduled (next step agreed). Gokhan + Sofiia on the call.",
    transcriptId: "9f77a6cd-01fa-459d-9000-c716e8bad583",
    status: "pending", draft: "", pipelineStatus: "pending",
  },
  {
    id: "T005", dealId: "YUVRAJ_001", type: "fu2",
    contactName: "Yuvraj Karle", contactEmail: "yuvraj@performifymedia.com",
    company: "PerformifyMedia", ae: "gokhank@warmy.io",
    meetingDate: "2026-05-13", daysSinceMeeting: 2,
    dealStage: "Price Proposal Sent", dealValue: "TBD",
    meetingContext: "Demo completed May 13. Outcome: Scheduled. Performance media company. Gokhan ran the call.",
    transcriptId: "22658dde-fe87-4670-bbaf-285b07184e56",
    status: "pending", draft: "", pipelineStatus: "done",
  },
  {
    id: "T006", dealId: "BEN_001", type: "fu3",
    contactName: "Benjamin Kouba", contactEmail: "ben@leaf9.com",
    company: "Leaf9", ae: "gokhank@warmy.io",
    meetingDate: "2026-05-12", daysSinceMeeting: 3,
    dealStage: "Price Proposal Sent", dealValue: "TBD",
    meetingContext: "Demo May 12. Outcome: Scheduled. Gokhan ran the call. No reply since.",
    transcriptId: "e71b4e61-6be7-4966-b655-927e475e82fd",
    status: "pending", draft: "", pipelineStatus: "done",
  },
  {
    id: "T007", dealId: "FREDDIE_001", type: "fu3",
    contactName: "Freddie Gonzalez", contactEmail: "freddie@pzerotalent.co",
    company: "PzeroTalent", ae: "gokhank@warmy.io",
    meetingDate: "2026-05-12", daysSinceMeeting: 3,
    dealStage: "Price Proposal Sent", dealValue: "TBD",
    meetingContext: "Demo May 12. Outcome: Scheduled. No reply since. Gokhan ran the call.",
    transcriptId: "d3b94f29-d8e5-4bb8-bab3-1bc8aba044cf",
    status: "pending", draft: "", pipelineStatus: "done",
  },
];

const MEETING_ANALYSES = [
  {
    id: "M001", meetingId: "aa548486-2b2f-460b-b777-db27917619c0",
    ae: "saidk@warmy.io", contact: "Max Nyirenda", company: "GoInspire",
    type: "Upsell", date: "2026-05-13", duration: "23 min",
    went_well: [
      "Quickly understood Max's exact use case (EE telecom campaigns, 400–500k sends)",
      "Proactively identified Amazon SES integration — removed a key friction point",
      "Offered the seed list upgrade at the right moment with clear ROI framing",
      "Discovered the partnership angle (GoInspire as performance partner) and offered to send the referral program link",
      "Set clear next steps with pricing in writing",
    ],
    improve: [
      "Max asked for a comparison email (seed list vs standard) to forward to Sat — should have sent it immediately after the call, not promised it",
      "Pricing was slightly unclear — had to correct himself mid-call on the $1,900 vs $2,200 calculation",
      "Could have asked earlier about Sat's decision timeline to set a follow-up date",
    ],
    score: 82,
    summary: "Strong upsell call. Said moved confidently from discovery to proposal. Main gap is not locking in a specific next-step date with Sat, which creates ambiguity in the follow-up sequence.",
  },
  {
    id: "M002", meetingId: "c014a5a1-ae9b-4131-a15f-691f274b6dd1",
    ae: "gokhank@warmy.io", contact: "Bill Bowden + Craig", company: "maior.ai",
    type: "Demo", date: "2026-05-14", duration: "33 min",
    went_well: [
      "Thorough discovery — got full context on the HTML email issue, Apollo setup, and team structure before pitching",
      "Sofiia's product demo was clear and addressed the exact deliverability issues they mentioned",
      "Gokhan framed Warmy as a 'partner' not just a tool — built credibility",
      "Pushed for a decision timeline ('by tomorrow afternoon') — Bill committed",
      "Annual framing done naturally — Bill said 'year's commitment makes sense'",
    ],
    improve: [
      "Call ran slightly long — Sofiia's demo could be tighter for a 30-min slot",
      "Should have confirmed the CEO's name and role earlier to personalize the follow-up",
      "Pricing hesitation visible — Gokhan said 'let me check' twice; better to have ranges ready",
    ],
    score: 85,
    summary: "Textbook demo execution. Gokhan diagnosed the problem clearly, Sofiia showed the solution, and they closed with a clear next step. Minor issue: pricing confidence could be stronger.",
  },
  {
    id: "M003", meetingId: "5cb81583-90a8-465a-bde1-346e6f24556f",
    ae: "gokhank@warmy.io", contact: "Jack Butzu + Jamie Anderson", company: "KodiakHub",
    type: "Demo", date: "2026-05-13", duration: "40 min",
    went_well: [
      "Handled a complex multi-stakeholder call (GTM engineer + IT) very smoothly",
      "Correctly identified the infrastructure problem (5 domains not warmed) before proposing a solution",
      "Got Jamie to frame it as a year commitment naturally — she brought it up herself",
      "$4,500/yr offer was well-received",
      "Clear differentiator vs Instantly and Mailreach when asked directly",
    ],
    improve: [
      "Call was 40 min — could have moved to pricing faster after diagnosis was clear",
      "Jack's specific question about separating rep emails vs sequences wasn't fully answered",
      "No hard close — 'end of month' timeline is vague; should have booked a follow-up call",
    ],
    score: 80,
    summary: "Strong call on a complex multi-persona deal. The CFO approval step is the main risk — no follow-up meeting booked means this can easily go cold. Priority: get a call on the calendar with Jamie.",
  },
  {
    id: "M004", meetingId: "bef34772-56f8-4c24-9554-66fb5de47382",
    ae: "gokhank@warmy.io", contact: "Dorian Lesnic", company: "Cardneto",
    type: "Demo", date: "2026-05-13", duration: "59 min",
    went_well: [
      "Closed on the call — Dorian completed payment live",
      "Handled competitor questions (Instantly, Apollo warm-up) with confidence and without dismissing them",
      "Used the startup angle well — $20/mailbox deal felt personal and fair",
      "Dorian praised the call as 'one of the smoothest sales experiences' he'd had",
      "Gokhan shared his discovery framework unprompted — great trust builder",
    ],
    improve: [
      "Call ran 59 min for what is essentially a small deal ($100/mo) — time allocation issue",
      "The Instantly question came up 4 times — should have addressed it more definitively earlier",
      "VPN/domain setup questions were outside Gokhan's expertise — created some uncertainty",
    ],
    score: 90,
    summary: "Exceptional close. Dorian is a small deal but Gokhan turned him into an advocate on the call. The time investment (59 min) is the only real concern for a $100/mo account.",
  },
];

/* ═══════════════════════════════════════════════════════
   API
═══════════════════════════════════════════════════════ */
const MCP = [
  { type: "url", url: "https://mcp.hubspot.com/anthropic",      name: "hubspot" },
  { type: "url", url: "https://gmailmcp.googleapis.com/mcp/v1", name: "gmail"   },
];

async function callClaude(system, userMsg) {
  const r = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system, messages: [{ role: "user", content: userMsg }],
      mcp_servers: MCP,
    }),
  });
  if (!r.ok) throw new Error(`API ${r.status}`);
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
}

function buildDraftPrompt(task, fuConfig, aeProfile) {
  return `
You are ${aeProfile.name}'s personal writing assistant. Write a follow-up email in their EXACT voice.

AE STYLE:
- Name: ${aeProfile.name}
- Greeting: "${aeProfile.greeting}"
- Closing: "${aeProfile.closing}"
- Tone: ${aeProfile.tone}
- Target length: ~${aeProfile.avgWords} words
- Signature phrases: ${aeProfile.phrases.join(", ")}

DEAL CONTEXT:
- Contact: ${task.contactName} at ${task.company}
- Meeting date: ${task.meetingDate} (${task.daysSinceMeeting} days ago)
- What was discussed: ${task.meetingContext}
- Follow-up type: ${fuConfig.label}

EMAIL INSTRUCTIONS:
${fuConfig.instruction}

CRITICAL:
- Reference SPECIFIC details from the meeting context — numbers, names, features discussed
- Do NOT sound like a template
- Do NOT mention "I hope this email finds you well" or similar generic openers
- Output ONLY: Subject line (prefix "Subject: "), blank line, then email body. Nothing else.
`.trim();
}

/* ═══════════════════════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════════════════════ */
function Badge({ label, color, size = "sm" }) {
  const pad = size === "sm" ? "2px 7px" : "4px 11px";
  const fs = size === "sm" ? 10 : 12;
  return (
    <span style={{
      display: "inline-block", padding: pad, borderRadius: 4,
      background: `${color}18`, border: `1px solid ${color}40`,
      color, fontSize: fs, fontWeight: 700, letterSpacing: "0.05em",
      fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function AEAvatar({ email, size = 30 }) {
  const p = AE_PROFILES[email] || { initials: "?", color: "#64748b" };
  return (
    <div title={p.name} style={{
      width: size, height: size, borderRadius: "50%",
      background: `${p.color}20`, border: `1.5px solid ${p.color}50`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.34, fontWeight: 700, color: p.color, flexShrink: 0,
      fontFamily: "'JetBrains Mono', monospace",
    }}>{p.initials}</div>
  );
}

function TaskCard({ task, onDraftGenerated, onSend, onPipelineAction, onDismiss }) {
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [pipelining, setPipelining] = useState(false);
  const [draft, setDraft] = useState(task.draft || "");
  const [expanded, setExpanded] = useState(task.status === "pending" && !task.draft);
  const [pipelineChoice, setPipelineChoice] = useState(null); // "close_lost" | "negotiation"

  const fuConfig = FU_CONFIG[task.type];
  const aeProfile = AE_PROFILES[task.ae];
  const isLastFU = task.type === "fu4";
  const urgency = task.daysSinceMeeting >= 9 ? "high" : task.daysSinceMeeting >= 6 ? "mid" : "low";
  const urgencyColor = { high: "#ef4444", mid: "#f97316", low: fuConfig.color }[urgency];

  const handleGenerateDraft = async () => {
    setGenerating(true);
    try {
      const text = await callClaude(
        `You are a sales email writer for ${aeProfile.name} at Warmy.io. Write emails that sound exactly like them — not like AI.`,
        buildDraftPrompt(task, fuConfig, aeProfile)
      );
      setDraft(text);
      onDraftGenerated(task.id, text);
      setExpanded(true);
    } catch (e) {
      setDraft(`Error generating draft: ${e.message}`);
    }
    setGenerating(false);
  };

  const handleSend = async () => {
    if (!draft) return;
    setSending(true);
    try {
      const lines = draft.split("\n");
      const subjectLine = lines.find(l => l.startsWith("Subject:"))?.replace("Subject:", "").trim() || `Follow-up — Warmy.io`;
      const body = lines.filter(l => !l.startsWith("Subject:")).join("\n").trim();
      await callClaude(
        "You are a Gmail automation assistant. Send the email exactly as provided.",
        `Use Gmail MCP to send this email:
To: ${task.contactEmail}
Subject: ${subjectLine}
Body:
${body}

After sending, use HubSpot MCP to:
1. Find the deal/contact for "${task.contactName}" at "${task.company}"
2. Log this email as an activity with today's date
3. Add note: "${fuConfig.label} sent — ${new Date().toLocaleDateString("en-GB")}"`
      );
      onSend(task.id);
    } catch (e) {
      alert("Send failed: " + e.message);
    }
    setSending(false);
  };

  const handlePipeline = async (action) => {
    setPipelining(true);
    const stage = action === "negotiation" ? "Negotiation" : "Closed Lost";
    try {
      await callClaude(
        "You are a HubSpot automation assistant.",
        `Use HubSpot MCP to:
1. Find deal/contact for "${task.contactName}" at "${task.company}"
2. Move deal stage to "${stage}"
3. Add note: "Stage updated to ${stage} by AE Assistant — ${new Date().toLocaleDateString("en-GB")}"
${stage === "Closed Lost" ? '4. Set loss reason: "No response after 4 follow-up attempts over 9 days"' : ""}`
      );
      onPipelineAction(task.id, stage);
    } catch (e) {
      alert("Pipeline update failed: " + e.message);
    }
    setPipelining(false);
  };

  const handleInitialPipeline = async () => {
    setPipelining(true);
    try {
      await callClaude(
        "You are a HubSpot automation assistant.",
        `Use HubSpot MCP to:
1. Find deal/contact for "${task.contactName}" at "${task.company}"
2. Move deal stage to "Price Proposal Sent"
3. Add note: "Stage moved to Price Proposal Sent after meeting on ${task.meetingDate} — AE Assistant"`
      );
      onPipelineAction(task.id, "Price Proposal Sent");
    } catch (e) {
      alert("Pipeline update failed: " + e.message);
    }
    setPipelining(false);
  };

  if (task.status === "sent") {
    return (
      <div style={{ padding: "12px 16px", background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 16 }}>✓</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>{task.contactName}</span>
          <span style={{ fontSize: 12, color: "#475569", marginLeft: 8 }}>{fuConfig.label} sent</span>
        </div>
        <Badge label="DONE" color="#10b981" />
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)", border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 14, overflow: "hidden",
      borderLeft: `3px solid ${urgencyColor}`,
      animation: "slideUp 0.3s ease",
    }}>
      {/* Card header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
      >
        <AEAvatar email={task.ae} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{task.contactName}</span>
            <span style={{ fontSize: 12, color: "#475569" }}>·</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{task.company}</span>
            <Badge label={fuConfig.badge} color={fuConfig.color} />
            {task.daysSinceMeeting >= 6 && <Badge label={`${task.daysSinceMeeting}d`} color={urgencyColor} />}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>
              {aeProfile?.name} · {task.dealValue} · {task.dealStage}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {task.pipelineStatus === "pending" && (
            <Badge label="PIPELINE !" color="#f59e0b" />
          )}
          <span style={{ color: "#334155", fontSize: 14, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>

          {/* Meeting context */}
          <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 8, marginBottom: 14 }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Meeting Context</p>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.65 }}>{task.meetingContext}</p>
          </div>

          {/* Draft area */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>
                {fuConfig.label} Draft
              </p>
              <button
                onClick={handleGenerateDraft}
                disabled={generating}
                style={{
                  fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: generating ? "not-allowed" : "pointer",
                  background: generating ? "rgba(255,255,255,0.05)" : "rgba(245,158,11,0.12)",
                  border: `1px solid ${generating ? "rgba(255,255,255,0.08)" : "rgba(245,158,11,0.3)"}`,
                  color: generating ? "#475569" : "#f59e0b", fontFamily: "'JetBrains Mono', monospace",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {generating ? (
                  <><span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span> Writing…</>
                ) : (
                  draft ? "↻ Regenerate" : "✦ Generate Draft"
                )}
              </button>
            </div>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={`Click "Generate Draft" to write ${fuConfig.label} in ${aeProfile?.name}'s style…`}
              style={{
                width: "100%", minHeight: 160, padding: "12px",
                background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8, color: "#cbd5e1", fontSize: 13, lineHeight: 1.7,
                fontFamily: "'JetBrains Mono', monospace", resize: "vertical",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Actions row */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!draft || sending}
              style={{
                flex: 1, minWidth: 140, padding: "10px 16px", borderRadius: 8,
                background: draft && !sending ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${draft && !sending ? "transparent" : "rgba(255,255,255,0.08)"}`,
                color: draft && !sending ? "#fff" : "#334155",
                fontSize: 13, fontWeight: 600, cursor: draft && !sending ? "pointer" : "not-allowed",
                fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              {sending ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span> Sending…</> : "✉ Send via Gmail"}
            </button>

            {/* Pipeline: initial (FU1 only) */}
            {task.type === "fu1" && task.pipelineStatus === "pending" && (
              <button
                onClick={handleInitialPipeline}
                disabled={pipelining}
                style={{
                  flex: 1, minWidth: 140, padding: "10px 16px", borderRadius: 8,
                  background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                  color: "#f59e0b", fontSize: 13, fontWeight: 600,
                  cursor: pipelining ? "not-allowed" : "pointer",
                  fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                {pipelining ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span> Updating…</> : "→ Move to Proposal Sent"}
              </button>
            )}

            {/* Pipeline: FU4 close or negotiate */}
            {task.type === "fu4" && (
              <>
                <button
                  onClick={() => handlePipeline("negotiation")}
                  disabled={pipelining}
                  style={{
                    padding: "10px 14px", borderRadius: 8,
                    background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                    color: "#10b981", fontSize: 12, fontWeight: 600,
                    cursor: pipelining ? "not-allowed" : "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >→ Negotiation</button>
                <button
                  onClick={() => handlePipeline("close_lost")}
                  disabled={pipelining}
                  style={{
                    padding: "10px 14px", borderRadius: 8,
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                    color: "#ef4444", fontSize: 12, fontWeight: 600,
                    cursor: pipelining ? "not-allowed" : "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >✕ Close Lost</button>
              </>
            )}

            {/* Dismiss */}
            <button
              onClick={() => onDismiss(task.id)}
              style={{
                padding: "10px 12px", borderRadius: 8,
                background: "transparent", border: "1px solid rgba(255,255,255,0.06)",
                color: "#334155", fontSize: 12, cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MeetingAnalysisCard({ analysis }) {
  const [expanded, setExpanded] = useState(false);
  const aeProfile = AE_PROFILES[analysis.ae];
  const scoreColor = analysis.score >= 85 ? "#10b981" : analysis.score >= 75 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, overflow: "hidden", marginBottom: 10,
    }}>
      <div onClick={() => setExpanded(e => !e)} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <AEAvatar email={analysis.ae} size={36} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{analysis.contact}</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>· {analysis.company}</span>
            <Badge label={analysis.type} color={aeProfile?.color || "#64748b"} />
          </div>
          <span style={{ fontSize: 11, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>
            {analysis.date} · {analysis.duration} · {aeProfile?.name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{analysis.score}</div>
            <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>score</div>
          </div>
          <span style={{ color: "#334155", fontSize: 14, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ margin: "12px 0 14px", fontSize: 13, color: "#94a3b8", lineHeight: 1.7, borderLeft: "2px solid rgba(255,255,255,0.1)", paddingLeft: 12 }}>
            {analysis.summary}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 10, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 5 }}>
                <span>✓</span> What went well
              </p>
              {analysis.went_well.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
                  <span style={{ color: "#10b981", fontSize: 11, flexShrink: 0, marginTop: 2 }}>·</span>
                  <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 10, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 5 }}>
                <span>△</span> Could improve
              </p>
              {analysis.improve.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
                  <span style={{ color: "#f59e0b", fontSize: 11, flexShrink: 0, marginTop: 2 }}>·</span>
                  <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════ */
export default function App() {
  const [tasks, setTasks]       = useState(INITIAL_TASKS);
  const [tab, setTab]           = useState("tasks");
  const [aeFilter, setAeFilter] = useState("all");
  const [syncing, setSyncing]   = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const pendingTasks = tasks.filter(t =>
    t.status === "pending" &&
    (aeFilter === "all" || t.ae === aeFilter)
  ).sort((a, b) => b.daysSinceMeeting - a.daysSinceMeeting);

  const sentTasks = tasks.filter(t => t.status === "sent" && (aeFilter === "all" || t.ae === aeFilter));

  const handleDraftGenerated = (id, draft) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, draft } : t));
  };

  const handleSend = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "sent", pipelineStatus: "done" } : t));
  };

  const handlePipelineAction = (id, stage) => {
    setTasks(prev => prev.map(t => t.id === id
      ? { ...t, pipelineStatus: "done", dealStage: stage, status: stage === "Closed Lost" ? "sent" : t.status }
      : t));
  };

  const handleDismiss = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "sent" } : t));
  };

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setLastSync(new Date());
    setSyncing(false);
  };

  const urgentCount = pendingTasks.filter(t => t.daysSinceMeeting >= 6).length;
  const pipelinePending = tasks.filter(t => t.pipelineStatus === "pending").length;

  const AE_LIST = Object.entries(AE_PROFILES).map(([email, p]) => ({ email, ...p }));

  const TAB_CONFIG = [
    { id: "tasks",    label: "Action Queue",      count: pendingTasks.length },
    { id: "pipeline", label: "Pipeline Control",  count: pipelinePending > 0 ? pipelinePending : null },
    { id: "analysis", label: "Meeting Analysis",  count: null },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080b12",
      color: "#f1f5f9",
      fontFamily: "'Outfit', system-ui, sans-serif",
      backgroundImage: "radial-gradient(ellipse 60% 40% at 20% 0%, rgba(59,130,246,0.05) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 80% 100%, rgba(245,158,11,0.04) 0%, transparent 60%)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        textarea:focus { border-color: rgba(59,130,246,0.4) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
        textarea::placeholder { color: #1e293b; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        button { transition: all 0.15s; }
        button:hover:not(:disabled) { opacity: 0.88; }
      `}</style>

      {/* ── TOPBAR ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(8,11,18,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "0 24px", height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Logo */}
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#0a0d14",
          }}>W</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", lineHeight: 1 }}>AE Assistant</div>
            <div style={{ fontSize: 10, color: "#334155", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>Warmy.io · Sales Ops</div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.06)", margin: "0 6px" }} />

          {/* Urgent indicator */}
          {urgentCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.2s ease infinite" }} />
              <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{urgentCount} URGENT</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastSync && <span style={{ fontSize: 11, color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>synced {lastSync.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>}
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: syncing ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)", color: syncing ? "#334155" : "#94a3b8",
              cursor: syncing ? "not-allowed" : "pointer", fontFamily: "'JetBrains Mono', monospace",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span style={{ display: "inline-block", animation: syncing ? "spin 0.8s linear infinite" : "none" }}>⟳</span>
            {syncing ? "Syncing…" : "Sync Avoma"}
          </button>
        </div>
      </div>

      {/* ── TABS + AE FILTER ── */}
      <div style={{
        padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(8,11,18,0.7)",
      }}>
        <div style={{ display: "flex", gap: 0 }}>
          {TAB_CONFIG.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "14px 18px", fontSize: 13, fontWeight: 600,
                background: "transparent", border: "none",
                borderBottom: tab === t.id ? "2px solid #3b82f6" : "2px solid transparent",
                color: tab === t.id ? "#f1f5f9" : "#475569",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              }}
            >
              {t.label}
              {t.count !== null && t.count > 0 && (
                <span style={{
                  fontSize: 10, padding: "1px 6px", borderRadius: 10,
                  background: tab === t.id ? "#3b82f6" : "rgba(255,255,255,0.08)",
                  color: tab === t.id ? "#fff" : "#64748b",
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* AE filter */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>VIEW AS</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => setAeFilter("all")}
              style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: aeFilter === "all" ? "rgba(255,255,255,0.08)" : "transparent",
                border: `1px solid ${aeFilter === "all" ? "rgba(255,255,255,0.12)" : "transparent"}`,
                color: aeFilter === "all" ? "#f1f5f9" : "#475569", cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >ALL</button>
            {AE_LIST.map(ae => (
              <button
                key={ae.email}
                onClick={() => setAeFilter(ae.email)}
                title={ae.name}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: aeFilter === ae.email ? `${ae.color}25` : "transparent",
                  border: `1.5px solid ${aeFilter === ae.email ? ae.color : "rgba(255,255,255,0.06)"}`,
                  color: ae.color, fontSize: 10, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >{ae.initials}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px 48px" }}>

        {/* ════ ACTION QUEUE ════ */}
        {tab === "tasks" && (
          <div style={{ animation: "slideUp 0.3s ease" }}>
            {/* Summary strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
              {[
                { label: "Pending",  val: pendingTasks.length,  color: "#3b82f6" },
                { label: "Urgent",   val: urgentCount,           color: "#ef4444" },
                { label: "Sent",     val: sentTasks.length,      color: "#10b981" },
                { label: "Pipeline", val: pipelinePending,       color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, borderTop: `2px solid ${s.color}` }}>
                  <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#f8fafc", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Follow-up legend */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {Object.entries(FU_CONFIG).map(([key, cfg]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: `${cfg.color}10`, border: `1px solid ${cfg.color}25` }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color }} />
                  <span style={{ fontSize: 11, color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>{cfg.badge} — Day {cfg.day}</span>
                </div>
              ))}
            </div>

            {/* Task cards */}
            {pendingTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px", color: "#334155" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Action queue is clear</div>
                <div style={{ fontSize: 13, color: "#334155" }}>Sync Avoma to check for new completed meetings</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pendingTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDraftGenerated={handleDraftGenerated}
                    onSend={handleSend}
                    onPipelineAction={handlePipelineAction}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            )}

            {/* Sent/done */}
            {sentTasks.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Completed today</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {sentTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDraftGenerated={handleDraftGenerated}
                      onSend={handleSend}
                      onPipelineAction={handlePipelineAction}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ PIPELINE CONTROL ════ */}
        {tab === "pipeline" && (
          <div style={{ animation: "slideUp 0.3s ease" }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", marginBottom: 4 }}>Pipeline Control</h2>
              <p style={{ fontSize: 13, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>HubSpot stage management — click to push deals forward</p>
            </div>

            {/* Pipeline stages visual */}
            <div style={{ display: "flex", gap: 3, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
              {["Demo Done", "Price Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"].map((stage, i) => {
                const count = tasks.filter(t => t.dealStage === stage).length;
                const colors = ["#64748b", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"];
                return (
                  <div key={stage} style={{ flex: 1, minWidth: 100 }}>
                    <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderTop: `2px solid ${colors[i]}`, borderRadius: 8, textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: colors[i], fontFamily: "'JetBrains Mono', monospace" }}>{count}</div>
                      <div style={{ fontSize: 10, color: "#475569", marginTop: 2, lineHeight: 1.3 }}>{stage}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Deal list with pipeline actions */}
            {tasks.filter(t => aeFilter === "all" || t.ae === aeFilter).map(task => {
              const aeProfile = AE_PROFILES[task.ae];
              const meta = FU_CONFIG[task.type];
              return (
                <div key={task.id} style={{
                  padding: "14px 16px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, marginBottom: 8, display: "flex", alignItems: "center", gap: 12,
                }}>
                  <AEAvatar email={task.ae} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{task.contactName}</span>
                      <span style={{ fontSize: 12, color: "#475569" }}>· {task.company}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <span style={{ fontSize: 11, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>{aeProfile?.name}</span>
                      <span style={{ fontSize: 11, color: "#334155" }}>·</span>
                      <span style={{ fontSize: 11, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>{task.dealValue}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge label={task.dealStage} color={
                      task.dealStage === "Closed Won" ? "#10b981" :
                      task.dealStage === "Closed Lost" ? "#ef4444" :
                      task.dealStage === "Negotiation" ? "#f59e0b" : "#3b82f6"
                    } />
                    {task.pipelineStatus === "pending" && (
                      <Badge label="NEEDS UPDATE" color="#f59e0b" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ════ MEETING ANALYSIS ════ */}
        {tab === "analysis" && (
          <div style={{ animation: "slideUp 0.3s ease" }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", marginBottom: 4 }}>Meeting Analysis</h2>
              <p style={{ fontSize: 13, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>AI-generated from Avoma transcripts — what each AE did well and where to improve</p>
            </div>

            {/* Team score overview */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 24 }}>
              {Object.entries(AE_PROFILES).map(([email, ae]) => {
                const aeAnalyses = MEETING_ANALYSES.filter(a => a.ae === email);
                if (aeAnalyses.length === 0) return null;
                const avgScore = Math.round(aeAnalyses.reduce((s, a) => s + a.score, 0) / aeAnalyses.length);
                const scoreColor = avgScore >= 85 ? "#10b981" : avgScore >= 75 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={email} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                    <AEAvatar email={email} size={40} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 2 }}>{ae.name}</div>
                      <div style={{ fontSize: 11, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>{aeAnalyses.length} meetings analysed</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: scoreColor, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{avgScore}</div>
                      <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>avg score</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Analysis cards */}
            {MEETING_ANALYSES
              .filter(a => aeFilter === "all" || a.ae === aeFilter)
              .map(a => <MeetingAnalysisCard key={a.id} analysis={a} />)
            }
          </div>
        )}
      </div>
    </div>
  );
}
