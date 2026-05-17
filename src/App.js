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
    tone: "warm, conversational, Brazilian energy. Builds personal rapport fast. Uses 'man', 'brother', 'cool'. Moves naturally from small talk to business. Drops prices boldly and frames them as doing the prospect a favour. Ends with a clear deadline.",
    avgWords: 80, role: "AE",
    phrases: ["Then again,", "At the end of the day,", "Cool. Cool. Cool.", "I'll do everything I can to have you here working with us.", "I'll be waiting for you, brother."],
    closingStyle: "Personal warmth + deadline. Always sets a specific follow-up date (e.g. 'I can hold this offer until Tuesday').",
    notes: "Felipe uses 'then again' as a verbal filler constantly. Talks about deliverability in terms of business outcomes (revenue, responses). Very good at making the prospect feel like they're getting a special deal. Tends to go deep on consultative advice (email volume, infrastructure) before pitching.",
  },
  "sofiiar@warmy.io": {
    name: "Sofiia Rapatska", initials: "SR", color: "#8b5cf6",
    greeting: "Hi [Name],", closing: "Best,\nSofiia",
    tone: "structured, thorough, technical but accessible. Asks deep discovery questions. Validates prospect's logic ('that's a very good approach'). Explains the 'why' behind every recommendation. Warm but professional — not pushy at all.",
    avgWords: 90, role: "AE / Demo",
    phrases: ["Just to make sure I understand correctly,", "That's actually a very good logic,", "I would definitely recommend,", "From our side,", "The idea here is that"],
    closingStyle: "Soft close. Always ends with 'I'll follow up after the call with a short summary' and asks 'when should I expect to hear back from you?'",
    notes: "Sofiia spends a LOT of time on discovery — she asks about email infrastructure, opt-in status, sending tool, volume per mailbox before ever pitching. She's Ukrainian/Polish, works remotely, builds personal rapport naturally. Very good at explaining cold outreach risks without scaring the prospect. Pricing is per mailbox and she sizes based on number of mailboxes they want to connect.",
  },
  "jorget@warmy.io": {
    name: "Jorge Marttins", initials: "JM", color: "#ef4444",
    greeting: "Hi [Name],", closing: "Best,\nJorge",
    tone: "clear, structured, methodical. Explains things step by step. Uses analogies and concrete examples. Calm and confident. Never oversells — lets the product speak.",
    avgWords: 75, role: "AE",
    phrases: ["So basically,", "Let me share with you,", "I must say,", "Does that make sense?", "I'll send you the information over email"],
    closingStyle: "Always ends with a concrete next step: 'I'll send you the information and we can connect in 2-3 weeks' or books a specific follow-up.",
    notes: "Jorge ran demos for Scott Conlin (novelty lights, b2c/b2b mix, HubSpot), Pedro Silva (Agemobi), Loron Grantham (EchelonDawn), Caitlin Marco (Opal.dev). He explains the seed list concept very clearly using step-by-step logic. Good at handling 'why you vs competitors' — focuses on account manager support and 7 years of network quality. Methodical pricing presentation.",
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
  // ── FELIPE ANALYSES ────────────────────────────────
  {
    id: "M005", meetingId: "ea7a1cb3-b09f-4af0-8411-af544e00483c",
    ae: "felipev@warmy.io", contact: "Muhammad Hussnain", company: "CodingCops",
    type: "Demo", date: "2026-05-15", duration: "30 min",
    went_well: [
      "Built personal rapport immediately — chatted about Pakistan, Brazil, and travel before getting into business",
      "Discovered the real differentiator early: Muhammad wants custom templates, not generic warm-up — Felipe hit this hard throughout",
      "Found Warmy via ChatGPT — Felipe turned this into social proof ('even ChatGPT recommends us')",
      "Aggressive but natural pricing drop: $49 → $10 → $5/mailbox. Muhammad felt he got a special deal",
      "Set a hard deadline ('offer valid until Tuesday') to create urgency without pressure",
      "Consultative advice on email volume (1,000/day max per account) — positioned Felipe as an expert, not just a salesperson",
    ],
    improve: [
      "Felipe's pricing dropped too quickly — went from $49 to $5 in one call with minimal pushback. Could have held at $10-15 for 100 accounts",
      "Muhammad's real objection was pricing from the start — Felipe spent time on the full demo before addressing it. Could have qualified budget earlier",
      "No clear next step booked — 'I'll wait to hear from you by Tuesday' is passive. Should have suggested a follow-up call if Muhammad needs to present to his head of sales",
    ],
    score: 79,
    summary: "Felipe's warmth and rapport-building are exceptional — Muhammad genuinely liked him. The pricing strategy is a concern: dropping from $49 to $5 in one call leaves money on the table. The custom template angle was perfectly identified. Follow-up email with the official proposal is critical to close this.",
  },
  {
    id: "M006", meetingId: "a6402499-ea80-488a-8d8c-5e5c775617a2",
    ae: "felipev@warmy.io", contact: "Aleksandr Grebenkov", company: "GoToGrow.me",
    type: "Demo", date: "2026-05-14", duration: "26 min",
    went_well: [
      "Spotted the partnership angle within the first 2 minutes — immediately pivoted to the 25% rev share program",
      "Understood the product fast: GoToGrow provides mailboxes but doesn't warm them — clean fit for a white-label/API partnership",
      "Proactive about the CTO: told Aleksdr the CTO can join onboarding for the API setup",
      "Closed fast: Aleksdr said 'we are ready, just send the link' and Felipe confirmed he already has an account",
      "Framed the trial as low-commitment: 'test it out, then we can activate the discount'",
    ],
    improve: [
      "Felipe didn't confirm the exact timing for when GoToGrow opens public beta (July-August) — important for pipeline sizing",
      "The partnership discussion was vague — '25% recurring' was mentioned but no formal process was established or handed off to a partnership manager clearly",
      "Should have confirmed exact mailbox count needed now vs July, to give a concrete proposal",
    ],
    score: 84,
    summary: "Smart pivot to the partnership angle. Felipe correctly identified this as more than a customer relationship. The trial approach is right for Aleksdr's current stage. Main gap: the partnership follow-up needs to be handed to a partnership manager quickly before Aleksdr evaluates other providers.",
  },
  // ── JORGE ANALYSES ─────────────────────────────────
  {
    id: "M007", meetingId: "456904da-ebca-4a1f-9bb6-5cacb7c79f9e",
    ae: "jorget@warmy.io", contact: "Scott Conlin", company: "Novelty Lights",
    type: "Demo", date: "2026-05-15", duration: "27 min",
    went_well: [
      "Immediately understood Scott's dual use case (b2c + b2b) and tailored the explanation to both",
      "Explained the seed list process step-by-step in plain language — Scott said 'Oh, okay' multiple times, meaning it clicked",
      "Handled the 'how is the seed list refreshed?' question naturally — monthly refresh, no friction",
      "Addressed the workflow question (when to add seed list vs campaign sending) clearly",
      "Got a soft commitment: 'I'll definitely reach out next week either way'",
      "Confirmed US-based seed list matches their market — proactively addressed without being asked",
    ],
    improve: [
      "Jorge took a while to get to the pricing — Scott had to ask. Could have moved to pricing faster after the discovery",
      "Should have suggested a specific start date: 'If you want to be ready for June campaigns, we'd need to start warming in the next 2 weeks'",
      "No follow-up meeting booked — 'next week' is vague. Should have offered: 'Want me to send a calendar link so we can confirm?'",
    ],
    score: 83,
    summary: "Jorge's strength is clarity — he explains Warmy's mechanics better than almost anyone on the team. Scott left the call fully understanding the product. The gap is commercial urgency: Jorge let Scott set a vague 'next week' timeline. Given the seasonal business (Oct-Dec peak), there's a genuine urgency angle Jorge didn't use.",
  },
  {
    id: "M008", meetingId: "32bb06bf-be65-45d4-9ace-308d3b8e138f",
    ae: "jorget@warmy.io", contact: "Loron Grantham + Jake Vandersterren", company: "EchelonDawn",
    type: "Demo", date: "2026-05-14", duration: "3 min",
    went_well: [
      "Extremely efficient — payment completed in under 3 minutes",
      "Handled the reseller relationship (Jake) perfectly: let Jake drive, confirmed details, sent payment link instantly",
      "Jake explicitly said 'you'll hear from me again' — Jorge has a repeat referral source here",
    ],
    improve: [
      "Jorge should have captured Jake's company/email more explicitly for the partner program",
      "No onboarding confirmation sent on the call — should have confirmed Jake knows the onboarding link is coming",
    ],
    score: 95,
    summary: "Perfect transactional execution. Short calls with resellers are a skill — Jorge nailed it. The Jake relationship is worth nurturing formally through the partner program.",
  },
  // ── SOFIIA ANALYSES ────────────────────────────────
  {
    id: "M009", meetingId: "52a69708-909b-436c-bbe3-e2dd24ef61d1",
    ae: "sofiiar@warmy.io", contact: "Mat Sykes + Agatha Pope", company: "Recolution Group",
    type: "Demo", date: "2026-05-15", duration: "54 min",
    went_well: [
      "Exceptional discovery — asked about opt-in status, sending tool (Bullhorn), volume per mailbox, and domain strategy before ever pitching",
      "Validated Mat's domain separation strategy ('yoke-talent vs yokerecruitment.com') — this built massive trust",
      "Explained cold vs warm email risk clearly without scaring him: 'it's not that you're doing something wrong — this is common in recruitment'",
      "Correctly identified the Bullhorn architecture (emails go from Bullhorn but auth via MS365 mailboxes) — showed deep technical knowledge",
      "Gave concrete infrastructure advice: separate marketing emails (Sendgrid, high vol) vs cold outreach (40-50/day/mailbox)",
      "Handled the 'can I just warm 10-20 key mailboxes to cover the domain?' question accurately and helpfully",
    ],
    improve: [
      "Call ran 54 minutes — very long for a discovery + demo. Could have been tighter at 35-40 min",
      "Pricing was presented at the end after a long call — Mat had to ask. Could have introduced a pricing range earlier to anchor expectations",
      "The trial section (7-day, volumes too low to see results) created a slight expectation mismatch — Mat seemed surprised the trial wouldn't show improvements",
    ],
    score: 88,
    summary: "Sofiia's best skill is making technically complex prospects feel understood. Mat left feeling like she was an expert in his specific industry (recruitment). The call length is the only real concern — at 54 min, some prospects lose focus before the close. The post-call summary email is critical: Mat said 2 weeks but a well-crafted summary could accelerate that.",
  },
];

