import { useState, useRef, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   REAL CONTEXT FROM AVOMA TRANSCRIPTS
   ───────────────────────────────────────────── */
const SAID_STYLE = {
  greeting: "Hi [Name],",
  closing: "Cheers,\nSaid",
  tone: "direct, warm, consultative",
  avgWords: 75,
  patterns: [
    "Yeah I mean, look —",
    "Alright, so here's the thing:",
    "Exactly, and by the way,",
    "So just to make sure I understand,",
  ],
  cta: "Does [time] work for a quick call?",
  notes:
    "Concise. Personalized to their exact use case. Never sounds templated. Mentions specific features relevant to them (SES integration, seed list, expert). Moves fast to next steps.",
};

const TEAM = [
  { name: "Said Karaca",     email: "saidk@warmy.io",   role: "Head of Sales",        avatar: "SK" },
  { name: "Gokhan Koluman",  email: "gokhank@warmy.io", role: "AE",                   avatar: "GK" },
  { name: "Jorge Marttins",  email: "jorget@warmy.io",  role: "AE",                   avatar: "JM" },
  { name: "Felipe Vargas",   email: "felipev@warmy.io", role: "AE",                   avatar: "FV" },
  { name: "Sofiia Rapatska", email: "sofiiar@warmy.io", role: "AE / Demo",            avatar: "SR" },
  { name: "James Pinhorn",   email: "jamesp@warmy.io",  role: "SDR / BDR Head",       avatar: "JP" },
];

// Pre-seeded from real Avoma transcripts — enriched with exact deal context
const SEEDED_DEALS = [
  {
    id: "MAX_001",
    contactName: "Max Nyirenda",
    contactEmail: "max.nyirenda@goinspire.co.uk",
    company: "GoInspire (EE campaign)",
    dealStage: "Proposal Sent",
    type: "Upsell",
    daysSinceEmail: 2,
    hasReply: false,
    action: "followup_2",
    ae: "Said Karaca",
    value: "$1,900/mo or $19k/yr",
    context:
      "Two calls total. Demo (May 13) + upsell (May 14). Wants 2 new domains warmed — 10k daily seed list via Amazon SES integration. 400–500k campaign for EE telecom. Offered 15% discount ($1,600/mo) in exchange for testimonial. Needs CTO (Sat) approval. Said promised to send comparison email (seed list vs standard) so Max can forward to Sat. Annual option: $16k/yr.",
    nextStep: "Send comparison email seed list vs standard. Max forwards to Sat for CTO sign-off.",
    avomaMeetingId: "aa548486-2b2f-460b-b777-db27917619c0",
  },
  {
    id: "BILL_001",
    contactName: "Bill Bowden",
    contactEmail: "bill@maior.ai",
    company: "maior.ai (lending)",
    dealStage: "Demo Done",
    type: "New Business",
    daysSinceEmail: 1,
    hasReply: false,
    action: "initial_followup",
    ae: "Gokhan Koluman",
    value: "~$25–39/mailbox/mo, 5 mailboxes, annual",
    context:
      "Gokhan + Sofiia demo May 14. Apollo cold outreach, HTML emails tanked deliverability. Google Workspace, 5 mailboxes, 50 emails/day. Comparing vs MX Tools ($129/mo). Bill said 'sounds extremely fair' and committed to annual. Needs to run by founder/CEO. Expected decision: next day (May 15). Gokhan offered $39/mo per mailbox (~$25 annual).",
    nextStep: "Follow up — Bill said he'd have answer 'by tomorrow afternoon'. Check in on CEO sign-off.",
    avomaMeetingId: "c014a5a1-ae9b-4131-a15f-691f274b6dd1",
  },
  {
    id: "JACK_001",
    contactName: "Jamie Anderson",
    contactEmail: "jamie.anderson@kodiakhub.com",
    company: "KodiakHub",
    dealStage: "Proposal Sent",
    type: "New Business",
    daysSinceEmail: 2,
    hasReply: false,
    action: "followup_2",
    ae: "Gokhan Koluman",
    value: "$4,500/yr (30 mailboxes)",
    context:
      "Jack Butzu (GTM Engineer) + Jamie Anderson (IT) from Stockholm. May 13 demo. 10 SDRs, ~50 emails/day, Microsoft 365, using Growth Machine + HubSpot sequences. Never done warming. Offered 30 mailboxes × $15/mo = $450/mo or $4,500/yr. Jamie wants to take to CFO. Timeline: end of May. Also cc Jack Butzu (jack.butzu@kodiakhub.com).",
    nextStep: "Check in with Jamie — did CFO approve? End of month timeline.",
    avomaMeetingId: "5cb81583-90a8-465a-bde1-346e6f24556f",
  },
  {
    id: "DORIAN_001",
    contactName: "Dorian Lesnic",
    contactEmail: "dorian@cardneto.com",
    company: "Cardneto (event app startup)",
    dealStage: "Closed Won ✓",
    type: "New Business",
    daysSinceEmail: 0,
    hasReply: true,
    action: "none",
    ae: "Gokhan Koluman",
    value: "$100/mo (6 mailboxes — 1 FS6 trial)",
    context:
      "Closed on the call May 13. Moldovan startup building event networking app. Signed up and completed payment live during demo. 6 mailboxes, $20/mailbox × 5 + 1 FS6 trial free for 3 months. Then $120/mo after. Dorian said it was 'one of the smoothest sales experiences he'd had' and asked Gokhan for sales advice. Already booked onboarding.",
    nextStep: "No action needed — onboarding scheduled.",
    avomaMeetingId: "bef34772-56f8-4c24-9554-66fb5de47382",
  },
  {
    id: "CLEM_001",
    contactName: "Clem O",
    contactEmail: "truemediaplace@gmail.com",
    company: "TrueMediaPlace",
    dealStage: "Onboarding",
    type: "Expansion",
    daysSinceEmail: 0,
    hasReply: true,
    action: "none",
    ae: "Said Karaca",
    value: "Enterprise (1M emails/day)",
    context:
      "Already a customer. Onboarding call May 14 with Said + Felipe. 5 active domains using GreenArrow (Amazon SES-based). Plans to send 1M opt-in emails/day. Sweepstakes niche. Alina Shpak is their CSM. Said handed off to Alina for weekly domain health reviews. Also has Kyle as a contact.",
    nextStep: "Alina's onboarding — no sales follow-up needed.",
    avomaMeetingId: "e800d40d-6d69-493c-a252-6b6d988be6b5",
  },
];

/* ─────────────────────────────────────────────
   MCP / API CONFIG
   ───────────────────────────────────────────── */
const MCP_SERVERS = [
  { type: "url", url: "https://mcp.hubspot.com/anthropic",       name: "hubspot"  },
  { type: "url", url: "https://gmailmcp.googleapis.com/mcp/v1",  name: "gmail"    },
];

async function callClaude(system, prompt, extra = {}) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system,
    messages: [{ role: "user", content: prompt }],
    mcp_servers: MCP_SERVERS,
    ...extra,
  };
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`API ${r.status}`);
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
}

