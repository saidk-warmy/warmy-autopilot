import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════
   AE STYLE PROFILES — learned from Avoma transcripts
═══════════════════════════════════════════════════════ */
// ── AE PROFILES — enriched from Avoma transcripts + HubSpot + Gmail ──────────
// HubSpot May 1-17 closed won: Sofiia=38 deals $28k | Said=9 deals $26k | Felipe=24 deals $6k | Jorge=18 deals $3.3k | Gokhan=8 deals $795
// Total closed pipeline (all time): 866 deals across AE team
const AE_PROFILES = {
  "saidk@warmy.io": {
    name: "Said Karaca", initials: "SK", color: "#f59e0b",
    greeting: "Hi [Name],", closing: "Cheers,\nSaid",
    tone: "direct, warm, consultative. Gets to the point fast. References exact things discussed. CC's Felipe on complex pricing threads. Confident with enterprise and upsell deals.",
    avgWords: 75, role: "Head of Sales",
    phrases: ["Yeah I mean, look —", "Alright, so here's the thing:", "Exactly, and by the way,", "Let me add Felipe here to help with pricing"],
    // HubSpot stats (May 1-17): 9 closed won | $26,272 revenue | $2,919 avg deal size
    // Biggest deals: Kyle ($7k), Brilliant Marketing ($7.1k upsell), Josef Lock ($2k), Kyberdirect ($1.2k+$0.9k upsell), GoInspire ($1.272k upsell)
    // Pattern: Said handles high-value enterprise + upsell deals. Avg deal size ($2,919) is highest on the team.
    // Gmail: Has weekly 1-1s with Felipe. Escalates complex prospects to Felipe for pricing. Daniel Shnaider (CEO) often escalates inbound to Said first.
    // Probation review meeting with Felipe on May 14 — Felipe is on probation period.
    stats: { deals_may: 9, revenue_may: 26272, avg_deal_may: 2919, rank_revenue: 2 },
  },
  "gokhank@warmy.io": {
    name: "Gokhan Koluman", initials: "GK", color: "#3b82f6",
    greeting: "Hi [Name],", closing: "Best,\nGokhan",
    tone: "educational, structured, rapport-first. Closes on the call frequently. Explains the 'why' behind everything. Uses personal connection (shared geography, pub prices, local references) to warm up quickly. Adjusts depth based on prospect's technical level.",
    avgWords: 100, role: "AE",
    phrases: ["Just to clarify,", "As I mentioned on the call,", "When it comes to", "How does that sound?"],
    closingStyle: "Closes live on the call. Sends payment link during the meeting. Books onboarding before ending the call.",
    // HubSpot stats (May 1-17): 8 closed won | $795 revenue | $99 avg deal size
    // Note: Gokhan's low revenue/avg is misleading — he closes MANY calls live (Phil $49, Ben $49, Dorian $100, Reneldy $90)
    // High volume of small-deal live closes. Strength = rapport + live close. Gap = deal sizing (spends 59 min on $100 deals).
    // Confirmed from transcripts: live closes on Phil Mold (recruited), Dorian Lesnic (Cardneto), Ben Leaf9, Freddie PzeroTalent
    stats: { deals_may: 8, revenue_may: 795, avg_deal_may: 99, rank_revenue: 5 },
    coaching_notes: "Gokhan needs to qualify deal size earlier — 59 minutes on a $100 deal is a time management issue. His rapport skills are exceptional and he should focus on larger accounts where his live-close ability creates more leverage.",
  },
  "felipev@warmy.io": {
    name: "Felipe Vargas", initials: "FV", color: "#10b981",
    greeting: "Hey [Name],", closing: "Cheers,\nFelipe",
    tone: "warm, conversational, Brazilian energy. Builds personal rapport fast. Uses 'man', 'brother', 'cool'. Drops prices boldly. Ends with hard deadlines. CC's Said on complex threads.",
    avgWords: 80, role: "AE",
    phrases: ["Then again,", "At the end of the day,", "Cool. Cool. Cool.", "I'll do everything I can to have you here working with us.", "I'll be waiting for you, brother.", "Gentle nudge here"],
    closingStyle: "Sets hard Tuesday/end-of-week deadlines. Sends proposals within minutes of calls ending.",
    // HubSpot stats (May 1-17): 24 closed won | $5,937 revenue | $247 avg deal size
    // Biggest: Jane ($489), Mike ($489), Mastery Route ($1.2k), Livesoft upsell ($1k)
    // Gmail insight: On probation period — review meeting with Said on May 14. Daniel escalates inbound to Felipe directly.
    // Felipe's pricing strategy: drops aggressively (e.g., $49 → $5/mailbox for 100 accounts in one call). High volume but low ASP.
    // He handles Warmy pricing negotiations on big threads (Tal/SlightEdge agency — $0.10/inbox negotiation, Said CC'd)
    // Weekly 1-1 with Said every Thursday 7:30-8pm CEST (frequently rescheduled based on invite data)
    stats: { deals_may: 24, revenue_may: 5937, avg_deal_may: 247, rank_revenue: 3 },
    coaching_notes: "High deal volume (24 in 17 days) but low ASP ($247). Felipe needs price discipline — he drops too fast. On probation. Said reviews weekly.",
  },
  "sofiiar@warmy.io": {
    name: "Sofiia Rapatska", initials: "SR", color: "#8b5cf6",
    greeting: "Hi [Name],", closing: "Best,\nSofiia",
    tone: "structured, thorough, technical. Deep discovery-first. Validates prospect's logic. Explains the 'why'. Warm but not pushy. Closes with a promised post-call summary.",
    avgWords: 90, role: "AE / Demo",
    phrases: ["Just to make sure I understand correctly,", "That's actually a very good logic,", "I would definitely recommend,", "From our side,", "The idea here is that"],
    closingStyle: "Soft close. Always promises post-call summary. Asks 'when should I expect to hear back from you?'",
    // HubSpot stats (May 1-17): 38 closed won | $28,247 revenue | $743 avg deal size — #1 in deals, #1 in revenue
    // Biggest: Inarigrowth ($2.2k), Starcrown Upsell ($2.25k), 1WIN ($4.7k), deeptech.build total ($2.4k), Alex Urban ($1.05k)
    // Sofiia is the TOP performer by both volume and revenue in May. Very strong upsell book.
    // Knowledge gap flagged in transcripts: uncertain whether Warmy replies from user's mailbox (came up in Anshuman + CloudHire calls)
    // Attends cross-functional meetings (Marketing <> Sales <> Support monthly sync)
    stats: { deals_may: 38, revenue_may: 28247, avg_deal_may: 743, rank_revenue: 1 },
    coaching_notes: "#1 AE by revenue and volume in May. Main gap: product knowledge around the reply-from-user's-mailbox question. Should get a definitive product answer to close this knowledge gap.",
  },
  "jorget@warmy.io": {
    name: "Jorge Marttins", initials: "JM", color: "#ef4444",
    greeting: "Hi [Name],", closing: "Best,\nJorge",
    tone: "clear, structured, methodical. Explains step by step. Calm and confident. Never oversells. Good at technical explanations and competitor comparisons.",
    avgWords: 75, role: "AE",
    phrases: ["So basically,", "Let me share with you,", "I must say,", "Does that make sense?", "I'll send you the information over email"],
    closingStyle: "Ends with concrete next step. Books follow-up or sends pricing immediately. Efficient on transactional deals (3-min EchelonDawn close).",
    // HubSpot stats (May 1-17): 18 closed won | $3,359 revenue | $187 avg deal size
    // Biggest: Velocity ($140), Monetize Media ($350), Roger AI upsell ($1k), Full Stack ($516+$1.2k), ControlAI ($2.9k), Pacific Sotheby's ($600)
    // Jorge handles many small new business deals + upsells. Also ran the FanBasis partner demo with Nicole (partnerships).
    // Weekly Briefing & Training call with entire AE team + Said (Wednesdays 3pm CEST, Daniel Shnaider runs it)
    // Seen on Marketing <> Sales <> Support monthly sync
    stats: { deals_may: 18, revenue_may: 3359, avg_deal_may: 187, rank_revenue: 4 },
    coaching_notes: "Low ASP ($187) — Jorge is closing many $49-$200 deals. Needs to focus on deal quality, not just volume. The ControlAI deal ($2.9k) shows he can close larger deals when engaged properly.",
  },
};