/* ═══════════════════════════════════════════════════════
   API
═══════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════
   PIPELINE PLAYBOOK CONFIG
═══════════════════════════════════════════════════════ */
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
const INITIAL_PIPELINE = [
  {
    id: "P001", hubspotId: "60269536179",
    contactName: "Muhammad Hussnain", contactEmail: "muhammad.hussnain@codingcops.com",
    company: "CodingCops", ae: "felipev@warmy.io",
    stage: "proposal_sent", daysInStage: 2, dealValue: "$500/mo",
    followUpSentDay3: false, noShow: false,
    lastActivity: "2026-05-15",
    notes: "Felipe offered $5/mailbox × 100 = $500/mo. Offer valid until Tuesday. Muhammad needs head of sales approval.",
  },
  {
    id: "P002", hubspotId: "60255907209",
    contactName: "Scott Conlin", contactEmail: "scott@noveltylights.com",
    company: "Novelty Lights", ae: "jorget@warmy.io",
    stage: "proposal_sent", daysInStage: 2, dealValue: "$358/mo",
    followUpSentDay3: false, noShow: false,
    lastActivity: "2026-05-15",
    notes: "Wants to start in June. Scott said he'd reach out next week. Seasonal business — Oct-Dec peak.",
  },
  {
    id: "P003", hubspotId: "60234223726",
    contactName: "Caitlin Marco", contactEmail: "caitlin.marco@opal.dev",
    company: "Opal.dev", ae: "jorget@warmy.io",
    stage: "proposal_sent", daysInStage: 2, dealValue: "$360 (90% prob)",
    followUpSentDay3: false, noShow: false,
    lastActivity: "2026-05-15",
    notes: "HubSpot shows 90% close probability. High priority follow-up.",
  },
  {
    id: "P004", hubspotId: "60072037522",
    contactName: "Mat Sykes", contactEmail: "matthew.sykes@recolutiongroup.com",
    company: "Recolution Group", ae: "sofiiar@warmy.io",
    stage: "proposal_sent", daysInStage: 2, dealValue: "$290-440/mo",
    followUpSentDay3: false, noShow: false,
    lastActivity: "2026-05-15",
    notes: "Sofiia promised post-call summary. Mat said 2 weeks to decide internally.",
  },
  {
    id: "P005", hubspotId: "60249987662",
    contactName: "Sabreena Shafi", contactEmail: "sabreena.shafi@cloudhire.ai",
    company: "CloudHire.ai", ae: "sofiiar@warmy.io",
    stage: "proposal_sent", daysInStage: 2, dealValue: "$435",
    followUpSentDay3: false, noShow: false,
    lastActivity: "2026-05-15",
    notes: "Proposal call completed. Sofiia promised summary + payment link.",
  },
  {
    id: "P006", hubspotId: "60206388020",
    contactName: "Jamie Anderson", contactEmail: "jamie.anderson@kodiakhub.com",
    company: "KodiakHub", ae: "gokhank@warmy.io",
    stage: "proposal_sent", daysInStage: 4, dealValue: "$450/mo",
    followUpSentDay3: false, noShow: false,
    lastActivity: "2026-05-13",
    notes: "CFO approval needed by end of May. No reply yet. Day 3 follow-up overdue.",
  },
  {
    id: "P007", hubspotId: "60221215634",
    contactName: "Vihar Naik", contactEmail: "viharnaik@callhippo.com",
    company: "CallHippo", ae: "gokhank@warmy.io",
    stage: "proposal_sent", daysInStage: 4, dealValue: "$540",
    followUpSentDay3: false, noShow: false,
    lastActivity: "2026-05-13",
    notes: "Demo done May 13. No reply since. Day 3 follow-up overdue.",
  },
  {
    id: "P008", hubspotId: "60204877705",
    contactName: "Yuvraj Karle", contactEmail: "yuvraj@performifymedia.com",
    company: "PerformifyMedia", ae: "gokhank@warmy.io",
    stage: "proposal_sent", daysInStage: 4, dealValue: "$450",
    followUpSentDay3: false, noShow: false,
    lastActivity: "2026-05-13",
    notes: "Demo done May 13. No reply since. Day 3 follow-up overdue.",
  },
  {
    id: "P009", hubspotId: "60176200355",
    contactName: "Benjamin Kouba", contactEmail: "ben@leaf9.com",
    company: "Leaf9", ae: "gokhank@warmy.io",
    stage: "proposal_sent", daysInStage: 5, dealValue: "$49",
    followUpSentDay3: true, noShow: false,
    lastActivity: "2026-05-14",
    notes: "Day 5. Follow-up sent. No reply. Approaching Day 9 decision point.",
  },
  {
    id: "P010", hubspotId: "60180404892",
    contactName: "Freddie Gonzalez", contactEmail: "freddie@pzerotalent.co",
    company: "PzeroTalent", ae: "gokhank@warmy.io",
    stage: "proposal_sent", daysInStage: 5, dealValue: "$210",
    followUpSentDay3: true, noShow: false,
    lastActivity: "2026-05-14",
    notes: "Day 5. Follow-up sent. No reply. Approaching Day 9 decision point.",
  },
  {
    id: "P011", hubspotId: "60254728339",
    contactName: "Pedro Silva", contactEmail: "lfv1.cad@agemobi.com",
    company: "Agemobi", ae: "jorget@warmy.io",
    stage: "meeting_scheduled", daysInStage: 3, dealValue: "TBD",
    followUpSentDay3: false, noShow: false,
    lastActivity: "2026-05-14",
    notes: "Demo completed May 14. Needs to be moved to Price Proposal Sent.",
  },
  {
    id: "P012", hubspotId: "60034986380",
    contactName: "Matthias", contactEmail: "matthias@prospect.com",
    company: "Unknown", ae: "sofiiar@warmy.io",
    stage: "proposal_sent", daysInStage: 12, dealValue: "$679",
    followUpSentDay3: true, noShow: false,
    lastActivity: "2026-05-12",
    notes: "Day 12 — PAST AUTO-CLOSE threshold. HubSpot deal at 50% probability. Needs immediate action.",
  },
];