/* ─────────────────────────────────────────────
   FOLLOW-UP EMAIL TEMPLATES (Said's real style)
   ───────────────────────────────────────────── */
function buildEmailPrompt(deal, type) {
  const instrMap = {
    initial_followup: `Post-meeting follow-up. Recap the 2-3 exact things discussed on the call (use the context provided). Confirm next steps. Warm, direct, no fluff. Under 80 words.`,
    followup_2: `3-day check-in. Reference the previous email briefly. Very low pressure. Ask one direct question to keep things moving. Under 60 words.`,
    followup_3: `6-day final check-in. Honest and direct. Say you're checking in one last time before moving on. Make it easy to say yes or no. Under 50 words.`,
  };

  return `
You are Said Karaca, Head of Sales at Warmy.io. Write a ${type.replace("_", " ")} email for this deal.

YOUR STYLE:
- Greeting: "${SAID_STYLE.greeting}"
- Closing: "${SAID_STYLE.closing}"
- Tone: ${SAID_STYLE.tone}
- Length: ~${SAID_STYLE.avgWords} words
- Never sounds templated. Specific to their exact situation.
- Mentions Warmy features relevant to THEIR use case only.

DEAL CONTEXT:
- Contact: ${deal.contactName} at ${deal.company}
- Email: ${deal.contactEmail}
- Deal type: ${deal.type}
- Stage: ${deal.dealStage}
- What was discussed: ${deal.context}
- Next step needed: ${deal.nextStep}
- AE who ran the call: ${deal.ae}

INSTRUCTIONS: ${instrMap[type] || instrMap.initial_followup}

CRITICAL: Do NOT be generic. Reference the specific things from the call context above.
Output ONLY the email — subject line first (prefix with "Subject: "), then body. Nothing else.
`.trim();
}