/* ═══════════════════════════════════════════════════════
   FOLLOW-UP SEQUENCE CONFIG
═══════════════════════════════════════════════════════ */
const FU_CONFIG = {
  fu1: {
    label: "Price Proposal Follow Up",
    day: 0,
    badge: "FU1",
    color: "#3b82f6",
    instruction: `This is the most important email — sent right after the meeting. It must:
1. Thank them warmly for their time (1 line, specific to what was great about the call)
2. Summarize the key pain point they described in their own words (be specific — quote their numbers, use case, tool they mentioned)
3. Confirm the solution discussed (which Warmy plan/feature, pricing if agreed)
4. Include the proposal/payment link placeholder: [PAYMENT LINK]
5. Set a clear next step with a specific date (e.g. "I'll follow up Thursday if I don't hear back")
Under 120 words. No fluff. Sounds like a human sent it 5 minutes after the call.`,
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
// HubSpot Owner ID mapping (confirmed from HubSpot API):
// Felipe Vargas: 88489253 | Jorge Marttins: 87333667 | Sofiia Rapatska: 75485407 | Gokhan Koluman: 91804682
// HubSpot Deal IDs (live): Muhammad=60269536179 | Anshuman=60249987662 | Mat=60072037522
// OpalDev(Caitlin)=60234223726 | Novelty Lights=60255907209 | Pedro=60254728339

const INITIAL_TASKS = [
  // ── SAID ───────────────────────────────────────────
  {
    id: "T001", dealId: "MAX_001", type: "fu2",
    contactName: "Max Nyirenda", contactEmail: "max.nyirenda@goinspire.co.uk",
    company: "GoInspire", ae: "saidk@warmy.io",
    meetingDate: "2026-05-14", daysSinceMeeting: 3,
    dealStage: "Price Proposal Sent", dealValue: "$1,600/mo (15% disc) or $16k/yr",
    meetingContext: "Two calls: Demo (May 13) + Upsell (May 14). GoInspire runs EE telecom acquisition campaigns. 2 new domains, 10k daily seed list via Amazon SES. Offered $1,600/mo with 15% testimonial discount. Annual = $16k/yr. Max needs CTO (Sat) approval. Said promised seed list vs standard comparison email so Max can forward to Sat. Partnership angle: GoInspire as Warmy performance partner.",
    transcriptId: "1af383c9-640a-4515-8044-310c37375e6d",
    status: "pending", draft: "", pipelineStatus: "done",
  },
  // ── GOKHAN ─────────────────────────────────────────
  {
    id: "T002", dealId: "BILL_001", type: "fu1",
    contactName: "Bill Bowden", contactEmail: "bill@maior.ai",
    company: "maior.ai (lending)", ae: "gokhank@warmy.io",
    meetingDate: "2026-05-14", daysSinceMeeting: 3,
    dealStage: "Demo Done", dealValue: "~$195-390/mo (5 mailboxes)",
    meetingContext: "Demo with Bill + Craig. Lending business. Apollo cold outreach, HTML emails destroyed deliverability. Google Workspace, 5 mailboxes, 50 emails/day. Comparing vs MX Tools ($129/mo). Bill said 'sounds extremely fair' and open to annual. Pending CEO approval — expected answer May 15. Gokhan offered $39/mo per mailbox (~$25 annual). Reference the annual discount and CEO sign-off.",
    transcriptId: "c014a5a1-ae9b-4131-a15f-691f274b6dd1",
    status: "pending", draft: "", pipelineStatus: "pending",
  },
  {
    id: "T003", dealId: "JACK_001", type: "fu2",
    contactName: "Jamie Anderson", contactEmail: "jamie.anderson@kodiakhub.com",
    company: "KodiakHub (Stockholm)", ae: "gokhank@warmy.io",
    meetingDate: "2026-05-13", daysSinceMeeting: 4,
    dealStage: "Price Proposal Sent", dealValue: "$450/mo or $4,500/yr (30 mailboxes)",
    meetingContext: "Jack Butzu + Jamie Anderson. 10 SDRs, Microsoft 365, Growth Machine + HubSpot sequences. Never warmed. Offered 30 mailboxes x $15/mo = $450/mo or $4,500/yr. Jamie needs CFO approval by end of May. CC Jack Butzu <jack.butzu@kodiakhub.com>. No follow-up sent yet. Risk: vague timeline, no call booked.",
    transcriptId: "5cb81583-90a8-465a-bde1-346e6f24556f",
    status: "pending", draft: "", pipelineStatus: "done",
  },
  {
    id: "T004", dealId: "VIHAR_001", type: "fu2",
    contactName: "Vihar Naik", contactEmail: "viharnaik@callhippo.com",
    company: "CallHippo", ae: "gokhank@warmy.io",
    meetingDate: "2026-05-13", daysSinceMeeting: 4,
    dealStage: "Price Proposal Sent", dealValue: "$540 (HubSpot)",
    meetingContext: "Demo May 13. CallHippo is a VoIP/sales platform. Gokhan + Sofiia on the call. Outcome: Scheduled. HubSpot: $540. No reply since.",
    transcriptId: "9f77a6cd-01fa-459d-9000-c716e8bad583",
    status: "pending", draft: "", pipelineStatus: "done",
  },
  {
    id: "T005", dealId: "YUVRAJ_001", type: "fu2",
    contactName: "Yuvraj Karle", contactEmail: "yuvraj@performifymedia.com",
    company: "PerformifyMedia", ae: "gokhank@warmy.io",
    meetingDate: "2026-05-13", daysSinceMeeting: 4,
    dealStage: "Price Proposal Sent", dealValue: "$450 (HubSpot)",
    meetingContext: "Demo May 13. Performance media company. Gokhan ran the call. Outcome: Scheduled. HubSpot: $450. No reply since.",
    transcriptId: "22658dde-fe87-4670-bbaf-285b07184e56",
    status: "pending", draft: "", pipelineStatus: "done",
  },
  {
    id: "T006", dealId: "BEN_001", type: "fu3",
    contactName: "Benjamin Kouba", contactEmail: "ben@leaf9.com",
    company: "Leaf9", ae: "gokhank@warmy.io",
    meetingDate: "2026-05-12", daysSinceMeeting: 5,
    dealStage: "Price Proposal Sent", dealValue: "$49 (HubSpot — starter plan)",
    meetingContext: "Demo May 12. HubSpot: $49 starter plan. Gokhan ran the call. Outcome: Scheduled. No reply in 5 days — 6-day follow-up, final chance before closing.",
    transcriptId: "e71b4e61-6be7-4966-b655-927e475e82fd",
    status: "pending", draft: "", pipelineStatus: "done",
  },
  {
    id: "T007", dealId: "FREDDIE_001", type: "fu3",
    contactName: "Freddie Gonzalez", contactEmail: "freddie@pzerotalent.co",
    company: "PzeroTalent", ae: "gokhank@warmy.io",
    meetingDate: "2026-05-12", daysSinceMeeting: 5,
    dealStage: "Price Proposal Sent", dealValue: "$210 (HubSpot)",
    meetingContext: "Demo May 12. HubSpot: $210. Gokhan ran the call. Outcome: Scheduled. No reply in 5 days. 6-day follow-up due — last touch before closing.",
    transcriptId: "d3b94f29-d8e5-4bb8-bab3-1bc8aba044cf",
    status: "pending", draft: "", pipelineStatus: "done",
  },
  // ── FELIPE ─────────────────────────────────────────
  {
    id: "T008", dealId: "MUHAMMAD_001", type: "fu1",
    hubspotDealId: "60269536179",
    contactName: "Muhammad Hussnain", contactEmail: "muhammad.hussnain@codingcops.com",
    company: "CodingCops (Pakistan/Chicago)", ae: "felipev@warmy.io",
    meetingDate: "2026-05-15", daysSinceMeeting: 2,
    dealStage: "Demo Done", dealValue: "$500/mo (100 mailboxes @ $5)",
    meetingContext: "Full 30-min demo. CodingCops does B2B cold outreach — 80 domains, 2,500 emails/day via Salesforce + Google Workspace. Differentiator: custom templates (Instantly only does generic warm-up). Found Warmy via ChatGPT. Felipe dropped $49 → $10 → $5/mailbox for 100 accounts = $500/mo. Offer valid until Tuesday. Muhammad needs head of sales approval. Felipe promised official proposal within minutes. Personal connection — chatted about Pakistan/Brazil travel. Competing with Instantly ($50/unlimited).",
    transcriptId: "ea7a1cb3-b09f-4af0-8411-af544e00483c",
    status: "pending", draft: "", pipelineStatus: "pending",
  },
  {
    id: "T009", dealId: "FANBASIS_001", type: "fu1",
    contactName: "Christina", contactEmail: "christina@fanbasis.com",
    company: "FanBasis", ae: "felipev@warmy.io",
    meetingDate: "2026-05-15", daysSinceMeeting: 2,
    dealStage: "Demo Done", dealValue: "TBD",
    meetingContext: "Felipe + Jorge ran demo for FanBasis — fan engagement/creator marketing platform. Multi-stakeholder: Christina, Noor Fateh, Cam, Rage attended. Outcome: Completed. Follow-up with proposal needed.",
    transcriptId: "9fc64ee8-9ec5-47e0-8f44-75e1716a02b4",
    status: "pending", draft: "", pipelineStatus: "pending",
  },
  {
    id: "T018", dealId: "ALEKSDR_001", type: "fu1",
    contactName: "Aleksandr Grebenkov", contactEmail: "alex@gotogrow.me",
    company: "GoToGrow.me", ae: "felipev@warmy.io",
    meetingDate: "2026-05-14", daysSinceMeeting: 3,
    dealStage: "Demo Done", dealValue: "~$200-500/mo now, scaling July-August",
    meetingContext: "Full demo May 14. GoToGrow is a B2B outreach platform for early-stage founders — auto-generates ICP, finds contacts, provides mailboxes. They need a warm-up API partner. Currently pay ~$20/mailbox to a competitor. Felipe spotted partnership angle immediately: 25% recurring rev share. Needs 4-5 domains x 2-5 mailboxes now. Scaling big in July-Aug when opening public beta. CTO needs to join onboarding for API setup. Aleksdr said 'we are ready, just send the link' — agreed to trial first. Comparing Mailbridge, Trulyinbox, Mailgun. Felipe promised payment link + proposal in 2-3 minutes. Aleksdr already signed up on the platform.",
    transcriptId: "a6402499-ea80-488a-8d8c-5e5c775617a2",
    status: "pending", draft: "", pipelineStatus: "pending",
  },
  // ── JORGE ─────────────────────────────────────────
  {
    id: "T010", dealId: "SCOTT_001", type: "fu1",
    hubspotDealId: "60255907209",
    contactName: "Scott Conlin", contactEmail: "scott@noveltylights.com",
    company: "Novelty Lights", ae: "jorget@warmy.io",
    meetingDate: "2026-05-15", daysSinceMeeting: 2,
    dealStage: "Demo Done", dealValue: "$199-358/mo (1-2 mailboxes, HubSpot: $358)",
    meetingContext: "27-min demo. Novelty Lights sells holiday/decorative lighting — b2c list (20k) + commercial b2b (10-15k). Big season Oct-Dec. Sends via HubSpot. 1-2 mailboxes. Open rates 10-20%, wants to double. Jorge offered 500 seed contacts: $358/mo for 2 mailboxes, $199/mo for 1. Scott said 'good ROI if we bump 10%' and 'low hurdle to implement'. Wants to start June. Scott will reach out next week with decision. US/North America list — Jorge confirmed seed list is 80-90% US.",
    transcriptId: "456904da-ebca-4a1f-9bb6-5cacb7c79f9e",
    status: "pending", draft: "", pipelineStatus: "pending",
  },
  {
    id: "T011", dealId: "PEDRO_001", type: "fu1",
    hubspotDealId: "60254728339",
    contactName: "Pedro Silva", contactEmail: "lfv1.cad@agemobi.com",
    company: "Agemobi", ae: "jorget@warmy.io",
    meetingDate: "2026-05-14", daysSinceMeeting: 3,
    dealStage: "Demo Done", dealValue: "TBD ($0 in HubSpot — pricing not confirmed)",
    meetingContext: "Demo May 14 (17 min). Agemobi is a mobile app company. HubSpot shows $0 — pricing not confirmed on the call. Jorge needs to send proposal with pricing. Next step agreed.",
    transcriptId: "ce123b34-77ea-4c57-bf65-8407f051728d",
    status: "pending", draft: "", pipelineStatus: "pending",
  },
  {
    id: "T012", dealId: "LORON_001", type: "none",
    contactName: "Loron Grantham", contactEmail: "loron.grantham@echelondawn.com",
    company: "EchelonDawn", ae: "jorget@warmy.io",
    meetingDate: "2026-05-14", daysSinceMeeting: 3,
    dealStage: "Closed Won ✓", dealValue: "$49/mo (1 mailbox)",
    meetingContext: "3-min call May 14. Jake Vandersterren (reseller/partner) brought Loron in. Payment completed live on the call. Jake sets up remotely. Jake said 'we do these quite a bit — you'll hear from me again.' Jorge should thank Jake and maintain the relationship — this is a repeat referral source.",
    transcriptId: "32bb06bf-be65-45d4-9ace-308d3b8e138f",
    status: "sent", draft: "", pipelineStatus: "done",
  },
  {
    id: "T013", dealId: "CAITLIN_001", type: "fu1",
    hubspotDealId: "60234223726",
    contactName: "Caitlin Marco", contactEmail: "caitlin.marco@opal.dev",
    company: "Opal.dev", ae: "jorget@warmy.io",
    meetingDate: "2026-05-15", daysSinceMeeting: 2,
    dealStage: "Demo Done", dealValue: "$360 (HubSpot — 90% close probability)",
    meetingContext: "Demo May 15, 28 min. Jorge ran solo. Opal.dev is a dev tool/SaaS platform. HubSpot: $360 at 90% probability — high confidence deal. Outcome: Scheduled. Priority follow-up given the high HubSpot probability score.",
    transcriptId: "96800305-c6fb-4a93-8167-57dfdaa1a603",
    status: "pending", draft: "", pipelineStatus: "pending",
  },
  // ── SOFIIA ─────────────────────────────────────────
  {
    id: "T014", dealId: "MAT_001", type: "fu1",
    hubspotDealId: "60072037522",
    contactName: "Mat Sykes", contactEmail: "matthew.sykes@recolutiongroup.com",
    company: "Recolution Group (Cardiff, Wales)", ae: "sofiiar@warmy.io",
    meetingDate: "2026-05-15", daysSinceMeeting: 2,
    dealStage: "Demo Done", dealValue: "$290-440/mo (10-20 mailboxes, HubSpot: $100)",
    meetingContext: "54-min demo. Recolution Group — recruitment business, ~50 people. Send ~5k emails/week: warm (existing candidates) + cold (job board scraped). Bullhorn ATS + MS365. Just bought new domains: yoke-talent.com, yoke-staffing.com to separate cold from main domain. Sofiia validated their logic. Explained seed list, template warm-up, 40-50 emails/day max/mailbox. Pricing: $29/mailbox x 10 = $290/mo or $22 x 20 = $440/mo. Monthly, no contract. Mat needs 2 weeks to discuss internally. Sofiia promised post-call summary — must send it. Key advice given: separate marketing (Sendgrid, higher vol) vs cold outreach (40-50/day max/mailbox).",
    transcriptId: "52a69708-909b-436c-bbe3-e2dd24ef61d1",
    status: "pending", draft: "", pipelineStatus: "pending",
  },
  {
    id: "T015", dealId: "CLOUDHIRE_001", type: "fu1",
    hubspotDealId: "60249987662",
    contactName: "Sabreena Shafi", contactEmail: "sabreena.shafi@cloudhire.ai",
    company: "CloudHire.ai", ae: "sofiiar@warmy.io",
    meetingDate: "2026-05-15", daysSinceMeeting: 2,
    dealStage: "Proposal Done", dealValue: "$435 (HubSpot — confirmed)",
    meetingContext: "Proposal call May 15 with Sabreena + Ayesha Mahera. CloudHire.ai — AI hiring platform. Outcome: Completed. HubSpot: $435 at 50% probability. Sofiia promised post-call summary + payment link. Typical close: 'I'll follow up with a short summary.' Reply expected within a few days.",
    transcriptId: "f3357285-4afe-4011-a136-cdb646eef9ec",
    status: "pending", draft: "", pipelineStatus: "pending",
  },
  {
    id: "T016", dealId: "RAVEN_001", type: "fu1",
    contactName: "Raven Reichl", contactEmail: "ravenreichl.rr@gmail.com",
    company: "Raven Reichl (freelancer)", ae: "sofiiar@warmy.io",
    meetingDate: "2026-05-15", daysSinceMeeting: 2,
    dealStage: "Proposal Done", dealValue: "TBD (small account)",
    meetingContext: "Proposal call May 15, 25 min. Sofiia ran solo. Individual/freelancer. Outcome: Scheduled. Sofiia promised post-call summary. Likely starter plan.",
    transcriptId: "09e13571-e4c5-42b9-b66f-2f21794d5eac",
    status: "pending", draft: "", pipelineStatus: "pending",
  },
  {
    id: "T017", dealId: "ANSHUMAN_001", type: "fu1",
    contactName: "Anshuman Gupta", contactEmail: "ag@junoinnovationlabs.com",
    company: "Juno Innovation Labs", ae: "sofiiar@warmy.io",
    meetingDate: "2026-05-15", daysSinceMeeting: 2,
    dealStage: "Demo Done", dealValue: "$435 (HubSpot)",
    meetingContext: "Demo May 15, 18 min. Sofiia + Ridhima attended. Juno Innovation Labs — startup/innovation space. HubSpot: $435. Outcome: Scheduled. Sofiia promised post-call follow-up.",
    transcriptId: "5c4f9e1d-221b-4dfa-86a2-725b9eff276b",
    status: "pending", draft: "", pipelineStatus: "pending",
  },
];

const INITIAL_ANALYSES = [
  // Scores and coaching based on the official Warmy AE Onboarding Playbook:
  // Framework: 1-Icebreaker(2min) 2-Discovery(8-10min) 3-Diagnosis(5min) 4-Solution/Pricing(5min) 5-Close/NextSteps(3-5min)
  // Must-ask: business type, email type, volume, domains/mailboxes, issue duration, domain age, ESP, Google Postmaster (B2C), timeline, expectations
  // Red flags to identify: cold from main domain, >40 emails/mailbox, >6 mailboxes/domain, 3rd party list, mixing cold+marketing, new domain+high volume
  // Mindset: be the doctor — diagnose first, then prescribe

  // ══════════ MAY 19-20 LATEST CALLS ══════════
  {
    id: "M024", meetingId: "ef5f10b6-6339-45bb-b050-77fe5ff2b97c",
    ae: "jorget@warmy.io", contact: "Jeff Turner", company: "Speech Improvement Company",
    type: "Demo", date: "2026-05-19", duration: "45 min",
    framework_scores: { icebreaker: 4, discovery: 5, diagnosis: 5, solution_fit: 5, close: 5 },
    went_well: [
      "Jeff came in already knowing something was wrong — Jorge diagnosed the root cause immediately: cold outreach over years has damaged domain reputation",
      "Explained the deliverability test results clearly — Jeff was confused, Jorge walked him through it step by step",
      "Validated their existing infrastructure decision (separate cold domain) — built instant trust",
      "Closed on the call — Jeff said 'let\'s do it', payment link sent live, onboarding link shared in the same call",
      "Natural negotiation: $35 × 6 → $28 × 10 across 2 domains. Jeff accepted immediately",
      "Personal rapport at the end: Jeff visited Brazil, Jorge lived in California — cemented the relationship",
      "Explicitly said \'I\'ll be your point of contact\' — AE ownership communicated clearly",
    ],
    improve: [
      "Math error live: said \'35 times 6 should be 110\' — it\'s $210. Creates uncertainty even when caught",
      "The deliverability test explanation took 5+ minutes — needs a 30-second version: \'Our test shows your reputation across Gmail, Outlook, Yahoo. Right now you have issues with Outlook and Yahoo.\'",
      "Never confirmed sending volume per mailbox — important for correct warm-up plan sizing",
    ],
    score: 92,
    playbook_verdict: "Near-perfect framework execution. Jorge was the doctor: diagnosed domain reputation damage, explained the mechanism clearly, closed on the call with onboarding booked. This is the benchmark call for the team — diagnosis → prescription → close in one meeting.",
  },
  {
    id: "M025", meetingId: "33201822-6ba9-476a-8edd-5c13a7578c55",
    ae: "felipev@warmy.io", contact: "Milagros Villalba Hachard", company: "Metro Vein Centers",
    type: "Demo", date: "2026-05-19", duration: "36 min",
    framework_scores: { icebreaker: 5, discovery: 4, diagnosis: 3, solution_fit: 4, close: 3 },
    went_well: [
      "Exceptional icebreaker — Florianópolis / Buenos Aires banter, Boca vs River jokes, genuine warmth before any business",
      "Good discovery: B2C welcome series + newsletters (100k-175k/month), HubSpot, Klaviyo migration history, Gmail-based sales sequences",
      "Correctly spotted the real problem: 99% deliverability score but emails going to promotions — explained the difference clearly",
      "Demo in Spanish throughout — natural, warm, and perfectly matched to an Argentine prospect",
      "Used early adoption discount mechanic: \'decide within 24 hours and I\'ll lock the rate\'",
    ],
    improve: [
      "Diagnosis was shallow — Milagros sends opt-in B2C marketing emails, NOT cold outreach. Felipe never verified if warm-up is actually the solution vs list hygiene or content",
      "Never asked how long they\'ve had the inbox placement problem — must-ask question skipped",
      "8-minute setup troubleshooting session mid-demo (trying to connect Google Workspace) completely broke the flow. Setup belongs on the onboarding call, never on the demo",
      "Close was vague: \'speak to your team, response by tomorrow\' — no specific callback time or next step confirmed",
    ],
    score: 75,
    playbook_verdict: "Strong rapport, weak diagnosis. Milagros is Segment 02 (B2C Marketing to opt-in list) not cold outreach — Felipe never confirmed whether warm-up is the right solution vs content/segmentation issues. The 8-minute setup troubleshooting destroyed the demo momentum. Always defer setup to the onboarding call.",
  },
  {
    id: "M026", meetingId: "369f8414-b99a-4404-953f-abfd8cfe6a75",
    ae: "sofiiar@warmy.io", contact: "Armen Ghazaryan", company: "Playtronix (iGaming)",
    type: "Demo", date: "2026-05-20", duration: "13 min",
    framework_scores: { icebreaker: 3, discovery: 5, diagnosis: 4, solution_fit: 4, close: 3 },
    went_well: [
      "Immediately leveraged Warmy\'s iGaming experience — \'we work with Bad Cat Casino, Up Stars\' — expert positioning from minute one",
      "Sharp discovery: correctly identified this as semi-cold (moving traffic between platforms, not pure opt-in)",
      "Identified Customer.IO and explained the seed list manual upload workaround accurately",
      "Gave correct advice: 3-4 months minimum, gradual ramp, don\'t stop after 2 weeks",
      "Handled the \'bots vs real traffic\' question precisely — explained the AI-driven human-like behavior clearly",
    ],
    improve: [
      "Armen said they start in 1-2 months — Sofiia accepted without urgency. Should have used: \'The best time to start warming up is before you launch — start now and you\'ll be ready exactly when you need it\'",
      "Never confirmed exact number of senders — 30,000 total emails with how many mailboxes? One or multiple?",
      "Close was soft: \'I should expect a response in about a month\' — 4 weeks with no follow-up plan",
    ],
    score: 80,
    playbook_verdict: "Clean technical demo with excellent iGaming industry credibility. The urgency angle was completely missed — Armen gave a 1-2 month delay and Sofiia accepted it. The follow-up email needs a specific reason to start the warm-up now rather than waiting.",
  },
  {
    id: "M027", meetingId: "06b666bd-99a7-4621-bee7-7c00bcbb54ca",
    ae: "jorget@warmy.io", contact: "Phill Ash", company: "GovCentre",
    type: "No Show", date: "2026-05-19", duration: "18 min",
    framework_scores: { icebreaker: 0, discovery: 0, diagnosis: 0, solution_fit: 0, close: 0 },
    went_well: [
      "Meeting was recorded and logged in Avoma — no-show is properly captured with \'No Show\' outcome",
    ],
    improve: [
      "Phill did not join — transcript shows Jorge speaking Portuguese to himself before ending the call",
      "Action required: mark deal as Disqualified in HubSpot immediately with reason: \'No-show, no response to rebook attempts\'",
      "Per playbook: disqualification requires a written reason before the stage can change",
    ],
    score: 0,
    playbook_verdict: "No-show. Per playbook: mark Disqualified immediately in HubSpot with written reason. If Phill reaches out to rebook, create a new deal — do not reactivate this one.",
  },

  // ══════════ SAID ══════════════
  {
    id: "M001", meetingId: "1af383c9-640a-4515-8044-310c37375e6d",
    ae: "saidk@warmy.io", contact: "Max Nyirenda", company: "GoInspire",
    type: "Upsell", date: "2026-05-14", duration: "15 min",
    framework_scores: {
      icebreaker: 5, discovery: 4, diagnosis: 4, solution_fit: 4, close: 3,
    },
    went_well: [
      "Remembered full context from prior call — skipped re-intro and jumped straight to value (doctor who already knows the patient)",
      "Correctly identified the partnership angle: GoInspire as a referral partner, not just a customer",
      "Offered a testimonial-linked discount — smart mechanic that gets something back",
      "Confirmed Amazon SES integration path clearly — shows infrastructure expertise",
      "Annual framing was natural: $16k/yr with 2 months free",
    ],
    improve: [
      "Discovery was skipped — this is an upsell so understandable, but Said never re-confirmed GoInspire's current infrastructure or sending volume. The playbook says diagnose on every call.",
      "No timeline confirmed with the real decision maker (Sat, the CTO). 'I'll check with Sat' is passive — Said should have offered to jump on a 3-way call",
      "Objection handling: Max asked for a price reduction and already had the 15% discount. Said didn't use the playbook rebuttal: 'What does one missed campaign cost you?'",
      "Close was soft — no specific date agreed for Sat's decision",
    ],
    score: 78,
    playbook_verdict: "Good consultative tone but the close was left open-ended. The playbook requires leaving every call with 'something concrete scheduled' — Said left with a vague 'I'll check with Sat'.",
  },

  // ══════════ GOKHAN ══════════════
  {
    id: "M002", meetingId: "c014a5a1-ae9b-4131-a15f-691f274b6dd1",
    ae: "gokhank@warmy.io", contact: "Bill Bowden + Craig", company: "maior.ai",
    type: "Demo", date: "2026-05-14", duration: "33 min",
    framework_scores: {
      icebreaker: 5, discovery: 5, diagnosis: 5, solution_fit: 4, close: 4,
    },
    went_well: [
      "Perfect discovery execution: asked about business type (lending), email type (cold B2B via Apollo), volume, ESP, domain setup — hit every must-ask question",
      "Diagnosed the red flag correctly: HTML emails in cold outreach — immediately positioned Warmy as the fix",
      "Google Workspace setup confirmed — matched correct plan recommendation (Regular Warm Up, B2B Cold Outbound Segment)",
      "Compared Warmy vs MX Tools credibly — used the 'we do more than warm-up' value prop from the playbook",
      "Got a decision timeline commitment: 'answer by tomorrow afternoon'",
    ],
    improve: [
      "Never asked about domain age — critical for B2B cold. A new domain requires longer warm-up and different expectations",
      "Didn't confirm whether Bill is sending to business domains or consumer domains (the B2B vs B2C trap the playbook warns about)",
      "Pricing confidence wavered twice — said 'let me check' on plan pricing. Should have the plan matrix memorised",
      "The CEO (Hirsh) is the real decision maker — should have asked Bill to include Hirsh in the follow-up or next call",
    ],
    score: 84,
    playbook_verdict: "Strong discovery call — Gokhan's diagnostic instincts are excellent. Two missed must-ask questions (domain age, recipient domain type). Pricing confidence needs work.",
  },
  {
    id: "M003", meetingId: "5cb81583-90a8-465a-bde1-346e6f24556f",
    ae: "gokhank@warmy.io", contact: "Jack Butzu + Jamie Anderson", company: "KodiakHub",
    type: "Demo", date: "2026-05-13", duration: "40 min",
    framework_scores: {
      icebreaker: 5, discovery: 4, diagnosis: 4, solution_fit: 4, close: 3,
    },
    went_well: [
      "Discovery covered: business type (SDR team), email type (B2B cold), mailbox count (10 SDRs), ESP (Microsoft 365 + Growth Machine) — solid coverage",
      "Identified the key red flag: never warmed up before — set expectations about the ramp-up period",
      "Correct segment recommendation: B2B Cold Outbound, separate domain, 2-3 mailboxes/domain, 30-40 emails/day",
      "Annual pricing framing worked — Jamie brought it up herself",
    ],
    improve: [
      "Never asked about domain age — KodiakHub's cold domains could be new, which affects the warm-up timeline promise",
      "Jack's question about separating rep emails from sequences exposed a knowledge gap — should know the answer to this cold",
      "No concrete close — 'end of month with CFO approval' with no follow-up call booked. Playbook: always leave with something concrete scheduled",
      "Call ran 40 minutes — discovery + diagnosis could have been done in 15, leaving more time for close",
    ],
    score: 78,
    playbook_verdict: "Good discovery but weak close. The deal is floating without a next call booked. CFO approval without an anchor date and a contact in the room is a pipeline risk.",
  },
  {
    id: "M004", meetingId: "bef34772-56f8-4c24-9554-66fb5de47382",
    ae: "gokhank@warmy.io", contact: "Dorian Lesnic", company: "Cardneto",
    type: "Demo", date: "2026-05-13", duration: "59 min",
    framework_scores: {
      icebreaker: 5, discovery: 5, diagnosis: 5, solution_fit: 5, close: 5,
    },
    went_well: [
      "Full framework executed: icebreaker → discovery → diagnosis → solution → live close",
      "Diagnosed the root cause immediately: new domain + cold sending from Day 1 = reputation damage",
      "Used the objection rebuttal correctly when Instantly came up: 'Warmy goes further — we advise on your full infrastructure'",
      "Closed on the call with payment — the gold standard from the playbook",
      "Booked onboarding before hanging up — left with something concrete",
      "Dorian called it 'the smoothest sales experience' — Gokhan embodied the 'be the expert, not the salesperson' mindset",
    ],
    improve: [
      "59 minutes for a $100/mo deal — the same framework executed in 25-30 min would free up more capacity",
      "VPN/domain setup edge case tripped him up briefly — should know the product edge cases cold",
      "Instantly objection handled 4 times — should be resolved definitively in the first 60 seconds",
    ],
    score: 91,
    playbook_verdict: "Near-perfect execution of the Warmy framework. Doctor mindset throughout — diagnosed, prescribed, closed. Time management is the only real gap.",
  },
  {
    id: "M010", meetingId: "cf9289bb-77ad-4cc0-865a-a2acc7ae39c2",
    ae: "gokhank@warmy.io", contact: "Collin Farmer", company: "42support (MSP)",
    type: "Demo", date: "2026-05-15", duration: "27 min",
    framework_scores: {
      icebreaker: 4, discovery: 4, diagnosis: 3, solution_fit: 4, close: 2,
    },
    went_well: [
      "Spotted the MSP/API Customer angle (Segment 04) quickly — understood this is a reseller, not an end user",
      "Correctly held back on retail pricing — smart to flag partnership pricing needs manager approval",
      "Explained seed list vs integration distinction for a technical audience",
      "Identified the 25-domain firm as a second opportunity worth pursuing",
    ],
    improve: [
      "Discovery was light — didn't ask what types of emails Collin's clients send, their volumes, or their domain setup. Must-ask questions skipped",
      "Collin's clients could be B2B cold, B2B marketing, or B2C — Gokhan never found out. Different segments = different plans and pricing",
      "No close or next step — Gokhan said 'I'll email pricing' but never confirmed when or booked a follow-up",
      "The diagnosis step was skipped entirely — no red flags or green flags identified for Collin's client base",
    ],
    score: 72,
    playbook_verdict: "Discovery was too shallow for an MSP sale. Gokhan needs to understand the client's clients before pricing. The close was passive — 'I'll email you' is not a next step.",
  },
  {
    id: "M011", meetingId: "b4a4a80d-59ff-4339-a9bf-75ae967d3295",
    ae: "gokhank@warmy.io", contact: "Phil Mold", company: "That Recruitment Bloke",
    type: "Demo", date: "2026-05-15", duration: "42 min",
    framework_scores: {
      icebreaker: 5, discovery: 5, diagnosis: 5, solution_fit: 4, close: 5,
    },
    went_well: [
      "Textbook icebreaker — Kraków/Manchester pub prices created genuine rapport before any business talk",
      "Full discovery: recruitment B2B cold, Loxo CRM, Microsoft 365, ~40 emails/day — all must-ask questions covered",
      "Diagnosed the red flag correctly: Loxo was contributing to deliverability issues — proactive infrastructure diagnosis",
      "Matched the correct segment (B2B Cold Outbound, Segment 01) and gave the right recommendations",
      "Live close — Phil paid $49/mo during the call. Onboarding booked before hanging up",
      "Handled the annual vs monthly objection gracefully with the 'deferred annual' option",
    ],
    improve: [
      "42 minutes for a $49/mo deal — Phil was easy to close, the call could have been 25 min",
      "Didn't confirm Phil's sending volume beyond '40 emails/day' — should have asked: total per month?",
      "The Loxo insight should have been flagged as a specific red flag and explained more firmly as a risk",
    ],
    score: 87,
    playbook_verdict: "Excellent doctor-mindset call. Gokhan diagnosed and closed. The only gap is time management — this framework should run in 25-30 min for starter deals, not 42.",
  },
  {
    id: "M012", meetingId: "135fdff5-b93b-46c6-9a1f-a2c0ff5529eb",
    ae: "gokhank@warmy.io", contact: "Bryan Quandt", company: "Optimizm Solutions",
    type: "Demo", date: "2026-05-15", duration: "28 min",
    framework_scores: {
      icebreaker: 4, discovery: 4, diagnosis: 3, solution_fit: 3, close: 2,
    },
    went_well: [
      "Good icebreaker — Vienna/Kraków connection was natural",
      "Identified the root cause: new domain + cold sending from Day 1",
      "Correct recommendation: 30-40 emails/day max, separate domain",
      "Differentiated from Apollo's warm-up feature with the 'largest database + dedicated expert' angle",
    ],
    improve: [
      "Never asked domain age — critical here since Bryan has a new domain. Should have stressed the 2-week minimum before sending",
      "No pricing discussed on the call — Bryan left without an anchor number to evaluate",
      "Passive close: accepted 'follow up late next week' without creating any urgency. Playbook rebuttal: 'The best time to warm up is before you start sending at scale'",
      "Called Bryan 'Greg' at the end — basic error that undermines rapport",
      "Diagnosis of red flags was verbal but not pointed — should have said 'this is exactly what's causing your issue' more directly",
    ],
    score: 68,
    playbook_verdict: "Weak close on a multi-vendor evaluation. Bryan is comparing options and Gokhan gave him no reason to choose Warmy now. The playbook urgency rebuttal was never used.",
  },
  {
    id: "M013", meetingId: "1e4d7a44-7d54-4399-b252-7a8f8807b7c2",
    ae: "gokhank@warmy.io", contact: "Gurdev Kalsi", company: "Affiliate Marketer",
    type: "Proposal", date: "2026-05-15", duration: "37 min",
    framework_scores: {
      icebreaker: 4, discovery: 3, diagnosis: 3, solution_fit: 2, close: 2,
    },
    went_well: [
      "Patient and educational — never made Gurdev feel judged for his basic questions",
      "Correctly identified Getresponse as an ESP that needs seedlist approach (edge case — ESP doesn't integrate)",
      "Did the volume math carefully: 1,400 emails/day = high volume seedlist needed",
      "Empathetic to the India/budget constraint without being dismissive",
    ],
    improve: [
      "Budget qualification skipped entirely — Gurdev's $100-250 budget vs $750 quote is a 3-5x gap. The playbook says diagnose before prescribing — budget is part of the diagnosis",
      "Didn't ask how long Gurdev has had issues — this is a must-ask question",
      "Never asked about recipient domain type — affiliate marketing could be B2C (consumer inboxes) which changes the entire warm-up strategy",
      "Solution fit was wrong — prescribed a plan Gurdev can't afford. Should have qualified budget in the first 5 minutes",
      "37 minutes with no resolution — should have identified the budget mismatch at minute 5 and either found an alternative or gracefully disqualified",
    ],
    score: 58,
    playbook_verdict: "Budget not qualified early enough — cardinal discovery error. The playbook's must-ask questions exist precisely to prevent 37-minute calls that go nowhere. Gurdev is not a viable prospect at the prices he described.",
  },
  {
    id: "M014", meetingId: "78cc9f73-f52e-42f6-83dd-5dad34bcbeca",
    ae: "gokhank@warmy.io", contact: "Jordan Tate (via Paul)", company: "Conduyt",
    type: "Demo", date: "2026-05-14", duration: "13 min",
    framework_scores: {
      icebreaker: 4, discovery: 4, diagnosis: 3, solution_fit: 4, close: 3,
    },
    went_well: [
      "Handled warm referral efficiently — Paul is already a Warmy customer, Gokhan leveraged this well",
      "Correctly identified 3-domain structure and recommended which domain to prioritise",
      "Pricing was clear and confident: $49/mailbox, $245/mo for 5",
      "Correct segment identification: B2B SaaS cold outbound",
    ],
    improve: [
      "Jordan (the decision maker) wasn't on the call — Gokhan never confirmed Jordan's email or offered to send information directly to him",
      "Domain age not asked — conduit.email could be a new domain needing full warm-up ramp",
      "No next step with Jordan directly — the deal depends on Paul forwarding information, which is a weak link",
      "Annual option presented without urgency framing — playbook says use the 'building before problems appear' angle",
    ],
    score: 76,
    playbook_verdict: "Efficient warm referral handling but the decision maker wasn't present. Gokhan should have either waited to present to Jordan directly or got Jordan's contact to follow up with independently.",
  },

  // ══════════ FELIPE ══════════════
  {
    id: "M005", meetingId: "ea7a1cb3-b09f-4af0-8411-af544e00483c",
    ae: "felipev@warmy.io", contact: "Muhammad Hussnain", company: "CodingCops",
    type: "Demo", date: "2026-05-15", duration: "31 min",
    framework_scores: {
      icebreaker: 5, discovery: 4, diagnosis: 3, solution_fit: 3, close: 3,
    },
    went_well: [
      "Excellent icebreaker — Pakistan/Brazil travel chat fully warmed up Muhammad before business talk",
      "Identified the right segment: B2B Cold Outbound (Segment 01), 80 domains, 1 account each",
      "Spotted the key differentiator: custom templates vs Instantly's generic warm-up",
      "Volume math was correct: confirmed they're within safe range for their setup",
      "Found Warmy via ChatGPT — Felipe turned this into social proof naturally",
    ],
    improve: [
      "Diagnosis step was rushed — Felipe never pointed out any red flags in Muhammad's setup. 80 domains × 2,500 emails/day is high volume. Are they sending from main domains? What's the domain age? These red flags were never explored",
      "The playbook says diagnose before prescribing — Felipe jumped to pricing too fast",
      "Price dropped from $49 → $5/mailbox in one call with no resistance. That's a 90% discount. The 'too expensive' objection rebuttal ('what does one missed campaign cost you?') was never used",
      "No confirmed next step — 'offer valid until Tuesday' without confirming the head of sales name or booking a call is soft",
    ],
    score: 74,
    playbook_verdict: "Strong rapport, weak diagnosis. Felipe is selling before diagnosing — the playbook says 'understand the full infrastructure before offering a solution.' He also needs price discipline.",
  },
  {
    id: "M006", meetingId: "a6402499-ea80-488a-8d8c-5e5c775617a2",
    ae: "felipev@warmy.io", contact: "Aleksandr Grebenkov", company: "GoToGrow.me",
    type: "Demo", date: "2026-05-14", duration: "26 min",
    framework_scores: {
      icebreaker: 4, discovery: 4, diagnosis: 3, solution_fit: 5, close: 4,
    },
    went_well: [
      "Identified Segment 04 (API Customer) immediately — GoToGrow provides mailboxes and needs a warm-up API partner",
      "Correctly spotted the partnership/rev share angle within the first 2 minutes",
      "Trial approach was right: low-commitment entry, then upsell to partnership pricing",
      "Aleksdr said 'we are ready, just send the link' — Felipe got to a clear next step",
      "Connected the CTO to the API setup process proactively",
    ],
    improve: [
      "Discovery on end-user infrastructure was skipped — GoToGrow's clients are the actual senders. What segments do they serve? What volumes? This shapes the partnership pricing entirely",
      "The playbook says diagnose the full infrastructure — Felipe diagnosed the surface but not the underlying client base",
      "Partnership handoff was vague — '25% recurring' was mentioned but no formal process was set",
      "July-August scale-up date not confirmed for forecasting",
    ],
    score: 81,
    playbook_verdict: "Smart segment recognition (API Customer). The gap is discovery on GoToGrow's end-user base — different client types need different warm-up plans, which affects how the API integration should be scoped.",
  },

  // ══════════ JORGE ══════════════
  {
    id: "M007", meetingId: "456904da-ebca-4a1f-9bb6-5cacb7c79f9e",
    ae: "jorget@warmy.io", contact: "Scott Conlin", company: "Novelty Lights",
    type: "Demo", date: "2026-05-15", duration: "27 min",
    framework_scores: {
      icebreaker: 4, discovery: 4, diagnosis: 4, solution_fit: 4, close: 3,
    },
    went_well: [
      "Correct segment identification: B2B Marketing/Newsletter (Segment 02) — retail b2c list + commercial b2b",
      "Diagnosis was sharp: mixed cold+marketing on same domain is a red flag — Jorge flagged it correctly",
      "Recommended the right solution: separate the lists, use seed list for the marketing domain",
      "Confirmed US-based seed list matches their market proactively — shows infrastructure expertise",
      "Scott said 'low hurdle to implement' and 'good ROI if we bump 10%' — solution fit landed well",
    ],
    improve: [
      "Never asked about domain age — critical for a seasonal business. Their main domain could be aged and trusted",
      "Never asked about Scott's current sending tool in detail — 'we use HubSpot' was accepted without follow-up on DKIM/SPF setup",
      "Urgency completely missed: Oct-Dec is their peak season. Playbook close: 'The best time to warm up is before you start sending at scale' — this was a perfect setup and Jorge never used it",
      "Close was passive: accepted 'I'll reach out next week' without booking a specific follow-up",
    ],
    score: 80,
    playbook_verdict: "Good diagnostic call. The seasonal urgency angle ('Christmas campaigns are 4 months away') was perfectly set up and completely unused. This is the one objection rebuttal that could have closed Scott on the call.",
  },
  {
    id: "M008", meetingId: "32bb06bf-be65-45d4-9ace-308d3b8e138f",
    ae: "jorget@warmy.io", contact: "Loron Grantham + Jake Vandersterren", company: "EchelonDawn",
    type: "Demo", date: "2026-05-14", duration: "3 min",
    framework_scores: {
      icebreaker: 3, discovery: 2, diagnosis: 2, solution_fit: 5, close: 5,
    },
    went_well: [
      "Payment completed in under 3 minutes — perfect transactional execution",
      "Jake is a repeat reseller (Segment 04 — API/partner) — Jorge correctly let Jake drive",
      "Jake said 'you'll hear from me again' — referral source identified and relationship maintained",
    ],
    improve: [
      "No discovery at all — for a 3-min transactional call this is acceptable, but Jorge should have confirmed what Loron actually needs the mailbox for",
      "Jake's company and contact details not captured for the formal partner program",
      "No onboarding instructions shared live — should have sent the link during the call",
    ],
    score: 88,
    playbook_verdict: "Correct call type recognition — this was a transactional reseller close, not a discovery call. Jorge executed it perfectly. Jake should be formally enrolled in the partner program.",
  },
  {
    id: "M015", meetingId: "96800305-c6fb-4a93-8167-57dfdaa1a603",
    ae: "jorget@warmy.io", contact: "Caitlin Marco", company: "Opal.dev",
    type: "Demo", date: "2026-05-15", duration: "29 min",
    framework_scores: {
      icebreaker: 4, discovery: 5, diagnosis: 5, solution_fit: 5, close: 5,
    },
    went_well: [
      "Discovery was exceptional — Caitlin came in with a specific requirements list and Jorge matched each one: email validation, dedicated IP, SMTP server, IP warming",
      "Diagnosed the red flag immediately: shared Google IP = deliverability contamination. Pointed it out directly ('let me tell you why you're having this issue')",
      "Correct solution fit: SMTP server + dedicated IP — exactly Segment 03 handling (B2B mass sender needing SMTP as last resort)",
      "Caitlin said 'Oh my gosh I'm so excited' — the doctor diagnosis approach created genuine enthusiasm",
      "Monday 2PM follow-up call booked on the call — playbook close executed perfectly",
      "Pricing was confident and clear: $360 for 3 BDR mailboxes",
    ],
    improve: [
      "Slight hesitation on Business vs Premium plan — should have a decision tree ready for which plan to recommend based on volume",
      "Never asked about contract end date with current provider (Nooks) — important for timeline and urgency",
      "3% bounce rate was mentioned — could have sold the email validation tool harder as an immediate win",
    ],
    score: 92,
    playbook_verdict: "Near-perfect Warmy framework execution. Jorge was the doctor: he diagnosed the shared IP problem, explained the mechanism, and prescribed the exact solution. This is the benchmark call for the team.",
  },
  {
    id: "M016", meetingId: "ce123b34-77ea-4c57-bf65-8407f051728d",
    ae: "jorget@warmy.io", contact: "Pedro Silva", company: "Agemobi",
    type: "Demo", date: "2026-05-14", duration: "18 min",
    framework_scores: {
      icebreaker: 3, discovery: 2, diagnosis: 2, solution_fit: 2, close: 3,
    },
    went_well: [
      "Efficient 18-minute call",
      "Next step agreed on the call",
    ],
    improve: [
      "HubSpot shows $0 — pricing was never discussed. The solution_fit and pricing step was skipped entirely",
      "Very limited discovery data available — unclear what Agemobi's email setup, volume, or pain point is",
      "No segment identified from available transcript — Jorge didn't run the must-ask questions",
      "The diagnosis step appears to have been skipped — no red flags or green flags identified",
    ],
    score: 55,
    playbook_verdict: "Insufficient data to coach on fully, but the $0 HubSpot deal and thin transcript suggest the discovery + diagnosis + solution framework was not followed. This call needs a replay in Avoma.",
  },
  {
    id: "M017", meetingId: "fe3ebe6a-fd21-44be-ae69-2083847130d2",
    ae: "jorget@warmy.io", contact: "Bryan Bovey", company: "Individual",
    type: "Demo", date: "2026-05-14", duration: "32 min",
    framework_scores: {
      icebreaker: 4, discovery: 3, diagnosis: 3, solution_fit: 3, close: 3,
    },
    went_well: [
      "Empathetic handling of an unusual use case (human rights advocacy, non-commercial)",
      "Correctly identified the root cause: invalid emails from ChatGPT-generated lists",
      "Recommended the email validation tool as the immediate solution — correct playbook edge case handling",
      "Directed Bryan to the free trial — right call for a zero-budget prospect",
    ],
    improve: [
      "Budget qualification skipped — Bryan explicitly mentioned no budget early in the call. Jorge should have gracefully disqualified within the first 5 minutes",
      "32 minutes on a zero-revenue prospect is a time management failure",
      "The discovery revealed immediately this is not a commercial prospect — the playbook's timeline and expectations questions would have surfaced this in the first 3 minutes",
    ],
    score: 55,
    playbook_verdict: "Jorge's empathy is an asset but the 'timeline' and 'expectations' must-ask questions exist precisely to filter non-viable prospects early. 32 minutes on a zero-budget individual is avoidable.",
  },
  {
    id: "M018", meetingId: "6c3ba678-c747-4ec1-9f9c-f13d4f0ea5ef",
    ae: "jorget@warmy.io", contact: "Jimmy Hendricks + Andy", company: "WSI World",
    type: "Demo", date: "2026-05-14", duration: "36 min",
    framework_scores: {
      icebreaker: 4, discovery: 4, diagnosis: 3, solution_fit: 4, close: 3,
    },
    went_well: [
      "Handled two-persona call well — read the room (Jimmy = closer, Andy = operator)",
      "Correctly sized their volume and confirmed they're within the safe zone",
      "Segment 02 (B2B Marketing) correctly identified — newsletters + some cold",
      "Clear pricing: $49/mo starter, 7-day trial recommended",
    ],
    improve: [
      "Andy's sophisticated question about filtering spam-triggered opens vs real opens was answered vaguely — should know this answer cold",
      "Jimmy and Andy left to 'have a conversation' without a follow-up call booked — playbook close not executed",
      "The Atlanta/Austin market angle (55k businesses) was an opening for a much larger deal — Jorge never explored their full volume ambition",
      "Never asked about domain age or how long they've had deliverability issues",
    ],
    score: 72,
    playbook_verdict: "Solid discovery but passive close. The 55,000 business market comment was a strong signal of ambition — Jorge should have used this to size a larger solution rather than anchoring on the $49 starter plan.",
  },
  {
    id: "M019", meetingId: "9fc64ee8-9ec5-47e0-8f44-75e1716a02b4",
    ae: "jorget@warmy.io", contact: "Christina + Noor + Cam + Tony", company: "FanBasis",
    type: "Partner Demo", date: "2026-05-15", duration: "21 min",
    framework_scores: {
      icebreaker: 4, discovery: 3, diagnosis: 2, solution_fit: 4, close: 3,
    },
    went_well: [
      "Handled 5-person multi-stakeholder call confidently",
      "Referral agreement context well understood — positioned correctly as partner enablement",
      "25% rev share confirmed clearly for Tony's question",
      "ICP explained clearly: B2B agencies, SaaS, real estate, marketing agencies",
    ],
    improve: [
      "This was a partner session, not a discovery call — but Jorge never asked FanBasis about their own clients' email setups. Understanding the client base would make him more helpful as a resource",
      "No specific referral pipeline agreed — call ended without 'send us X type of client by Y date'",
      "Discovery questions were skipped entirely — acceptable for a partner session but Jorge missed an opportunity to educate FanBasis on what makes a good Warmy referral",
    ],
    score: 72,
    playbook_verdict: "Good partner relationship management. The gap is not using the discovery framework to educate FanBasis on what a qualified Warmy referral looks like — this is what will drive actual pipeline from the partnership.",
  },

  // ══════════ SOFIIA ══════════════
  {
    id: "M009", meetingId: "52a69708-909b-436c-bbe3-e2dd24ef61d1",
    ae: "sofiiar@warmy.io", contact: "Mat Sykes + Agatha Pope", company: "Recolution Group",
    type: "Demo", date: "2026-05-15", duration: "54 min",
    framework_scores: {
      icebreaker: 5, discovery: 5, diagnosis: 5, solution_fit: 4, close: 3,
    },
    went_well: [
      "Textbook discovery: asked about business type (recruitment), email type (cold + warm mix), volume (~5k/week), domains, ESP (Bullhorn + MS365), issues — every must-ask question covered",
      "Correctly identified the domain separation strategy as a green flag and validated it — built immediate trust",
      "Diagnosed the Bullhorn architecture correctly: emails authenticated via MS365 — shows deep infrastructure knowledge",
      "Correctly identified the segment: B2B Cold Outbound (Segment 01) for the cold mailboxes, B2B Marketing (Segment 02) for the newsletter list",
      "Gave concrete playbook-aligned recommendations: separate cold from marketing, 40-50 emails/day/mailbox, seed list for the Sendgrid volume",
    ],
    improve: [
      "Call ran 54 minutes — the framework should run in 30-35 min. Discovery was thorough but too verbose",
      "Pricing introduced only at the end after a long call — Mat had to ask. Solution fit + pricing is Step 4, not Step 5",
      "Close was soft: 'Mat said 2 weeks' — Sofiia accepted this without using the urgency rebuttal. They have campaigns being sent from unwarmed domains right now — that's a live problem",
      "The post-call summary she promised must be sent immediately — this is how the soft close becomes a real close",
    ],
    score: 85,
    playbook_verdict: "Best discovery call on the team — Sofiia's diagnostic depth is exceptional. She IS the doctor. The gaps are call length and close urgency. The summary email is critical.",
  },
  {
    id: "M020", meetingId: "09e13571-e4c5-42b9-b66f-2f21794d5eac",
    ae: "sofiiar@warmy.io", contact: "Raven Reichl", company: "Individual B2C",
    type: "Proposal", date: "2026-05-15", duration: "25 min",
    framework_scores: {
      icebreaker: 4, discovery: 4, diagnosis: 5, solution_fit: 4, close: 5,
    },
    went_well: [
      "Ran the deliverability test live — 23% spam rate shown in real time. This is the doctor showing the X-ray",
      "Correctly identified the segment: B2C Bulk Sender (Segment 05) — 100k/month sending to consumer inboxes",
      "Applied the correct warm-up ratio: single opt-in = 1:5 ratio (playbook B2C warm-up strategy)",
      "Correctly explained GPM (Google Postmaster) — B2C must-ask, Sofiia covered it",
      "Live close — Raven said 'send me the payment link, let's start'",
      "Correctly handled the GHL (GoHighLevel) SMTP integration — edge case knowledge",
    ],
    improve: [
      "Pricing negotiated through 4 rounds ($459 → $400 → $389 → $350) — should anchor lower initially to avoid so many rounds",
      "Raven's 100k/month to a B2C list is high-risk — Sofiia should have flagged the list quality issue more prominently as a red flag before committing to results",
      "Brief uncertainty on IMAP details — should be confident on this product feature",
    ],
    score: 88,
    playbook_verdict: "Strong B2C call. Showing the live deliverability test is exactly the 'doctor showing the X-ray' behaviour the playbook describes. Live close is the result of the diagnosis creating urgency.",
  },
  {
    id: "M021", meetingId: "5c4f9e1d-221b-4dfa-86a2-725b9eff276b",
    ae: "sofiiar@warmy.io", contact: "Anshuman Gupta + Ridhima", company: "Juno Innovation Labs",
    type: "Demo", date: "2026-05-15", duration: "18 min",
    framework_scores: {
      icebreaker: 4, discovery: 4, diagnosis: 4, solution_fit: 4, close: 3,
    },
    went_well: [
      "Immediately validated Anshuman's infrastructure (3 domains × 5 mailboxes) as industry best practice — built confidence",
      "Correct segment identification: B2B Cold Outbound (Segment 01)",
      "Handled the Instantly comparison confidently using the playbook rebuttal: 'Warmy goes further — we advise on full infrastructure'",
      "Pricing was transparent and confident: $29 × 15 = $435/mo",
    ],
    improve: [
      "Knowledge gap: hesitated when asked whether Warmy replies from the user's mailbox — this is a basic product question that Sofiia should know cold",
      "Never asked about domain age — critical for B2B cold setup",
      "Never asked how long Anshuman has had deliverability issues — must-ask question skipped",
      "Close was soft: accepted 'about a week' without urgency. Should have asked: 'When are your next campaigns launching?' to create natural urgency",
    ],
    score: 79,
    playbook_verdict: "Good framework but two must-ask questions skipped (domain age, issue duration). The product knowledge gap on the reply-from-mailbox question needs to be resolved — this is appearing in multiple Sofiia calls.",
  },
  {
    id: "M022", meetingId: "f3357285-4afe-4011-a136-cdb646eef9ec",
    ae: "sofiiar@warmy.io", contact: "Ayesha Mahera + Sabreena", company: "CloudHire.ai",
    type: "Proposal", date: "2026-05-15", duration: "29 min",
    framework_scores: {
      icebreaker: 4, discovery: 4, diagnosis: 4, solution_fit: 4, close: 4,
    },
    went_well: [
      "Correct segment: B2B Cold Outbound (Segment 01) — AI hiring platform sending cold outreach",
      "IMAP requirement explained correctly and precisely — good technical depth",
      "Two-domain pricing was clear and well-structured",
      "Ayesha confirmed management approval was already underway — strong buying signal Sofiia capitalised on",
      "Payment link sent immediately after the call",
    ],
    improve: [
      "Same reply-from-mailbox uncertainty as in the Anshuman call — this is now a confirmed recurring knowledge gap across multiple calls",
      "Bot traffic / click tracking discussion was confusing — Sofiia seemed unsure about the clicks vs no-clicks recommendation for B2B cold",
      "Domain age not confirmed — new domains need different warm-up expectations",
    ],
    score: 80,
    playbook_verdict: "Solid proposal call. The reply-from-mailbox question has now appeared in 2 separate calls this week. This must be clarified with the product team and communicated to Sofiia as an urgent coaching action.",
  },
  {
    id: "M023", meetingId: "ca65b2d4-fbf9-458b-9336-43a3d87fc60d",
    ae: "sofiiar@warmy.io", contact: "Charlie Mullinger", company: "WeConference Group",
    type: "Demo", date: "2026-05-14", duration: "24 min",
    framework_scores: {
      icebreaker: 4, discovery: 4, diagnosis: 5, solution_fit: 5, close: 3,
    },
    went_well: [
      "Immediately diagnosed the root cause: Charlie was using aliases for cold outreach — this is a fundamental infrastructure mistake",
      "Pointed it out directly and decisively — 'this is why it's not working' — perfect doctor behaviour",
      "Correct solution: separate domain, individual mailboxes, 40 cold emails/day each",
      "Reactivated Charlie's 6-month-old trial on the call — smart and proactive",
      "Correctly identified the alias vs separate mailbox distinction — strong product knowledge",
    ],
    improve: [
      "Starter plan is now annual-only — Sofiia flagged this but it may be a blocker for Charlie who seemed to want monthly",
      "No pricing confirmed on the call — Charlie needs a number to evaluate",
      "Close was soft — 'by end of trial' is vague. Should have asked: 'When do you want to have this fixed?' to set a decision deadline",
      "Ashley (the other stakeholder) was mentioned — should have asked to include Ashley in the follow-up email and ideally the next call",
    ],
    score: 83,
    playbook_verdict: "Excellent diagnosis — Sofiia immediately identified and explained the alias problem. The playbook's 'point out the mistakes, then solve them' instruction was followed perfectly. The gap is the close — no number discussed, no date set.",
  },
];

const PIPELINE_STAGES = {
  meeting_scheduled: { label: "Meeting Scheduled", color: "#64748b", bg: "rgba(100,116,139,0.12)", order: 0 },
  proposal_sent:     { label: "Price Proposal Sent", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", order: 1 },
  negotiation:       { label: "Negotiation", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", order: 2 },
  disqualified:      { label: "Disqualified", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", order: 3 },
  closed_won:        { label: "Closed Won ✓", color: "#10b981", bg: "rgba(16,185,129,0.12)", order: 4 },
  closed_lost:       { label: "Closed Lost", color: "#ef4444", bg: "rgba(239,68,68,0.12)", order: 5 },
};

// Compute what action is required and urgency based on playbook rules
function getPipelineAction(deal) {
  const d = deal.daysInStage;
  const stage = deal.stage;

  if (stage === "meeting_scheduled") {
    if (deal.noShow) return { type: "mark_disqualified", label: "Mark No-Show / Disqualify", color: "#8b5cf6", urgency: "high", description: "Prospect didn't join — add disqualification reason and move on." };
    return { type: "move_proposal", label: "Move → Price Proposal Sent", color: "#3b82f6", urgency: "medium", description: "Prospect joined the call. Move the deal to Price Proposal Sent and send the proposal." };
  }
  if (stage === "proposal_sent") {
    if (d >= 10) return { type: "auto_close_warning", label: "⚠ Mark Closed Lost NOW", color: "#ef4444", urgency: "critical", description: `Day ${d} — AUTO-CLOSE triggered. No activity after Day 9. Mark lost immediately or it closes automatically.` };
    if (d >= 9) return { type: "day9_decision", label: "Day 9 Decision Required", color: "#ef4444", urgency: "critical", description: "Final day. Move to Negotiation if discussions are alive, or mark Closed Lost." };
    if (d >= 3 && !deal.followUpSentDay3) return { type: "day3_followup", label: "Send Day-3 Follow-up", color: "#f59e0b", urgency: "high", description: `Day ${d} — Follow-up is due. Send email, log activity in HubSpot, then mark this done.` };
    if (d >= 3 && deal.followUpSentDay3) return { type: "waiting", label: "Waiting for reply", color: "#64748b", urgency: "low", description: `Follow-up sent on Day 3. Monitoring for reply.` };
    return { type: "waiting", label: `Day ${d} of 10 — On track`, color: "#64748b", urgency: "low", description: `Proposal sent ${d} day${d !== 1 ? "s" : ""} ago. Day-3 follow-up will be due soon.` };
  }
  if (stage === "negotiation") {
    if (d >= 10) return { type: "negotiation_auto_close", label: "⚠ Mark Closed Lost NOW", color: "#ef4444", urgency: "critical", description: `Day ${d} in Negotiation — 10-day cap hit. Log activity to reset clock or mark lost.` };
    if (d >= 7) return { type: "negotiation_warning", label: "Log Activity or Close", color: "#f97316", urgency: "high", description: `Day ${d}/10 in Negotiation. ${10 - d} days left before auto-close. Log a call, email, or note.` };
    return { type: "negotiation_active", label: `Day ${d}/10 in Negotiation`, color: "#f59e0b", urgency: "medium", description: "Keep activity logged. Silence for 10 days triggers auto-close." };
  }
  return { type: "none", label: "No action needed", color: "#10b981", urgency: "none", description: "Deal is in a terminal state." };
}

// Seeded pipeline deals from real HubSpot + Avoma data
const INITIAL_PIPELINE = [];

const MCP = [
  { type: "url", url: "https://mcp.hubspot.com/anthropic",      name: "hubspot" },
  { type: "url", url: "https://gmailmcp.googleapis.com/mcp/v1", name: "gmail"   },
];

async function callClaude(system, userMsg) {
  const r = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      system, messages: [{ role: "user", content: userMsg }],
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
  const pad = size === "sm" ? "2px 8px" : "4px 12px";
  const fs = size === "sm" ? 10 : 12;
  return (
    <span style={{
      display: "inline-block", padding: pad, borderRadius: 20,
      background: `${color}15`, border: `1px solid ${color}35`,
      color, fontSize: fs, fontWeight: 600, letterSpacing: "0.02em",
      whiteSpace: "nowrap", lineHeight: 1.6,
    }}>{label}</span>
  );
}

function HubSpotLink({ dealId, contactName }) {
  if (!dealId) return null;
  const url = `https://app.hubspot.com/contacts/19511446/record/0-3/${dealId}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="hubspot-btn" title={`Open ${contactName} in HubSpot`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.164 7.93V5.084a2.198 2.198 0 0 0 1.267-1.978V3.05A2.198 2.198 0 0 0 17.234.853h-.057a2.198 2.198 0 0 0-2.197 2.197v.057a2.198 2.198 0 0 0 1.267 1.978V7.93a6.231 6.231 0 0 0-2.964 1.29L5.42 3.617a2.431 2.431 0 1 0-1.172 1.465l7.698 5.516a6.28 6.28 0 0 0-.875 3.218 6.28 6.28 0 0 0 .875 3.218L5.42 17.82a2.431 2.431 0 1 0 1.172 1.465l7.723-5.529a6.254 6.254 0 0 0 9.842-5.14 6.253 6.253 0 0 0-5.993-6.686zM17.234 19.49a3.673 3.673 0 1 1 0-7.346 3.673 3.673 0 0 1 0 7.346z"/>
      </svg>
      HubSpot
    </a>
  );
}

function AEAvatar({ email, size = 32 }) {
  const p = AE_PROFILES[email] || { initials: "?", color: "#FF6B2B", name: "Unknown" };
  return (
    <div title={p.name} style={{
      width: size, height: size, borderRadius: "50%",
      background: `${p.color}20`, border: `2px solid ${p.color}45`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.32, fontWeight: 700, color: p.color, flexShrink: 0,
      letterSpacing: "0.03em",
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

  const fuConfig = FU_CONFIG[task.type] || FU_CONFIG["fu1"];
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
      background: "var(--warmy-navy-2)",
      border: `1px solid var(--warmy-border)`,
      borderRadius: 12, overflow: "hidden",
      borderLeft: `3px solid ${urgencyColor}`,
      animation: "slideUp 0.3s ease",
      marginBottom: 8,
    }}>
      {/* Card header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
      >
        <AEAvatar email={task.ae} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Lead name + company — prominent */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--warmy-text)", letterSpacing: "-0.2px" }}>{task.contactName}</span>
            <span style={{ fontSize: 12, color: "var(--warmy-text-dim)" }}>·</span>
            <span style={{ fontSize: 13, color: "var(--warmy-text-muted)", fontWeight: 500 }}>{task.company}</span>
            {task.isNew && <Badge label="NEW" color="var(--warmy-green)" />}
          </div>
          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Badge label={fuConfig.badge} color={fuConfig.color} />
            {task.daysSinceMeeting >= 3 && <Badge label={`Day ${task.daysSinceMeeting}`} color={urgencyColor} />}
            <span style={{ fontSize: 11, color: "var(--warmy-text-dim)" }}>{aeProfile?.name}</span>
            <span style={{ fontSize: 11, color: "var(--warmy-text-dim)" }}>·</span>
            <span style={{ fontSize: 11, color: "var(--warmy-text-muted)", fontWeight: 500 }}>{task.dealValue}</span>
            {task.hubspotDealId && (
              <span onClick={e => e.stopPropagation()}>
                <HubSpotLink dealId={task.hubspotDealId} contactName={task.contactName} />
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {task.pipelineStatus === "pending" && (
            <Badge label="PIPELINE" color="var(--warmy-orange)" />
          )}
          <span style={{ color: "var(--warmy-text-dim)", fontSize: 14, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--warmy-border-soft)" }}>

          {/* Meeting context */}
          <div style={{ marginTop: 12, padding: "12px 14px", background: "var(--warmy-navy-3)", borderRadius: 8, marginBottom: 14, borderLeft: "2px solid var(--warmy-orange-border)" }}>
            <p style={{ margin: "0 0 5px", fontSize: 10, color: "var(--warmy-orange)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Meeting Context</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--warmy-text-muted)", lineHeight: 1.7 }}>{task.meetingContext}</p>
            {task.nextStep && (
              <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--warmy-orange)", fontWeight: 500 }}>→ {task.nextStep}</p>
            )}
          </div>

          {/* Draft area */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 11, color: "var(--warmy-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
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
              placeholder={`Click "Generate Draft" to write ${fuConfig.label} in ${aeProfile?.name}'s voice…`}
              style={{
                width: "100%", minHeight: 160, padding: "14px",
                background: "var(--warmy-navy-3)", border: "1px solid var(--warmy-border)",
                borderRadius: 8, color: "var(--warmy-text)", fontSize: 13, lineHeight: 1.75,
                fontFamily: "'Inter', sans-serif", resize: "vertical",
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
                flex: 1, minWidth: 140, padding: "11px 16px", borderRadius: 8,
                background: draft && !sending ? "var(--warmy-orange)" : "var(--warmy-navy-4)",
                border: `1px solid ${draft && !sending ? "transparent" : "var(--warmy-border)"}`,
                color: draft && !sending ? "#fff" : "var(--warmy-text-dim)",
                fontSize: 13, fontWeight: 600, cursor: draft && !sending ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
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
                  flex: 1, minWidth: 140, padding: "11px 16px", borderRadius: 8,
                  background: "var(--warmy-orange-dim)", border: "1px solid var(--warmy-orange-border)",
                  color: "var(--warmy-orange)", fontSize: 13, fontWeight: 600,
                  cursor: pipelining ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
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

function PipelineDealCard({ deal, onStageChange, onFollowUpDone, onLogActivity }) {
  const [expanded, setExpanded] = useState(false);
  const [disqualReason, setDisqualReason] = useState("");
  const [showDisqualModal, setShowDisqualModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEmailPanel, setShowEmailPanel] = useState(false);

  const generateFollowUpEmail = async () => {
    setGeneratingEmail(true);
    setShowEmailPanel(true);
    const aeProfile = AE_PROFILES[deal.ae] || {};
    const fuLabel = deal.daysInStage >= 9 ? "final follow-up" : deal.daysInStage >= 6 ? "third follow-up" : "Day-3 follow-up";
    try {
      const text = await callClaude(
        `You are writing a ${fuLabel} email for ${aeProfile.name || "an AE"} at Warmy.io. 
Tone: ${aeProfile.tone || "professional, warm"}. 
Phrases they use: ${(aeProfile.phrases || []).join(", ")}.
Closing: ${aeProfile.closing || "Best,\n" + (aeProfile.name || "AE")}.
Write ONLY the email body — no subject line, no metadata. Under 120 words. Reference specifics from the context.`,
        `Write a ${fuLabel} email to ${deal.contactName} at ${deal.company}.
Deal value: ${deal.dealValue}. Days since proposal: ${deal.daysInStage}.
Context: ${deal.notes}
The email should feel like a natural check-in, reference what was discussed, create gentle urgency, and have a clear CTA.`
      );
      setEmailDraft(text.trim());
    } catch (e) {
      setEmailDraft(`Error generating draft: ${e.message}`);
    }
    setGeneratingEmail(false);
  };

  const sendFollowUpEmail = async () => {
    if (!emailDraft) return;
    setSendingEmail(true);
    try {
      await callClaude(
        "You are a Gmail assistant for Warmy.io sales team.",
        `Use Gmail MCP to send this follow-up email:
To: ${deal.contactEmail || deal.contactName + " (find email in HubSpot deal " + deal.hubspotId + ")"}
Subject: Re: Warmy.io — ${deal.company}
Body:
${emailDraft}

After sending, log it as an activity in HubSpot on deal ID ${deal.hubspotId}.`
      );
      setActionSuccess("✓ Follow-up sent via Gmail + logged in HubSpot");
      setShowEmailPanel(false);
      onFollowUpDone(deal.id);
    } catch (e) {
      setActionError("Send failed: " + e.message);
    }
    setSendingEmail(false);
  };

  const action = getPipelineAction(deal);
  const stageConfig = PIPELINE_STAGES[deal.stage] || PIPELINE_STAGES.meeting_scheduled;
  const aeProfile = AE_PROFILES[deal.ae] || {};

  const urgencyBorder = {
    critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "rgba(255,255,255,0.07)", none: "rgba(255,255,255,0.07)"
  }[action.urgency];

  const doUpdate = async (url, body) => {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, dealId: String(deal.hubspotId || "") }),
    });
    const data = await resp.json();
    if (!resp.ok || data.error) throw new Error(data.error || `HTTP ${resp.status}`);
    return data;
  };

  const handleStageChange = async (newStage, reason) => {
    if (!deal.hubspotId) { setActionError("No HubSpot deal ID on this deal"); return; }
    setLoading(true); setActionError(null); setActionSuccess(null);
    try {
      const note = `Stage → ${PIPELINE_STAGES[newStage]?.label || newStage} — ${new Date().toLocaleDateString("en-GB")}${reason ? ". Reason: " + reason : ""}`;
      await doUpdate("/api/hubspot-update", { stage: newStage, note });
      setActionSuccess(`✓ Moved to ${PIPELINE_STAGES[newStage]?.label}`);
      onStageChange(deal.id, newStage, reason);
    } catch (e) { setActionError(e.message); }
    setLoading(false);
  };

  const handleDay3Done = async () => {
    if (!deal.hubspotId) { setActionError("No HubSpot deal ID on this deal"); return; }
    setLoading(true); setActionError(null); setActionSuccess(null);
    try {
      await doUpdate("/api/hubspot-log", { note: `Day-3 follow-up sent — ${new Date().toLocaleDateString("en-GB")}` });
      setActionSuccess("✓ Day-3 follow-up logged in HubSpot");
      onFollowUpDone(deal.id);
    } catch (e) { setActionError(e.message); }
    setLoading(false);
  };

  const handleLogActivity = async () => {
    if (!deal.hubspotId) { setActionError("No HubSpot deal ID on this deal"); return; }
    setLoading(true); setActionError(null); setActionSuccess(null);
    try {
      await doUpdate("/api/hubspot-log", { note: `Activity logged — ${new Date().toLocaleDateString("en-GB")} — Negotiation clock reset` });
      setActionSuccess("✓ Activity logged — clock reset");
      onLogActivity(deal.id);
    } catch (e) { setActionError(e.message); }
    setLoading(false);
  };

  return (
    <>
      {/* Disqualify modal */}
      {showDisqualModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#0f1623", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 440 }}>
            <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>Mark as Disqualified / No-Show</p>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Required: write a specific reason why this deal is being disqualified.</p>
            <textarea
              value={disqualReason}
              onChange={e => setDisqualReason(e.target.value)}
              placeholder="e.g. Prospect no-show, didn't respond to rebook attempts. Wrong ICP — sends <10 emails/day."
              style={{ width: "100%", minHeight: 90, padding: 10, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#cbd5e1", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", resize: "vertical", boxSizing: "border-box", outline: "none" }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                onClick={() => { if (!disqualReason.trim()) return; handleStageChange("disqualified", disqualReason); setShowDisqualModal(false); }}
                disabled={!disqualReason.trim() || loading}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 8, background: disqualReason.trim() ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${disqualReason.trim() ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`, color: disqualReason.trim() ? "#8b5cf6" : "#334155", fontSize: 13, fontWeight: 600, cursor: disqualReason.trim() ? "pointer" : "not-allowed", fontFamily: "'JetBrains Mono', monospace" }}
              >Confirm Disqualified</button>
              <button onClick={() => setShowDisqualModal(false)} style={{ padding: "10px 14px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.07)", color: "#475569", fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${urgencyBorder}`, borderRadius: 12, marginBottom: 8, overflow: "hidden", borderLeft: `3px solid ${action.color}` }}>
        {/* Header */}
        <div onClick={() => setExpanded(e => !e)} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <AEAvatar email={deal.ae} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--warmy-text)", letterSpacing: "-0.2px" }}>{deal.contactName}</span>
              <span style={{ fontSize: 13, color: "var(--warmy-text-muted)", fontWeight: 500 }}>· {deal.company}</span>
              <Badge label={stageConfig.label} color={stageConfig.color} />
              {action.urgency === "critical" && <Badge label="⚠ URGENT" color="var(--warmy-red)" />}
              {action.urgency === "high" && deal.stage !== "meeting_scheduled" && <Badge label={`Day ${deal.daysInStage}`} color="var(--warmy-orange)" />}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: action.color, fontWeight: 600 }}>{action.label}</span>
              <span style={{ fontSize: 11, color: "var(--warmy-text-dim)" }}>·</span>
              <span style={{ fontSize: 11, color: "var(--warmy-text-muted)" }}>{deal.dealValue}</span>
              {deal.hubspotId && (
                <HubSpotLink dealId={deal.hubspotId} contactName={deal.contactName} />
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--warmy-text-dim)" }}>{aeProfile.name?.split(" ")[0]}</span>
            <span style={{ color: "var(--warmy-text-dim)", fontSize: 14, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none" }}>▾</span>
          </div>
        </div>

        {/* Expanded action panel */}
        {expanded && (
          <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--warmy-border-soft)" }}>
            {/* Action description */}
            <div style={{ margin: "12px 0", padding: "12px 14px", borderRadius: 8, background: `${action.color}10`, border: `1px solid ${action.color}25`, fontSize: 13, color: "var(--warmy-text-muted)", lineHeight: 1.65, borderLeft: `3px solid ${action.color}` }}>
              <span style={{ color: action.color, fontWeight: 600 }}>What to do: </span>{action.description}
            </div>

            {/* Day progress bar for timed stages */}
            {(deal.stage === "proposal_sent" || deal.stage === "negotiation") && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11, color: "var(--warmy-text-dim)" }}>
                  <span>Day {deal.daysInStage}</span>
                  <span style={{ color: deal.daysInStage >= 9 ? "var(--warmy-red)" : deal.daysInStage >= 3 ? "var(--warmy-orange)" : "var(--warmy-green)" }}>
                    {deal.daysInStage >= 10 ? "AUTO-CLOSE NOW" : `${10 - deal.daysInStage} days left`}
                  </span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4, transition: "width 0.5s ease",
                    width: `${Math.min((deal.daysInStage / 10) * 100, 100)}%`,
                    background: deal.daysInStage >= 9 ? "#ef4444" : deal.daysInStage >= 3 ? "#f59e0b" : "#10b981",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>Day 0</span><span style={{ color: "#f59e0b" }}>Day 3 FU</span><span style={{ color: "#ef4444" }}>Day 9 Decision</span><span>Day 10 Auto-close</span>
                </div>
              </div>
            )}

            {/* Deal context */}
            <div style={{ marginBottom: 14, padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
              <p style={{ margin: "0 0 3px", fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Notes</p>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{deal.notes}</p>
            </div>

            {/* Action buttons based on stage + playbook rules */}
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>

              {/* Meeting Scheduled: join or no-show */}
              {deal.stage === "meeting_scheduled" && (
                <>
                  <button onClick={() => handleStageChange("proposal_sent")} disabled={loading}
                    style={{ flex: 1, minWidth: 160, padding: "10px 14px", borderRadius: 8, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#3b82f6", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                    ✓ Prospect Joined → Move to Proposal Sent
                  </button>
                  <button onClick={() => setShowDisqualModal(true)} disabled={loading}
                    style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "#8b5cf6", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                    ✗ No-Show → Disqualify
                  </button>
                </>
              )}

              {/* Proposal Sent Day 3+: email generator */}
              {deal.stage === "proposal_sent" && deal.daysInStage >= 3 && !deal.followUpSentDay3 && deal.daysInStage < 9 && (
                <div style={{ width: "100%" }}>
                  <button onClick={generateFollowUpEmail} disabled={generatingEmail || loading}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: showEmailPanel ? "8px 8px 0 0" : 8, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)", borderBottom: showEmailPanel ? "none" : undefined, color: "#f59e0b", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {generatingEmail ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span> Generating…</> : `✦ Generate Day-${deal.daysInStage} Follow-up Email`}
                  </button>
                  {showEmailPanel && (
                    <div style={{ border: "1px solid rgba(245,158,11,0.35)", borderTop: "none", borderRadius: "0 0 8px 8px", padding: 12, background: "var(--warmy-navy-3)" }}>
                      <textarea
                        value={emailDraft}
                        onChange={e => setEmailDraft(e.target.value)}
                        placeholder="Generating email in AE's voice…"
                        style={{ width: "100%", minHeight: 140, padding: 12, background: "var(--warmy-navy)", border: "1px solid var(--warmy-border)", borderRadius: 6, color: "var(--warmy-text)", fontSize: 12, lineHeight: 1.7, fontFamily: "'Inter', sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 8 }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={sendFollowUpEmail} disabled={!emailDraft || sendingEmail || generatingEmail}
                          style={{ flex: 1, padding: "9px 14px", borderRadius: 8, background: emailDraft && !sendingEmail ? "var(--warmy-orange)" : "var(--warmy-navy-4)", border: "none", color: emailDraft && !sendingEmail ? "#fff" : "var(--warmy-text-dim)", fontSize: 12, fontWeight: 700, cursor: emailDraft && !sendingEmail ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          {sendingEmail ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span> Sending…</> : "✉ Send via Gmail"}
                        </button>
                        <button onClick={handleDay3Done} disabled={loading}
                          style={{ padding: "9px 14px", borderRadius: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          ✓ Mark Sent (no email)
                        </button>
                        <button onClick={() => setShowEmailPanel(false)}
                          style={{ padding: "9px 12px", borderRadius: 8, background: "transparent", border: "1px solid var(--warmy-border)", color: "var(--warmy-text-dim)", fontSize: 12, cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Proposal Sent Day 9: email + negotiation or lost */}
              {deal.stage === "proposal_sent" && deal.daysInStage >= 9 && (
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Email generator for final follow-up */}
                  <button onClick={generateFollowUpEmail} disabled={generatingEmail}
                    style={{ width: "100%", padding: "9px 14px", borderRadius: showEmailPanel ? "8px 8px 0 0" : 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderBottom: showEmailPanel ? "none" : undefined, color: "var(--warmy-red)", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {generatingEmail ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span> Generating…</> : `✦ Generate Final Follow-up (Day ${deal.daysInStage})`}
                  </button>
                  {showEmailPanel && (
                    <div style={{ border: "1px solid rgba(239,68,68,0.25)", borderTop: "none", borderRadius: "0 0 8px 8px", padding: 12, background: "var(--warmy-navy-3)", marginTop: -8 }}>
                      <textarea value={emailDraft} onChange={e => setEmailDraft(e.target.value)}
                        placeholder="Generating final follow-up…"
                        style={{ width: "100%", minHeight: 130, padding: 12, background: "var(--warmy-navy)", border: "1px solid var(--warmy-border)", borderRadius: 6, color: "var(--warmy-text)", fontSize: 12, lineHeight: 1.7, fontFamily: "'Inter', sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={sendFollowUpEmail} disabled={!emailDraft || sendingEmail}
                          style={{ flex: 1, padding: "9px 14px", borderRadius: 8, background: emailDraft ? "var(--warmy-orange)" : "var(--warmy-navy-4)", border: "none", color: emailDraft ? "#fff" : "var(--warmy-text-dim)", fontSize: 12, fontWeight: 700, cursor: emailDraft ? "pointer" : "not-allowed" }}>
                          {sendingEmail ? "Sending…" : "✉ Send via Gmail"}
                        </button>
                        <button onClick={() => setShowEmailPanel(false)} style={{ padding: "9px 12px", borderRadius: 8, background: "transparent", border: "1px solid var(--warmy-border)", color: "var(--warmy-text-dim)", fontSize: 12, cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleStageChange("negotiation")} disabled={loading}
                      style={{ flex: 1, padding: "9px 14px", borderRadius: 8, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)", color: "#f59e0b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      → Move to Negotiation
                    </button>
                    <button onClick={() => handleStageChange("closed_lost", "No response after Day 9 — no active discussions")} disabled={loading}
                      style={{ flex: 1, padding: "9px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "var(--warmy-red)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      ✕ Mark Closed Lost
                    </button>
                  </div>
                </div>
              )}

              {/* Auto-close warning Day 10+ */}
              {deal.stage === "proposal_sent" && deal.daysInStage >= 10 && (
                <button onClick={() => handleStageChange("closed_lost", `Auto-close: no activity for ${deal.daysInStage} days after proposal`)} disabled={loading}
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                  ⚠ Mark Closed Lost (Auto-close overdue)
                </button>
              )}

              {/* Negotiation: log activity or close */}
              {deal.stage === "negotiation" && (
                <>
                  <button onClick={handleLogActivity} disabled={loading}
                    style={{ flex: 1, minWidth: 130, padding: "10px 14px", borderRadius: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                    ✎ Log Activity (Reset Clock)
                  </button>
                  <button onClick={() => handleStageChange("closed_won")} disabled={loading}
                    style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                    ✓ Closed Won
                  </button>
                  <button onClick={() => handleStageChange("closed_lost", "Negotiation stalled — no agreement reached")} disabled={loading}
                    style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                    ✕ Closed Lost
                  </button>
                </>
              )}

              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", fontSize: 12, color: "var(--warmy-orange)", fontWeight: 600 }}>
                  <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span> Updating HubSpot…
                </div>
              )}
              {actionError && (
                <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", fontSize: 12, color: "var(--warmy-red)", fontWeight: 500 }}>
                  ✗ {actionError}
                </div>
              )}
              {actionSuccess && (
                <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.3)", fontSize: 12, color: "var(--warmy-green)", fontWeight: 600 }}>
                  {actionSuccess}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function PipelineTab({ pipeline, activePipeline, pipelineUrgent, pipelineLoading, pipelineError, pipelineLastSync, loadPipeline, aeFilter, onStageChange, onFollowUpDone, onLogActivity }) {
  const [openSections, setOpenSections] = useState({ urgent: true, meeting_scheduled: false, proposal_sent: false, negotiation: false, closed: false });

  const toggle = (key) => setOpenSections(p => ({ ...p, [key]: !p[key] }));

  const urgent = activePipeline.filter(d => ["critical","high"].includes(getPipelineAction(d).urgency));
  const byStage = {
    meeting_scheduled: activePipeline.filter(d => d.stage === "meeting_scheduled"),
    proposal_sent:     activePipeline.filter(d => d.stage === "proposal_sent"),
    negotiation:       activePipeline.filter(d => d.stage === "negotiation"),
  };
  const closed = pipeline.filter(d => ["closed_won","closed_lost","disqualified"].includes(d.stage) && (aeFilter === "all" || d.ae === aeFilter));

  const Section = ({ id, label, count, color, icon, isUrgent, children }) => {
    const open = openSections[id];
    return (
      <div style={{ marginBottom: 8 }}>
        <div onClick={() => toggle(id)} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", cursor: "pointer", userSelect: "none",
          background: isUrgent ? "rgba(248,81,73,0.06)" : "var(--warmy-navy-2)",
          border: `1px solid ${isUrgent ? "rgba(248,81,73,0.3)" : "var(--warmy-border)"}`,
          borderRadius: open ? "10px 10px 0 0" : 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 15 }}>{icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: isUrgent ? "var(--warmy-red)" : "var(--warmy-text)" }}>{label}</span>
            <span style={{ padding: "2px 10px", borderRadius: 20, background: `${color}18`, border: `1px solid ${color}35`, fontSize: 12, fontWeight: 700, color }}>{count}</span>
            {isUrgent && count > 0 && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--warmy-red)", animation: "pulse 1.2s ease infinite" }} />}
          </div>
          <span style={{ color: "var(--warmy-text-dim)", fontSize: 13, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
        {open && (
          <div style={{ border: `1px solid ${isUrgent ? "rgba(248,81,73,0.2)" : "var(--warmy-border)"}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "8px 8px 8px", background: "rgba(0,0,0,0.15)" }}>
            {count === 0
              ? <div style={{ padding: "16px", textAlign: "center", fontSize: 12, color: "var(--warmy-text-dim)" }}>No deals in this section</div>
              : children
            }
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--warmy-text)", marginBottom: 4, letterSpacing: "-0.3px" }}>Pipeline Control</h2>
          <p style={{ fontSize: 13, color: "var(--warmy-text-muted)" }}>
            Live HubSpot · grouped by stage
            {pipelineLastSync && <span style={{ color: "var(--warmy-text-dim)", marginLeft: 8 }}>· synced {pipelineLastSync.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>}
          </p>
        </div>
        <button onClick={loadPipeline} disabled={pipelineLoading}
          style={{ padding: "8px 14px", borderRadius: 8, background: "var(--warmy-navy-3)", border: "1px solid var(--warmy-border)", color: "var(--warmy-text-muted)", fontSize: 12, fontWeight: 600, cursor: pipelineLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", animation: pipelineLoading ? "spin 0.8s linear infinite" : "none" }}>⟳</span>
          {pipelineLoading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {pipelineError && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.25)", fontSize: 12, color: "var(--warmy-red)" }}>
          {pipelineError.includes("HUBSPOT_TOKEN") ? "⚠ Add HUBSPOT_TOKEN to Render env vars" : `⚠ ${pipelineError}`}
        </div>
      )}

      {pipelineLoading && activePipeline.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 56, borderRadius: 10, background: "var(--warmy-navy-2)", border: "1px solid var(--warmy-border)", animation: "pulse 1.5s ease infinite" }} />)}
        </div>
      )}

      {/* ── 1. ACTION REQUIRED ── */}
      <Section id="urgent" label="Action Required" count={urgent.length} color="var(--warmy-red)" icon="⚡" isUrgent={true}>
        {[...urgent].sort((a,b) => {
          const o = { critical: 0, high: 1 };
          return (o[getPipelineAction(a).urgency]||1) - (o[getPipelineAction(b).urgency]||1);
        }).map(deal => (
          <PipelineDealCard key={deal.id} deal={deal} onStageChange={onStageChange} onFollowUpDone={onFollowUpDone} onLogActivity={onLogActivity} />
        ))}
      </Section>

      {/* ── 2. MEETING SCHEDULED ── */}
      <Section id="meeting_scheduled" label="Meeting Scheduled" count={byStage.meeting_scheduled.length} color={PIPELINE_STAGES.meeting_scheduled.color} icon="📅">
        {byStage.meeting_scheduled.map(deal => (
          <PipelineDealCard key={deal.id} deal={deal} onStageChange={onStageChange} onFollowUpDone={onFollowUpDone} onLogActivity={onLogActivity} />
        ))}
      </Section>

      {/* ── 3. PRICE PROPOSAL SENT ── */}
      <Section id="proposal_sent" label="Price Proposal Sent" count={byStage.proposal_sent.length} color={PIPELINE_STAGES.proposal_sent.color} icon="📄">
        {[...byStage.proposal_sent].sort((a,b) => b.daysInStage - a.daysInStage).map(deal => (
          <PipelineDealCard key={deal.id} deal={deal} onStageChange={onStageChange} onFollowUpDone={onFollowUpDone} onLogActivity={onLogActivity} />
        ))}
      </Section>

      {/* ── 4. NEGOTIATION ── */}
      <Section id="negotiation" label="Negotiation" count={byStage.negotiation.length} color={PIPELINE_STAGES.negotiation.color} icon="🤝">
        {byStage.negotiation.map(deal => (
          <PipelineDealCard key={deal.id} deal={deal} onStageChange={onStageChange} onFollowUpDone={onFollowUpDone} onLogActivity={onLogActivity} />
        ))}
      </Section>

      {/* ── 5. CLOSED ── */}
      {closed.length > 0 && (
        <Section id="closed" label="Closed This Period" count={closed.length} color="var(--warmy-text-dim)" icon="✓">
          {closed.map(deal => {
            const s = PIPELINE_STAGES[deal.stage];
            return (
              <div key={deal.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, marginBottom: 4, background: "rgba(255,255,255,0.02)" }}>
                <AEAvatar email={deal.ae} size={28} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--warmy-text-muted)" }}>{deal.contactName}</span>
                  <span style={{ fontSize: 12, color: "var(--warmy-text-dim)", marginLeft: 8 }}>· {deal.company}</span>
                </div>
                <Badge label={s?.label || deal.stage} color={s?.color || "#64748b"} />
              </div>
            );
          })}
        </Section>
      )}
    </div>
  );
}

function MeetingAnalysisCard({ analysis }) {
  const [expanded, setExpanded] = useState(false);
  const aeProfile = AE_PROFILES[analysis.ae];
  const scoreColor = analysis.score >= 85 ? "var(--warmy-green)" : analysis.score >= 75 ? "var(--warmy-orange)" : "var(--warmy-red)";

  const FRAMEWORK_LABELS = {
    icebreaker: "Icebreaker", discovery: "Discovery", diagnosis: "Diagnosis",
    solution_fit: "Solution Fit", close: "Close",
  };

  return (
    <div style={{ background: "var(--warmy-navy-2)", border: "1px solid var(--warmy-border)", borderRadius: 12, overflow: "hidden", marginBottom: 8 }}>
      <div onClick={() => setExpanded(e => !e)} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <AEAvatar email={analysis.ae} size={36} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--warmy-text)", letterSpacing: "-0.2px" }}>{analysis.contact}</span>
            <span style={{ fontSize: 12, color: "var(--warmy-text-dim)" }}>·</span>
            <span style={{ fontSize: 13, color: "var(--warmy-text-muted)" }}>{analysis.company}</span>
            <Badge label={analysis.type} color={aeProfile?.color || "#64748b"} />
          </div>
          <span style={{ fontSize: 11, color: "var(--warmy-text-dim)" }}>
            {analysis.date} · {analysis.duration} · {aeProfile?.name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor, lineHeight: 1, letterSpacing: "-1px" }}>{analysis.score}</div>
            <div style={{ fontSize: 9, color: "var(--warmy-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>/ 100</div>
          </div>
          <span style={{ color: "var(--warmy-text-dim)", fontSize: 14, transition: "transform 0.2s", display: "inline-block", transform: expanded ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--warmy-border-soft)" }}>

          {/* Framework scorecard */}
          {analysis.framework_scores && (
            <div style={{ marginTop: 14, marginBottom: 14 }}>
              <p style={{ margin: "0 0 8px", fontSize: 10, color: "var(--warmy-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Call Framework Scores</p>
              <div style={{ display: "flex", gap: 6 }}>
                {Object.entries(analysis.framework_scores).map(([key, val]) => {
                  const c = val >= 4 ? "var(--warmy-green)" : val >= 3 ? "var(--warmy-orange)" : "var(--warmy-red)";
                  return (
                    <div key={key} style={{ flex: 1, textAlign: "center", padding: "8px 4px", background: `${c}10`, border: `1px solid ${c}30`, borderRadius: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: c }}>{val}<span style={{ fontSize: 10, color: "var(--warmy-text-dim)" }}>/5</span></div>
                      <div style={{ fontSize: 9, color: "var(--warmy-text-dim)", marginTop: 2, lineHeight: 1.3 }}>{FRAMEWORK_LABELS[key]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Playbook verdict */}
          {analysis.playbook_verdict && (
            <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(255,107,43,0.06)", borderLeft: "3px solid var(--warmy-orange)" }}>
              <p style={{ margin: "0 0 3px", fontSize: 10, color: "var(--warmy-orange)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Playbook Verdict</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--warmy-text-muted)", lineHeight: 1.65 }}>{analysis.playbook_verdict}</p>
            </div>
          )}

          {/* Went well / Improve */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 10, color: "var(--warmy-green)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                ✓ What went well
              </p>
              {analysis.went_well.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--warmy-green)", fontSize: 11, flexShrink: 0, marginTop: 2 }}>·</span>
                  <span style={{ fontSize: 12, color: "var(--warmy-text-muted)", lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 10, color: "var(--warmy-orange)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                △ Coaching points
              </p>
              {analysis.improve.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--warmy-orange)", fontSize: 11, flexShrink: 0, marginTop: 2 }}>·</span>
                  <span style={{ fontSize: 12, color: "var(--warmy-text-muted)", lineHeight: 1.6 }}>{item}</span>
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
  const [analyses, setAnalyses] = useState(INITIAL_ANALYSES);
  const [tab, setTab]           = useState("tasks");
  const [pipeline, setPipeline] = useState(INITIAL_PIPELINE);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineError, setPipelineError]     = useState(null);
  const [pipelineLastSync, setPipelineLastSync] = useState(null);

  // Load live pipeline from HubSpot on mount
  const loadPipeline = async () => {
    setPipelineLoading(true);
    setPipelineError(null);
    try {
      const resp = await fetch("/api/hubspot-pipeline");
      const data = await resp.json();
      if (!resp.ok || data.error) {
        setPipelineError(data.error || "HubSpot sync failed");
        return;
      }
      setPipeline(data.pipeline || []);
      setPipelineLastSync(new Date());
    } catch (err) {
      setPipelineError(err.message);
    } finally {
      setPipelineLoading(false);
    }
  };

  // Load on mount
  useEffect(() => { loadPipeline(); }, []);
  const [aeFilter, setAeFilter] = useState("all");
  const [syncing, setSyncing]   = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Action Queue = only FU1 (post-meeting), only pending, exclude closed stages
  // Also cross-reference with live HubSpot pipeline to catch deals closed after task was created
  const CLOSED_STAGES = new Set(["Closed Lost", "Closed Won ✓", "Disqualified", "closed_lost", "closed_won", "disqualified"]);
  const closedHubspotIds = new Set(
    pipeline.filter(d => CLOSED_STAGES.has(d.stage)).map(d => String(d.hubspotId))
  );
  const pendingTasks = tasks.filter(t =>
    t.status === "pending" &&
    t.type === "fu1" &&
    !CLOSED_STAGES.has(t.dealStage) &&
    !(t.hubspotDealId && closedHubspotIds.has(String(t.hubspotDealId))) &&
    (aeFilter === "all" || t.ae === aeFilter)
  ).sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate));

  const sentTasks = tasks.filter(t =>
    t.status === "sent" &&
    t.type === "fu1" &&
    (aeFilter === "all" || t.ae === aeFilter)
  ).sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate));

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

  const [syncLog, setSyncLog] = useState([]);
  const [syncError, setSyncError] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    setSyncLog([]);

    try {
      // Pass existing meeting/transcript IDs so the server skips already-known meetings
      const existingMeetingIds = tasks
        .map(t => t.transcriptId)
        .filter(Boolean);

      const resp = await fetch("/api/avoma-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existingMeetingIds }),
      });

      const data = await resp.json();

      if (!resp.ok || data.error) {
        setSyncError(data.error || "Sync failed");
        return;
      }

      const { newTasks, newAnalyses, message, processed, totalFound } = data;

      setSyncLog([
        `Scanned ${data.totalFound || data.debug?.totalFetched || "?"} meetings from Avoma (last 14 days)`,
        `${data.debug?.completed || 0} completed · ${data.debug?.withTranscript || 0} with transcripts · ${data.newCount || data.processed || 0} new`,
        data.message,
      ]);

      // Update existing task days + add new tasks
      setTasks(prev => {
        const updated = prev.map(t => ({
          ...t,
          daysSinceMeeting: Math.floor(
            (Date.now() - new Date(t.meetingDate + "T12:00:00Z").getTime()) / (1000 * 60 * 60 * 24)
          ),
          type: t.status === "pending" ? (
            t.daysSinceMeeting >= 9 ? "fu4" :
            t.daysSinceMeeting >= 6 ? "fu3" :
            t.daysSinceMeeting >= 3 ? "fu2" : t.type
          ) : t.type,
        }));
        return newTasks && newTasks.length > 0 ? [...updated, ...newTasks] : updated;
      });

      // Add any new analyses
      if (newAnalyses && newAnalyses.length > 0) {
        setAnalyses(prev => [...newAnalyses, ...prev]);
      }

      setLastSync(new Date());
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  // Pipeline handlers
  const handlePipelineStageChange = (id, newStage, reason) => {
    setPipeline(prev => prev.map(d => d.id === id ? { ...d, stage: newStage, daysInStage: 0, lastActivity: new Date().toISOString().split("T")[0] } : d));
  };
  const handleFollowUpDone = (id) => {
    setPipeline(prev => prev.map(d => d.id === id ? { ...d, followUpSentDay3: true, lastActivity: new Date().toISOString().split("T")[0] } : d));
  };
  const handleLogActivity = (id) => {
    setPipeline(prev => prev.map(d => d.id === id ? { ...d, daysInStage: 0, lastActivity: new Date().toISOString().split("T")[0] } : d));
  };

  // Active pipeline deals (not closed)
  const activePipeline = pipeline.filter(d => !["closed_won", "closed_lost", "disqualified"].includes(d.stage) && (aeFilter === "all" || d.ae === aeFilter));
  const pipelineUrgent = activePipeline.filter(d => ["critical", "high"].includes(getPipelineAction(d).urgency));

  const urgentCount = pendingTasks.filter(t => t.daysSinceMeeting >= 6).length;
  const pipelinePending = tasks.filter(t => t.pipelineStatus === "pending").length;

  const AE_LIST = Object.entries(AE_PROFILES).map(([email, p]) => ({ email, ...p }));

  const TAB_CONFIG = [
    { id: "tasks",    label: "Price Proposal Follow Up",        count: pendingTasks.length },
    { id: "pipeline", label: "Pipeline Control",  count: pipelineUrgent.length > 0 ? pipelineUrgent.length : null },
    { id: "analysis", label: "Meeting Analysis",  count: null },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--warmy-navy)",
      color: "#f1f5f9",
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundImage: "radial-gradient(ellipse 50% 35% at 15% 0%, rgba(255,107,43,0.06) 0%, transparent 55%), radial-gradient(ellipse 40% 30% at 85% 100%, rgba(255,107,43,0.03) 0%, transparent 60%)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── WARMY BRAND TOKENS ── */
        :root {
          --warmy-orange: #FF6B2B;
          --warmy-orange-light: #FF8C5A;
          --warmy-orange-dim: rgba(255,107,43,0.12);
          --warmy-orange-border: rgba(255,107,43,0.3);
          --warmy-navy: #0D1117;
          --warmy-navy-2: #161B22;
          --warmy-navy-3: #1C2128;
          --warmy-navy-4: #21262D;
          --warmy-border: rgba(255,255,255,0.08);
          --warmy-border-soft: rgba(255,255,255,0.05);
          --warmy-text: #E6EDF3;
          --warmy-text-muted: #7D8590;
          --warmy-text-dim: #484F58;
          --warmy-green: #3FB950;
          --warmy-red: #F85149;
          --warmy-yellow: #D29922;
          --warmy-blue: #388BFD;
          --warmy-purple: #BC8CFF;
        }

        body { font-family: 'Inter', system-ui, sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

        textarea:focus { border-color: var(--warmy-orange-border) !important; box-shadow: 0 0 0 3px var(--warmy-orange-dim); outline: none; }
        textarea::placeholder { color: var(--warmy-text-dim); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--warmy-navy-4); border-radius: 4px; }
        button { transition: all 0.15s ease; font-family: 'Inter', sans-serif; }
        button:hover:not(:disabled) { filter: brightness(1.08); }
        button:active:not(:disabled) { transform: scale(0.98); }
        a { color: inherit; text-decoration: none; }

        .warmy-card {
          background: var(--warmy-navy-2);
          border: 1px solid var(--warmy-border);
          border-radius: 12px;
          transition: border-color 0.2s;
        }
        .warmy-card:hover { border-color: rgba(255,255,255,0.12); }

        .warmy-btn-primary {
          background: var(--warmy-orange);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          padding: 10px 18px;
          font-size: 13px;
          display: flex; align-items: center; gap: 6px;
        }
        .warmy-btn-primary:hover { background: var(--warmy-orange-light); }

        .warmy-btn-ghost {
          background: transparent;
          color: var(--warmy-text-muted);
          border: 1px solid var(--warmy-border);
          border-radius: 8px;
          cursor: pointer;
          padding: 7px 12px;
          font-size: 12px;
          display: flex; align-items: center; gap: 5px;
        }
        .warmy-btn-ghost:hover { border-color: rgba(255,255,255,0.15); color: var(--warmy-text); }

        .hubspot-btn {
          background: rgba(255,122,89,0.1);
          color: #FF7A59;
          border: 1px solid rgba(255,122,89,0.25);
          border-radius: 6px;
          cursor: pointer;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 600;
          display: inline-flex; align-items: center; gap: 4px;
          text-decoration: none;
        }
        .hubspot-btn:hover { background: rgba(255,122,89,0.18); border-color: rgba(255,122,89,0.4); }

        .urgency-critical { border-left: 3px solid var(--warmy-red) !important; }
        .urgency-high { border-left: 3px solid var(--warmy-orange) !important; }
        .urgency-medium { border-left: 3px solid var(--warmy-yellow) !important; }
        .urgency-low { border-left: 3px solid var(--warmy-border) !important; }
      `}</style>

      {/* ── TOPBAR ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(13,17,23,0.96)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "0 24px", height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #FF6B2B 0%, #FF4500 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: "#fff",
              boxShadow: "0 2px 8px rgba(255,107,43,0.4)",
            }}>w</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#E6EDF3", lineHeight: 1, letterSpacing: "-0.3px" }}>warmy <span style={{ color: "#FF6B2B" }}>AE</span></div>
              <div style={{ fontSize: 10, color: "#484F58", marginTop: 2, fontWeight: 500 }}>Sales Intelligence · warmy.io</div>
            </div>
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

        {/* Sync result banner */}
        {syncError && (
          <div style={{ marginTop: 6, padding: "6px 12px", borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 11, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>
            ✗ {syncError.includes("AVOMA_API_KEY") ? "Add AVOMA_API_KEY to Render environment variables to enable live sync" : syncError}
          </div>
        )}
        {!syncError && syncLog.length > 0 && (
          <div style={{ marginTop: 6, padding: "6px 12px", borderRadius: 6, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", fontSize: 11, color: "#10b981", fontFamily: "'JetBrains Mono', monospace" }}>
            {syncLog.map((l, i) => <div key={i}>✓ {l}</div>)}
          </div>
        )}
      </div>

      {/* ── TABS + AE FILTER ── */}
      <div style={{
        padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(13,17,23,0.8)",
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
                  background: tab === t.id ? "var(--warmy-orange)" : "var(--warmy-navy-4)",
                  color: tab === t.id ? "#fff" : "var(--warmy-text-dim)",
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

        {/* ════ FOLLOW-UPS ════ */}
        {tab === "tasks" && (
          <div style={{ animation: "slideUp 0.3s ease" }}>

            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--warmy-text)", letterSpacing: "-0.3px", marginBottom: 4 }}>Price Proposal Follow Up</h2>
              <p style={{ fontSize: 13, color: "var(--warmy-text-muted)" }}>
                Send the price proposal + meeting summary right after every demo
                {pendingTasks.length > 0 && <span style={{ color: "var(--warmy-orange)", fontWeight: 600, marginLeft: 8 }}>· {pendingTasks.length} waiting</span>}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
              {[
                { label: "Need to Send", val: pendingTasks.length, color: "var(--warmy-orange)" },
                { label: "Sent Today",   val: sentTasks.filter(t => t.meetingDate === new Date().toISOString().split("T")[0]).length, color: "var(--warmy-green)" },
                { label: "Total Sent",   val: sentTasks.length, color: "var(--warmy-blue)" },
              ].map(s => (
                <div key={s.label} style={{ padding: "12px 16px", background: "var(--warmy-navy-2)", border: "1px solid var(--warmy-border)", borderRadius: 10, borderTop: `2px solid ${s.color}` }}>
                  <div style={{ fontSize: 10, color: "var(--warmy-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--warmy-text)", lineHeight: 1 }}>{s.val}</div>
                </div>
              ))}
            </div>

            {pendingTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "56px 24px" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--warmy-text)", marginBottom: 8 }}>All follow-ups sent</div>
                <div style={{ fontSize: 13, color: "var(--warmy-text-muted)" }}>Hit Sync Avoma after your next meeting — the follow-up will appear here automatically</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pendingTasks.map(task => (
                  <TaskCard key={task.id} task={task}
                    onDraftGenerated={handleDraftGenerated} onSend={handleSend}
                    onPipelineAction={handlePipelineAction} onDismiss={handleDismiss} />
                ))}
              </div>
            )}

            {sentTasks.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: "var(--warmy-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Sent ✓</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {sentTasks.map(task => (
                    <div key={task.id} style={{ padding: "10px 16px", background: "var(--warmy-navy-2)", border: "1px solid var(--warmy-border)", borderRadius: 10, display: "flex", alignItems: "center", gap: 12, opacity: 0.7 }}>
                      <AEAvatar email={task.ae} size={30} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--warmy-text)" }}>{task.contactName}</span>
                        <span style={{ fontSize: 12, color: "var(--warmy-text-dim)", marginLeft: 8 }}>· {task.company}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--warmy-green)", fontWeight: 600 }}>✓ Sent</span>
                      <span style={{ fontSize: 11, color: "var(--warmy-text-dim)" }}>{task.meetingDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ PIPELINE CONTROL ════ */}
        {tab === "pipeline" && (
          <PipelineTab
            pipeline={pipeline}
            activePipeline={activePipeline}
            pipelineUrgent={pipelineUrgent}
            pipelineLoading={pipelineLoading}
            pipelineError={pipelineError}
            pipelineLastSync={pipelineLastSync}
            loadPipeline={loadPipeline}
            aeFilter={aeFilter}
            onStageChange={handlePipelineStageChange}
            onFollowUpDone={handleFollowUpDone}
            onLogActivity={handleLogActivity}
          />
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
                const aeAnalyses = analyses.filter(a => a.ae === email);
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

            {/* Analysis cards — sorted newest first */}
            {[...analyses]
              .filter(a => aeFilter === "all" || a.ae === aeFilter)
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(a => <MeetingAnalysisCard key={a.id} analysis={a} />)
            }
          </div>
        )}
      </div>
    </div>
  );
}