const MCP = [
  { type: "url", url: "https://mcp.hubspot.com/anthropic",      name: "hubspot" },
  { type: "url", url: "https://gmailmcp.googleapis.com/mcp/v1", name: "gmail"   },
];

async function callClaude(system, userMsg) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
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
            {task.isNew && <Badge label="NEW" color="#10b981" />}
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

function PipelineDealCard({ deal, onStageChange, onFollowUpDone, onLogActivity }) {
  const [expanded, setExpanded] = useState(false);
  const [disqualReason, setDisqualReason] = useState("");
  const [showDisqualModal, setShowDisqualModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const action = getPipelineAction(deal);
  const stageConfig = PIPELINE_STAGES[deal.stage] || PIPELINE_STAGES.meeting_scheduled;
  const aeProfile = AE_PROFILES[deal.ae] || {};

  const urgencyBorder = {
    critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "rgba(255,255,255,0.07)", none: "rgba(255,255,255,0.07)"
  }[action.urgency];

  const handleStageChange = async (newStage, reason) => {
    setLoading(true);
    try {
      await callClaude(
        "You are a HubSpot automation assistant for Warmy.io sales pipeline.",
        `Use HubSpot MCP to update deal ID ${deal.hubspotId || "unknown"} for contact "${deal.contactName}" at "${deal.company}":
1. Move deal stage to "${PIPELINE_STAGES[newStage]?.label || newStage}"
2. Add note: "Stage updated to ${PIPELINE_STAGES[newStage]?.label} — ${new Date().toLocaleDateString("en-GB")}${reason ? ". Reason: " + reason : ""}"
${newStage === "closed_lost" ? '3. Set loss reason: "' + (reason || "No response / rejected") + '"' : ""}
${newStage === "disqualified" ? '3. Set disqualification reason: "' + (reason || "No-show") + '"' : ""}`
      );
      onStageChange(deal.id, newStage, reason);
    } catch (e) {
      alert("HubSpot update failed: " + e.message);
    }
    setLoading(false);
  };

  const handleDay3Done = async () => {
    setLoading(true);
    try {
      await callClaude(
        "You are a HubSpot automation assistant.",
        `Use HubSpot MCP to log a follow-up activity on deal for "${deal.contactName}" at "${deal.company}" (ID: ${deal.hubspotId}):
1. Log email activity with note: "Day-3 follow-up sent — ${new Date().toLocaleDateString("en-GB")}"
2. Update last contact date to today`
      );
      onFollowUpDone(deal.id);
    } catch (e) {
      alert("HubSpot log failed: " + e.message);
    }
    setLoading(false);
  };

  const handleLogActivity = async () => {
    setLoading(true);
    try {
      await callClaude(
        "You are a HubSpot automation assistant.",
        `Use HubSpot MCP to log activity on deal for "${deal.contactName}" at "${deal.company}" (ID: ${deal.hubspotId}):
1. Add note: "Activity logged — ${new Date().toLocaleDateString("en-GB")} — clock reset for Negotiation stage"
2. Update last activity date to today`
      );
      onLogActivity(deal.id);
    } catch (e) {
      alert("HubSpot log failed: " + e.message);
    }
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
          <AEAvatar email={deal.ae} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{deal.contactName}</span>
              <span style={{ fontSize: 12, color: "#475569" }}>· {deal.company}</span>
              <Badge label={stageConfig.label} color={stageConfig.color} />
              {action.urgency === "critical" && <Badge label="⚠ URGENT" color="#ef4444" />}
              {action.urgency === "high" && deal.stage !== "meeting_scheduled" && <Badge label={`Day ${deal.daysInStage}`} color="#f59e0b" />}
            </div>
            <span style={{ fontSize: 11, color: action.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{action.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#334155" }}>{aeProfile.name?.split(" ")[0]}</span>
            <span style={{ color: "#334155", fontSize: 12, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none" }}>▾</span>
          </div>
        </div>

        {/* Expanded action panel */}
        {expanded && (
          <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {/* Action description */}
            <div style={{ margin: "12px 0", padding: "10px 12px", borderRadius: 8, background: `${action.color}10`, border: `1px solid ${action.color}25`, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
              <span style={{ color: action.color, fontWeight: 600 }}>What to do: </span>{action.description}
            </div>

            {/* Day progress bar for timed stages */}
            {(deal.stage === "proposal_sent" || deal.stage === "negotiation") && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>Day {deal.daysInStage}</span>
                  <span style={{ color: deal.daysInStage >= 9 ? "#ef4444" : deal.daysInStage >= 3 ? "#f59e0b" : "#10b981" }}>
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

              {/* Proposal Sent Day 3: follow-up button */}
              {deal.stage === "proposal_sent" && deal.daysInStage >= 3 && !deal.followUpSentDay3 && deal.daysInStage < 9 && (
                <button onClick={handleDay3Done} disabled={loading}
                  style={{ flex: 1, minWidth: 160, padding: "10px 14px", borderRadius: 8, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)", color: "#f59e0b", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                  ✉ Mark Day-3 Follow-up Sent ✓
                </button>
              )}

              {/* Proposal Sent Day 9: negotiation or lost */}
              {deal.stage === "proposal_sent" && deal.daysInStage >= 9 && (
                <>
                  <button onClick={() => handleStageChange("negotiation")} disabled={loading}
                    style={{ flex: 1, minWidth: 130, padding: "10px 14px", borderRadius: 8, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)", color: "#f59e0b", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                    → Move to Negotiation
                  </button>
                  <button onClick={() => handleStageChange("closed_lost", "No response after Day 9 — no active discussions")} disabled={loading}
                    style={{ flex: 1, minWidth: 130, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                    ✕ Mark Closed Lost
                  </button>
                </>
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
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", fontSize: 12, color: "#f59e0b", fontFamily: "'JetBrains Mono', monospace" }}>
                  <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span> Updating HubSpot…
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
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
  const [pipeline, setPipeline] = useState(INITIAL_PIPELINE);
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

      const { newTasks, message, processed, totalFound } = data;

      setSyncLog([
        `Scanned ${totalFound} meetings from Avoma`,
        `${processed} new completed meetings found`,
        message,
      ]);

      if (newTasks && newTasks.length > 0) {
        // Update daysSinceMeeting for all existing tasks too
        setTasks(prev => {
          const updated = prev.map(t => ({
            ...t,
            daysSinceMeeting: Math.floor(
              (Date.now() - new Date(t.meetingDate + "T12:00:00Z").getTime()) / (1000 * 60 * 60 * 24)
            ),
            // Auto-escalate follow-up type based on days
            type: t.status === "pending" ? (
              t.daysSinceMeeting >= 9 ? "fu4" :
              t.daysSinceMeeting >= 6 ? "fu3" :
              t.daysSinceMeeting >= 3 ? "fu2" : t.type
            ) : t.type,
          }));
          return [...updated, ...newTasks];
        });
      } else {
        // Still update days on existing tasks
        setTasks(prev => prev.map(t => ({
          ...t,
          daysSinceMeeting: Math.floor(
            (Date.now() - new Date(t.meetingDate + "T12:00:00Z").getTime()) / (1000 * 60 * 60 * 24)
          ),
          type: t.status === "pending" ? (
            t.daysSinceMeeting >= 9 ? "fu4" :
            t.daysSinceMeeting >= 6 ? "fu3" :
            t.daysSinceMeeting >= 3 ? "fu2" : t.type
          ) : t.type,
        })));
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
    { id: "tasks",    label: "Action Queue",      count: pendingTasks.length },
    { id: "pipeline", label: "Pipeline Control",  count: pipelineUrgent.length > 0 ? pipelineUrgent.length : null },
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
              <p style={{ fontSize: 13, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>
                Playbook-driven — every step of the deal, one click to action
              </p>
            </div>

            {/* Day rules */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 24 }}>
              {[
                { label: "Day 0", sub: "Proposal sent", color: "#10b981" },
                { label: "Day 3", sub: "Follow-up due", color: "#f59e0b" },
                { label: "Day 9", sub: "Negotiate or Lost", color: "#ef4444" },
                { label: "Day 10", sub: "Auto-close", color: "#6b7280" },
              ].map(r => (
                <div key={r.label} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderTop: `2px solid ${r.color}`, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: r.color, fontFamily: "'JetBrains Mono', monospace" }}>{r.label}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 3, lineHeight: 1.3 }}>{r.sub}</div>
                </div>
              ))}
            </div>

            {/* Stage counts */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto" }}>
              {Object.entries(PIPELINE_STAGES).map(([key, s]) => {
                const count = pipeline.filter(d => d.stage === key && (aeFilter === "all" || d.ae === aeFilter)).length;
                if (count === 0 && ["closed_won","closed_lost","disqualified"].includes(key)) return null;
                return (
                  <div key={key} style={{ flex: 1, minWidth: 90, padding: "8px 10px", background: s.bg, border: `1px solid ${s.color}30`, borderRadius: 8, textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{count}</div>
                    <div style={{ fontSize: 9, color: "#475569", marginTop: 2, lineHeight: 1.3 }}>{s.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Urgent banner */}
            {pipelineUrgent.length > 0 && (
              <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.2s ease infinite", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>
                  {pipelineUrgent.length} deal{pipelineUrgent.length !== 1 ? "s" : ""} need immediate action today
                </span>
              </div>
            )}

            {/* AE checklist */}
            <div style={{ marginBottom: 20, padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
              <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>AE Owns These 4 Actions (Playbook)</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { icon: "✗", text: "No-show → Disqualified + written reason", color: "#8b5cf6" },
                  { icon: "✉", text: "Day-3 follow-up → tick done in pipeline", color: "#f59e0b" },
                  { icon: "→", text: "Day-9 decision → Negotiation or Closed Lost", color: "#ef4444" },
                  { icon: "✎", text: "Log activity in Negotiation (resets 10-day clock)", color: "#3b82f6" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "#64748b" }}>
                    <span style={{ color: r.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{r.icon}</span>
                    {r.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Deal cards sorted by urgency */}
            {activePipeline.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 24px", color: "#334155" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>Pipeline is clean — no active deals need action</div>
              </div>
            ) : (
              <div>
                {[...activePipeline]
                  .sort((a, b) => {
                    const order = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
                    return (order[getPipelineAction(a).urgency] || 4) - (order[getPipelineAction(b).urgency] || 4);
                  })
                  .map(deal => (
                    <PipelineDealCard
                      key={deal.id}
                      deal={deal}
                      onStageChange={handlePipelineStageChange}
                      onFollowUpDone={handleFollowUpDone}
                      onLogActivity={handleLogActivity}
                    />
                  ))
                }
              </div>
            )}

            {/* Closed deals */}
            {pipeline.filter(d => ["closed_won","closed_lost","disqualified"].includes(d.stage) && (aeFilter === "all" || d.ae === aeFilter)).length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Closed this period</p>
                {pipeline.filter(d => ["closed_won","closed_lost","disqualified"].includes(d.stage) && (aeFilter === "all" || d.ae === aeFilter)).map(deal => {
                  const s = PIPELINE_STAGES[deal.stage];
                  return (
                    <div key={deal.id} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, marginBottom: 6, display: "flex", alignItems: "center", gap: 12 }}>
                      <AEAvatar email={deal.ae} size={28} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>{deal.contactName}</span>
                        <span style={{ fontSize: 12, color: "#334155", marginLeft: 8 }}>· {deal.company}</span>
                      </div>
                      <Badge label={s.label} color={s.color} />
                    </div>
                  );
                })}
              </div>
            )}
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