/* ─────────────────────────────────────────────
   AUTOPILOT ENGINE
   ───────────────────────────────────────────── */
async function runAutopilotEngine({ deals, onLog, onStat, onDealUpdate }) {
  const actionable = deals.filter(d => d.action !== "none");
  const toEmail    = actionable.filter(d => d.action !== "close_lost");
  const toClose    = actionable.filter(d => d.action === "close_lost");

  onLog("Autopilot starting — " + actionable.length + " deals require action", "info");

  // ── SEND EMAILS ──────────────────────────────
  for (const deal of toEmail) {
    const label = { initial_followup: "post-meeting", followup_2: "3-day follow-up", followup_3: "6-day final" }[deal.action];
    onLog(`Drafting ${label} → ${deal.contactName}…`, "info");
    try {
      const emailDraft = await callClaude(
        "You are Said Karaca's sales automation assistant. Generate and send follow-up emails in his exact style.",
        buildEmailPrompt(deal, deal.action) + `\n\nAfter generating the email:\n1. Use Gmail MCP to SEND it to ${deal.contactEmail}\n2. Use HubSpot MCP to log this email as an activity on the deal named "${deal.company}" or contact "${deal.contactName}", and update last contact date to today.`
      );
      onLog(`✓ Sent to ${deal.contactName} (${deal.company})`, "success");
      onStat("sent");
      onStat("updated");
      onDealUpdate(deal.id, "email_sent", emailDraft);
    } catch (e) {
      onLog(`✗ Failed for ${deal.contactName}: ${e.message}`, "error");
    }
  }

  // ── CLOSE LOST ───────────────────────────────
  for (const deal of toClose) {
    onLog(`Closing "${deal.company}" — ${deal.daysSinceEmail}d, no reply`, "warning");
    try {
      await callClaude(
        "You are Said's sales automation assistant. Clean HubSpot pipeline.",
        `Use HubSpot MCP to:
1. Find the deal for contact "${deal.contactName}" at "${deal.company}"
2. Move it to "Closed Lost"
3. Add note: "Auto-closed — 3 follow-up sequences over 9 days with no response from ${deal.contactEmail}. Closed ${new Date().toLocaleDateString("en-GB")} by Autopilot."
4. Set loss reason: "No response"`
      );
      onLog(`Closed: "${deal.company}"`, "info");
      onStat("closedLost");
      onDealUpdate(deal.id, "closed_lost");
    } catch (e) {
      onLog(`✗ Failed closing ${deal.company}: ${e.message}`, "error");
    }
  }

  onLog("Autopilot complete.", "success");
}

/* ─────────────────────────────────────────────
   ACTION META
   ───────────────────────────────────────────── */
const ACTION = {
  initial_followup: { label: "Post-meeting",   color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  followup_2:       { label: "Follow-up #2",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  followup_3:       { label: "Follow-up #3 ⚠", color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
  close_lost:       { label: "Close Lost",      color: "#6b7280", bg: "rgba(107,114,128,0.12)"},
  none:             { label: "Up to date",      color: "#10b981", bg: "rgba(16,185,129,0.12)" },
};

const LOG_COLOR = { success: "#10b981", error: "#ef4444", warning: "#f59e0b", info: "#94a3b8" };

/* ─────────────────────────────────────────────
   COMPONENTS
   ───────────────────────────────────────────── */
function Avatar({ initials, size = 32, color = "#f59e0b" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${color}22`, border: `1.5px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 600, color, flexShrink: 0,
      fontFamily: "'DM Mono', monospace",
    }}>{initials}</div>
  );
}

function Badge({ label, color, bg }) {
  return (
    <span style={{
      fontSize: 11, padding: "3px 9px", borderRadius: 4,
      background: bg, color, border: `1px solid ${color}33`,
      fontWeight: 600, letterSpacing: "0.02em", whiteSpace: "nowrap",
      fontFamily: "'DM Mono', monospace",
    }}>{label}</span>
  );
}

function StatCard({ label, value, accent = "#f59e0b" }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10, padding: "14px 16px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accent}, transparent)`,
      }} />
      <p style={{ margin: 0, fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 700, color: "#f8fafc", fontFamily: "'Sora', sans-serif" }}>{value}</p>
    </div>
  );
}

function StepBar({ steps, currentStep, isDone }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
      {steps.map((s, i) => {
        const done   = isDone || i < currentStep;
        const active = !isDone && i === currentStep;
        return (
          <div key={i} style={{ flex: 1, position: "relative" }}>
            <div style={{
              padding: "6px 8px", borderRadius: 6, fontSize: 11,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              background: done ? "rgba(16,185,129,0.12)" : active ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${done ? "rgba(16,185,129,0.3)" : active ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.07)"}`,
              color: done ? "#10b981" : active ? "#f59e0b" : "#475569",
              fontFamily: "'DM Mono', monospace",
              animation: active ? "pulse-border 1.5s ease-in-out infinite" : "none",
            }}>
              {done ? "✓ " : active ? "⟳ " : ""}{s}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DealRow({ deal, onEdit }) {
  const meta = ACTION[deal.action] || ACTION.none;
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: "flex", alignItems: "center", padding: "12px 16px", gap: 12,
          cursor: "pointer", transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <Avatar initials={deal.contactName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()} size={34} color={meta.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#f1f5f9", fontFamily: "'Sora', sans-serif" }}>
              {deal.contactName}
            </p>
            <span style={{ fontSize: 12, color: "#475569", fontFamily: "'DM Mono', monospace" }}>· {deal.company}</span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#475569", fontFamily: "'DM Mono', monospace" }}>
            {deal.ae} · {deal.value} · {deal.daysSinceEmail}d ago
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge label={meta.label} color={meta.color} bg={meta.bg} />
          <span style={{ color: "#475569", fontSize: 12, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
      </div>

      {expanded && (
        <div style={{
          padding: "0 16px 14px 62px",
          animation: "fade-in 0.2s ease",
        }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b", lineHeight: 1.6, fontFamily: "'Sora', sans-serif" }}>
            {deal.context}
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#f59e0b", fontFamily: "'DM Mono', monospace" }}>→ {deal.nextStep}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {Object.entries(ACTION).filter(([k]) => k !== "none").map(([k, v]) => (
              <button
                key={k}
                onClick={e => { e.stopPropagation(); onEdit(deal.id, k); }}
                style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 4, cursor: "pointer",
                  background: deal.action === k ? v.bg : "transparent",
                  border: `1px solid ${deal.action === k ? v.color + "55" : "rgba(255,255,255,0.08)"}`,
                  color: deal.action === k ? v.color : "#475569",
                  fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
                }}
              >{v.label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
   ───────────────────────────────────────────── */
export default function App() {
  const [tab, setTab]           = useState("autopilot");
  const [deals, setDeals]       = useState(SEEDED_DEALS);
  const [status, setStatus]     = useState("idle"); // idle | running | done | error
  const [currentStep, setStep]  = useState(-1);
  const [log, setLog]           = useState([]);
  const [stats, setStats]       = useState({ sent: 0, updated: 0, closedLost: 0 });
  const [emailDrafts, setDrafts]= useState({});
  const logRef = useRef(null);

  const addLog = useCallback((msg, type = "info") => {
    const ts = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLog(prev => [...prev, { msg, type, ts }]);
  }, []);

  const bumpStat = useCallback((key) => setStats(s => ({ ...s, [key]: s[key] + 1 })), []);

  const updateDeal = useCallback((id, status, draft) => {
    if (draft) setDrafts(prev => ({ ...prev, [id]: draft }));
    if (status === "closed_lost")
      setDeals(prev => prev.map(d => d.id === id ? { ...d, action: "none", dealStage: "Closed Lost" } : d));
    else if (status === "email_sent")
      setDeals(prev => prev.map(d => d.id === id ? { ...d, daysSinceEmail: 0 } : d));
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const editDealAction = (id, newAction) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, action: newAction } : d));
  };

  const handleRun = async () => {
    setStatus("running");
    setStep(0);
    setLog([]);
    setStats({ sent: 0, updated: 0, closedLost: 0 });

    try {
      await runAutopilotEngine({
        deals,
        onLog: addLog,
        onStat: bumpStat,
        onDealUpdate: updateDeal,
      });
      setStatus("done");
      setStep(5);
    } catch (e) {
      addLog("Fatal error: " + e.message, "error");
      setStatus("error");
    }
  };

  const isRunning = status === "running";
  const isDone    = status === "done";
  const isError   = status === "error";
  const actionable = deals.filter(d => d.action !== "none");
  const totalPipeline = deals.filter(d => !["none", "close_lost"].includes(d.action) || d.dealStage !== "Closed Lost");

  const STEPS = ["Read pipeline", "Draft emails", "Send via Gmail", "Log to HubSpot", "Clean pipeline"];

  const TABS = [
    { id: "autopilot", label: "Autopilot" },
    { id: "pipeline",  label: "Pipeline Intel" },
    { id: "team",      label: "Team" },
    { id: "style",     label: "Said's Style" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0d14",
      color: "#f1f5f9",
      fontFamily: "'Sora', sans-serif",
      backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.06) 0%, transparent 70%)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse-border { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes fade-in { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slide-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .tab-btn { background:none;border:none;cursor:pointer;padding:8px 16px;font-size:13px;font-weight:500;border-radius:8px;transition:all 0.15s;font-family:'Sora',sans-serif; }
        .tab-btn:hover { background:rgba(255,255,255,0.05); }
        .run-btn { width:100%;padding:16px;font-size:15px;font-weight:600;cursor:pointer;border-radius:12px;border:none;transition:all 0.2s;font-family:'Sora',sans-serif;letter-spacing:0.01em; }
        .run-btn:hover { transform:translateY(-1px);box-shadow:0 8px 32px rgba(245,158,11,0.25); }
        .run-btn:active { transform:translateY(0); }
        .run-btn:disabled { opacity:0.5;cursor:not-allowed;transform:none; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#1e293b;border-radius:4px; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56, background: "rgba(10,13,20,0.95)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#0a0d14",
          }}>W</div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#f8fafc" }}>Warmy Autopilot</span>
          <span style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace", marginLeft: 4 }}>Said Karaca · Head of Sales</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isDone && <Badge label="Run complete" color="#10b981" bg="rgba(16,185,129,0.12)" />}
          {isError && <Badge label="Error" color="#ef4444" bg="rgba(239,68,68,0.12)" />}
          {isRunning && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", animation: "pulse-border 1s infinite" }} />
              <span style={{ fontSize: 12, color: "#f59e0b", fontFamily: "'DM Mono', monospace" }}>RUNNING</span>
            </div>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ padding: "12px 24px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 4 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className="tab-btn"
            onClick={() => setTab(t.id)}
            style={{
              color: tab === t.id ? "#f59e0b" : "#64748b",
              background: tab === t.id ? "rgba(245,158,11,0.08)" : "transparent",
              borderBottom: tab === t.id ? "2px solid #f59e0b" : "2px solid transparent",
              borderRadius: "8px 8px 0 0",
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: 24, maxWidth: 780, margin: "0 auto" }}>

        {/* ════ AUTOPILOT TAB ════ */}
        {tab === "autopilot" && (
          <div style={{ animation: "slide-up 0.3s ease" }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
              <StatCard label="Actionable deals" value={actionable.length} accent="#f59e0b" />
              <StatCard label="Emails sent"      value={stats.sent}        accent="#3b82f6" />
              <StatCard label="CRM updated"      value={stats.updated}     accent="#8b5cf6" />
              <StatCard label="Closed lost"      value={stats.closedLost}  accent="#ef4444" />
            </div>

            {/* Step bar */}
            {(isRunning || isDone) && (
              <StepBar steps={STEPS} currentStep={currentStep} isDone={isDone} />
            )}

            {/* Main CTA */}
            {!isRunning ? (
              <div style={{ marginBottom: 24 }}>
                <button
                  className="run-btn"
                  onClick={handleRun}
                  style={{
                    background: isDone
                      ? "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))"
                      : "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: isDone ? "#10b981" : "#0a0d14",
                    border: isDone ? "1px solid rgba(16,185,129,0.3)" : "none",
                  }}
                >
                  {isRunning ? "Running…" : isDone ? "✓ Run Autopilot Again" : "▶  Activate Autopilot"}
                </button>
                {!isDone && !isError && (
                  <p style={{ margin: "10px 0 0", fontSize: 12, color: "#475569", textAlign: "center", fontFamily: "'DM Mono', monospace" }}>
                    Reads {actionable.length} open deals · writes follow-ups in Said's voice · logs to HubSpot · closes stale deals
                  </p>
                )}
              </div>
            ) : (
              <div style={{
                marginBottom: 24, padding: "12px 16px", borderRadius: 10,
                background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ width: 16, height: 16, border: "2px solid #f59e0b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 500 }}>Autopilot running — keep this tab open</span>
              </div>
            )}

            {/* Deal queue */}
            {actionable.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                    Action Queue
                  </p>
                  <span style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{actionable.length} deals</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
                  {actionable.map((deal, i) => (
                    <DealRow key={deal.id} deal={deal} onEdit={editDealAction} />
                  ))}
                </div>
              </div>
            )}

            {/* Activity log */}
            {log.length > 0 && (
              <div>
                <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                  Activity Log
                </p>
                <div
                  ref={logRef}
                  style={{
                    background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10, padding: "12px 14px", maxHeight: 220, overflowY: "auto",
                    fontFamily: "'DM Mono', monospace", fontSize: 12,
                  }}
                >
                  {log.map((e, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 4, alignItems: "flex-start", lineHeight: 1.5 }}>
                      <span style={{ color: "#334155", flexShrink: 0 }}>{e.ts}</span>
                      <span style={{ color: LOG_COLOR[e.type] || "#64748b" }}>{e.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email drafts preview */}
            {Object.keys(emailDrafts).length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                  Sent Emails
                </p>
                {Object.entries(emailDrafts).map(([id, draft]) => {
                  const d = deals.find(x => x.id === id);
                  return d ? (
                    <div key={id} style={{ marginBottom: 12, padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 12, color: "#f59e0b", fontFamily: "'DM Mono', monospace" }}>{d.contactName} · {d.company}</p>
                      <pre style={{ margin: 0, fontSize: 12, color: "#94a3b8", whiteSpace: "pre-wrap", fontFamily: "'DM Mono', monospace", lineHeight: 1.6 }}>{draft.slice(0, 400)}{draft.length > 400 ? "…" : ""}</pre>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}

        {/* ════ PIPELINE INTEL TAB ════ */}
        {tab === "pipeline" && (
          <div style={{ animation: "slide-up 0.3s ease" }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>Pipeline Intelligence</p>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>
                Pre-loaded from Avoma transcripts — May 1–14
              </p>
            </div>

            {/* Summary row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
              <StatCard label="Open deals"    value={deals.filter(d => d.action !== "none" && d.dealStage !== "Closed Won ✓" && d.dealStage !== "Closed Lost").length} accent="#f59e0b" />
              <StatCard label="Closed won"    value={deals.filter(d => d.dealStage === "Closed Won ✓").length}  accent="#10b981" />
              <StatCard label="Need action"   value={actionable.length} accent="#ef4444" />
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
              {deals.map((deal, i) => {
                const meta = ACTION[deal.action] || ACTION.none;
                return (
                  <div key={deal.id} style={{ borderBottom: i < deals.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <div style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <Avatar
                        initials={deal.contactName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        size={36}
                        color={meta.color}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{deal.contactName}</span>
                          <span style={{ fontSize: 12, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{deal.company}</span>
                          <Badge label={meta.label} color={meta.color} bg={meta.bg} />
                        </div>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>AE: {deal.ae}</span>
                          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>Value: {deal.value}</span>
                          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>Stage: {deal.dealStage}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.6, fontFamily: "'Sora', sans-serif" }}>
                          {deal.context.slice(0, 180)}…
                        </p>
                        {deal.nextStep && deal.action !== "none" && (
                          <p style={{ margin: "6px 0 0", fontSize: 11, color: "#f59e0b", fontFamily: "'DM Mono', monospace" }}>
                            → {deal.nextStep}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ TEAM TAB ════ */}
        {tab === "team" && (
          <div style={{ animation: "slide-up 0.3s ease" }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>Sales Team</p>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>Warmy.io · Tel Aviv / Remote</p>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {TEAM.map(m => (
                <div key={m.email} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12,
                }}>
                  <Avatar initials={m.avatar} size={40} color={m.name === "Said Karaca" ? "#f59e0b" : "#64748b"} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>
                      {m.name}
                      {m.name === "Said Karaca" && <span style={{ marginLeft: 8, fontSize: 10, color: "#f59e0b", fontFamily: "'DM Mono', monospace", verticalAlign: "middle" }}>YOU</span>}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{m.role} · {m.email}</p>
                  </div>
                  {/* Deal count for this AE */}
                  {(() => {
                    const count = deals.filter(d => d.ae === m.name && d.action !== "none").length;
                    return count > 0 ? (
                      <Badge label={`${count} open`} color="#f59e0b" bg="rgba(245,158,11,0.08)" />
                    ) : null;
                  })()}
                </div>
              ))}
            </div>

            {/* Deal ownership breakdown */}
            <div style={{ marginTop: 20 }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                Deal Ownership
              </p>
              {TEAM.filter(m => deals.some(d => d.ae === m.name)).map(m => {
                const aeDeals = deals.filter(d => d.ae === m.name);
                return (
                  <div key={m.email} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{m.name}</span>
                      <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{aeDeals.length} deals</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(aeDeals.length / deals.length) * 100}%`, background: m.name === "Said Karaca" ? "#f59e0b" : "#3b82f6", borderRadius: 2, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ STYLE TAB ════ */}
        {tab === "style" && (
          <div style={{ animation: "slide-up 0.3s ease" }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>Said's Email Style</p>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>
                Learned from Avoma transcripts + Gmail sent history
              </p>
            </div>

            {/* Style cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Tone",          value: SAID_STYLE.tone },
                { label: "Avg length",    value: `~${SAID_STYLE.avgWords} words` },
                { label: "Greeting",      value: SAID_STYLE.greeting },
                { label: "Sign-off",      value: SAID_STYLE.closing.replace(/\n/g, " · ") },
              ].map(s => (
                <div key={s.label} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#f1f5f9" }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Opening patterns */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                Signature Opening Patterns
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SAID_STYLE.patterns.map((p, i) => (
                  <span key={i} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", fontFamily: "'DM Mono', monospace", fontStyle: "italic" }}>
                    "{p}"
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, marginBottom: 20 }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em" }}>Style Notes</p>
              <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>{SAID_STYLE.notes}</p>
            </div>

            {/* Email template preview */}
            <div>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                Example Follow-up (Max Nyirenda)
              </p>
              <div style={{ padding: "16px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 1.8, color: "#94a3b8" }}>
                <span style={{ color: "#475569" }}>Subject: </span><span style={{ color: "#f1f5f9" }}>Re: Warmy seed list — quick update for Sat</span><br /><br />
                <span style={{ color: "#f1f5f9" }}>Hi Max,</span><br /><br />
                Putting together the breakdown you mentioned so you can send it straight to Sat. Short version: seed list gives you browser-based engagement with click tracking — which is exactly what you need for the EE campaigns. Standard plan can't do that.<br /><br />
                For 10k seeds across both domains: <span style={{ color: "#f59e0b" }}>$1,600/mo</span> (with the 15% testimonial discount), or <span style={{ color: "#f59e0b" }}>$16k/yr</span> with 2 months free.<br /><br />
                Happy to jump on a 10-min call with Sat if that would move things along — just say the word.<br /><br />
                Cheers,<br />Said
              </div>
            </div>
          </div>
        )}at t

      </div>
    </div>
  );
}