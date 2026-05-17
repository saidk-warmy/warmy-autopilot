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

  // ══════════════ SAID ══════════════
  {
    id: "M001", meetingId: "1af383c9-640a-4515-8044-310c37375e6d",
    ae: "saidk@warmy.io", contact: "Max Nyirenda", company: "GoInspire",
    type: "Upsell", date: "2026-05-14", duration: "15 min",
    went_well: [
      "Quick re-discovery — remembered all context from the day before and jumped straight to value",
      "Identified the partnership angle immediately (GoInspire as performance partner for Warmy referrals)",
      "Offered 15% discount tied to a testimonial — smart upsell mechanic that gets something back",
      "Confirmed annual option ($16k/yr, 2 months free) clearly and without pressure",
      "Said he would send the comparison email within minutes — showed responsiveness",
    ],
    improve: [
      "Didn't pin down a specific date with Sat (the CTO) — 'I'll check with Sat' is vague and creates an open-ended follow-up loop",
      "Pricing got slightly muddled during the call — should have a clean price sheet ready",
      "Should have proposed sending a short Loom or video for Sat to watch instead of just an email",
    ],
    score: 81,
    summary: "Solid upsell call. Said handled the price objection well by tying the discount to a testimonial. The main risk is the deal stalling with Sat (the CTO) as a gatekeeper — Said needs to make it as easy as possible for Max to get an answer quickly.",
  },

  // ══════════════ GOKHAN ══════════════
  {
    id: "M002", meetingId: "c014a5a1-ae9b-4131-a15f-691f274b6dd1",
    ae: "gokhank@warmy.io", contact: "Bill Bowden + Craig", company: "maior.ai",
    type: "Demo", date: "2026-05-14", duration: "33 min",
    went_well: [
      "Deep discovery before pitching — learned about Apollo, HTML email issues, and team structure first",
      "Sofiia's product demo was tight and directly addressed the deliverability problems Bill described",
      "Framed Warmy as a long-term partner, not a tool — built strong trust",
      "Pushed for a decision timeline and got a verbal: 'answer by tomorrow afternoon'",
      "Annual framing came naturally — Bill brought up the yearly commitment himself",
    ],
    improve: [
      "CEO's name (Hirsh, visible in the Avoma invite) was never used — missed personalization opportunity for the follow-up",
      "Pricing hesitation visible twice: 'let me check' slows momentum",
      "Sofiia's demo portion ran long for a 30-min slot — should have a tighter handoff structure",
    ],
    score: 85,
    summary: "Excellent team demo. Gokhan's discovery was thorough and Sofiia's product walkthrough was well-timed. The CEO (Hirsh, cc'd on the invite) is the real decision maker — the follow-up email should speak directly to Hirsh, not just Bill.",
  },
  {
    id: "M003", meetingId: "5cb81583-90a8-465a-bde1-346e6f24556f",
    ae: "gokhank@warmy.io", contact: "Jack Butzu + Jamie Anderson", company: "KodiakHub",
    type: "Demo", date: "2026-05-13", duration: "40 min",
    went_well: [
      "Handled complex multi-stakeholder call (GTM engineer + IT) smoothly — read the room well",
      "Identified the infrastructure problem (5 domains not warmed) before pitching",
      "Jamie brought up the annual commitment herself — Gokhan never had to push it",
      "$4,500/yr offer was well received",
      "Strong differentiation vs Instantly and Mailreach when directly compared",
    ],
    improve: [
      "Call ran 40 minutes — pricing could have been introduced earlier",
      "Jack's specific question about separating rep emails from sequences wasn't fully resolved",
      "No follow-up meeting booked with the CFO — 'end of month' without a next call is a deal killer",
    ],
    score: 80,
    summary: "Strong call. The main vulnerability is CFO approval with no follow-up call booked. Jamie needs to feel accountable for a specific date. Priority action: send a one-line email asking for a 15-min call with Jamie + CFO to answer any final questions.",
  },
  {
    id: "M004", meetingId: "bef34772-56f8-4c24-9554-66fb5de47382",
    ae: "gokhank@warmy.io", contact: "Dorian Lesnic", company: "Cardneto",
    type: "Demo", date: "2026-05-13", duration: "59 min",
    went_well: [
      "Closed on the call — payment completed live",
      "Handled competitor comparisons (Instantly x4) confidently without being dismissive",
      "Used startup pricing angle well — $20/mailbox felt personalized and fair",
      "Dorian said it was 'one of the smoothest sales experiences' he'd had",
      "Gokhan shared his own discovery framework unprompted — exceptional trust builder",
    ],
    improve: [
      "59 minutes for a $100/mo deal — time allocation is a concern at scale",
      "Instantly objection came up 4 times — should have resolved it definitively in the first instance",
      "VPN/domain setup questions exposed a product knowledge gap in edge cases",
    ],
    score: 90,
    summary: "Exceptional close with an advocate created. The time investment is the only real concern — Gokhan's thoroughness is a strength but needs calibration against deal size.",
  },
  {
    id: "M010", meetingId: "cf9289bb-77ad-4cc0-865a-a2acc7ae39c2",
    ae: "gokhank@warmy.io", contact: "Collin Farmer", company: "42support (MSP)",
    type: "Demo", date: "2026-05-15", duration: "27 min",
    went_well: [
      "Immediately spotted the MSP partnership angle — Collin manages multiple client accounts",
      "Correctly held back on retail pricing and committed to a partnership conversation",
      "Explained seed list vs integration clearly for a technical MSP audience",
      "Set concrete next step: email with pricing within 1.5 hours",
      "Identified the 25-domain firm as a second opportunity for future discussion",
    ],
    improve: [
      "Never confirmed Collin's email address or booked a follow-up call",
      "The $4.50/mailbox estimate (retail) was shared before partnership pricing was discussed — anchored too high",
      "25-domain firm opportunity was deferred entirely — should have at least captured contact info",
    ],
    score: 77,
    summary: "Smart pivot to the partnership angle. Collin came in for pricing info — the follow-up email needs to land fast (Gokhan said 1.5 hours) with a clear MSP rate that makes the math work for reselling.",
  },
  {
    id: "M011", meetingId: "b4a4a80d-59ff-4339-a9bf-75ae967d3295",
    ae: "gokhank@warmy.io", contact: "Phil Mold", company: "That Recruitment Bloke",
    type: "Demo", date: "2026-05-15", duration: "42 min",
    went_well: [
      "Closed on the call — Phil paid $49/mo live",
      "Excellent rapport: pub prices in Kraków vs Manchester became a running thread that relaxed Phil completely",
      "Identified Loxo CRM as a contributing factor to deliverability issues — showed deep diagnostic skill",
      "Handled the cash flow objection gracefully: monthly now, annual option preserved for Month 3",
      "Booked onboarding for Tuesday before ending the call",
      "Used the 'weight scale' analogy naturally and it visibly landed with Phil",
    ],
    improve: [
      "42 minutes for a $49/mo deal — Gokhan is excellent but needs to tighten the close path for small deals",
      "Phil asking for $400/yr vs $490 was a minor negotiation that Gokhan could have pre-empted by anchoring stronger on value",
      "The Loxo insight was valuable — should have been documented in HubSpot immediately for the CSM",
    ],
    score: 88,
    summary: "Another live close. Gokhan's ability to build rapport rapidly and translate technical concepts into plain language is exceptional. Phil is a small account but a strong candidate for a testimonial given how enthusiastic he was.",
  },
  {
    id: "M012", meetingId: "135fdff5-b93b-46c6-9a1f-a2c0ff5529eb",
    ae: "gokhank@warmy.io", contact: "Bryan Quandt", company: "Optimizm Solutions",
    type: "Demo", date: "2026-05-15", duration: "28 min",
    went_well: [
      "Good rapport opening — Vienna/Kraków geography connection was natural",
      "Correctly identified the root cause (new domain + cold outreach from Day 1) early",
      "Educated Bryan well on the 30-40 email/day safe zone",
      "Differentiated from Apollo's warm-up feature credibly (biggest database, dedicated expert)",
      "Gave Bryan a clear next step: email with package details + signup link",
    ],
    improve: [
      "Bryan said 'I'm looking at other vendors — follow up late next week.' Gokhan accepted this passively — no urgency created",
      "No pricing anchor set during the call — Bryan went away without a number to compare",
      "Gokhan called Bryan 'Greg' at the end of the call — small but noticeable error",
      "Should have offered a trial or a specific reason to decide sooner",
    ],
    score: 72,
    summary: "Solid educational demo but a passive close. Bryan is clearly evaluating multiple vendors and Gokhan let him leave without any urgency or competitive differentiation beyond the expert. The follow-up email is critical — needs a reason to choose Warmy now.",
  },
  {
    id: "M013", meetingId: "1e4d7a44-7d54-4399-b252-7a8f8807b7c2",
    ae: "gokhank@warmy.io", contact: "Gurdev Kalsi", company: "Affiliate Marketer (India)",
    type: "Proposal", date: "2026-05-15", duration: "37 min",
    went_well: [
      "Patient and educational throughout — never made Gurdev feel embarrassed about his basic questions",
      "Correctly identified that Getresponse (ESP) requires a seed list solution, not mailbox integration",
      "Did the volume math carefully (1,400 emails/day = 2,500+ seed contacts needed)",
      "Offered to discuss with manager to find India-appropriate pricing",
      "Empathetic to the currency/budget constraint without dismissing the prospect",
    ],
    improve: [
      "Gurdev's budget of $100-250 vs Gokhan's $750 quote is a 3-5x gap — should have qualified budget earlier to save both sides' time",
      "The call ran 37 minutes without reaching a conclusion — a clearer budget qualification at minute 5 would have reshaped the conversation",
      "Gokhan offered to email pricing options on Monday but didn't lock in a specific follow-up call time",
      "The deal economics are very challenging — Gurdev is in India, small budget, high volume need. Risk of wasted follow-up cycles.",
    ],
    score: 65,
    summary: "Good product explanation and cultural sensitivity, but the budget gap was not addressed early enough. Gurdev is a challenging prospect — his $100-250 budget vs the $350-750 required price is a fundamental mismatch. Gokhan should qualify harder on budget in the first 5 minutes for ESP/seed list prospects.",
  },
  {
    id: "M014", meetingId: "78cc9f73-f52e-42f6-83dd-5dad34bcbeca",
    ae: "gokhank@warmy.io", contact: "Jordan Tate (via Paul)", company: "Conduyt (CRM SaaS)",
    type: "Demo", date: "2026-05-14", duration: "13 min",
    went_well: [
      "Paul (the IT consultant) was already a Warmy customer — this was a warm referral, Gokhan handled it perfectly",
      "Quickly understood the 3-domain structure (conduit.com, .email, .app) and gave relevant advice",
      "Correctly prioritized conduit.email as the marketing domain to focus on",
      "Pricing was clear: $49/mailbox, $245/mo for 5, $2,450/yr",
      "Offered to email both Paul and Jordan together — efficient multi-stakeholder close",
    ],
    improve: [
      "Never confirmed the number of mailboxes per domain — said 'about 5' without verifying",
      "Should have booked a follow-up call directly rather than waiting for Paul to speak with Jordan",
      "The annual option ($2,450) was presented without a specific deadline — no urgency",
    ],
    score: 80,
    summary: "Efficient warm referral handling. The deal is viable but sits on Jordan (the decision maker) who wasn't present on the call. The follow-up email to both Paul and Jordan is critical — and should include a specific call-to-action for Jordan to confirm mailbox count and sign up.",
  },

  // ══════════════ FELIPE ══════════════
  {
    id: "M005", meetingId: "ea7a1cb3-b09f-4af0-8411-af544e00483c",
    ae: "felipev@warmy.io", contact: "Muhammad Hussnain", company: "CodingCops",
    type: "Demo", date: "2026-05-15", duration: "31 min",
    went_well: [
      "Built personal rapport immediately — Pakistan/Brazil/travel banter put Muhammad completely at ease",
      "Identified the key differentiator fast: Muhammad wants custom templates, not generic warm-up (Instantly weakness)",
      "Found Warmy via ChatGPT — Felipe turned this into social proof naturally",
      "Dropped from $49 → $10 → $5/mailbox in a natural negotiation that felt like a win for Muhammad",
      "Set a hard Tuesday deadline to create urgency without pressure",
    ],
    improve: [
      "Pricing dropped too fast with minimal pushback — went $49 to $5 in one call. Could have held at $10-15 for 100 accounts",
      "No concrete next step for Muhammad's head of sales approval — who is this person, when will they decide?",
      "Felipe promised to send the proposal 'within minutes' — must follow through immediately",
    ],
    score: 79,
    summary: "Felipe's warmth and rapport-building are class-leading. Muhammad clearly liked him. The pricing strategy is the main concern — $5/mailbox for 100 accounts when the site price is $49 is a 90% discount. The proposal must land within 30 minutes of the call ending.",
  },
  {
    id: "M006", meetingId: "a6402499-ea80-488a-8d8c-5e5c775617a2",
    ae: "felipev@warmy.io", contact: "Aleksandr Grebenkov", company: "GoToGrow.me",
    type: "Demo", date: "2026-05-14", duration: "26 min",
    went_well: [
      "Spotted the partnership/API angle within the first 2 minutes",
      "Correctly identified GoToGrow as a platform customer, not just a user — higher lifetime value",
      "Mentioned the 25% rev share program at exactly the right moment",
      "Kept the trial low-commitment: 'test it, then we can activate the discount'",
      "Aleksdr said 'we are ready, just send the link' — strong closing signal Felipe handled well",
    ],
    improve: [
      "July-August public beta date (major scale inflection point) wasn't confirmed for pipeline forecasting",
      "Partnership handoff was vague — '25% recurring' mentioned but no formal process established",
      "Exact mailbox count for now vs July not confirmed — makes proposal sizing difficult",
    ],
    score: 84,
    summary: "Smart deal shaping. Felipe correctly identified this as a partnership opportunity, not just a customer. The risk is that without a formal partnership process, Aleksdr may evaluate Mailbridge/Trulyinbox in the meantime. This needs to move to the partnership manager quickly.",
  },

  // ══════════════ JORGE ══════════════
  {
    id: "M007", meetingId: "456904da-ebca-4a1f-9bb6-5cacb7c79f9e",
    ae: "jorget@warmy.io", contact: "Scott Conlin", company: "Novelty Lights",
    type: "Demo", date: "2026-05-15", duration: "27 min",
    went_well: [
      "Immediately understood the dual use case (b2c decorative + b2b commercial) and tailored the explanation",
      "Explained seed list mechanics step-by-step — Scott kept saying 'Oh, okay' — it clicked",
      "Proactively confirmed US-based seed list matches their audience without being asked",
      "Got a soft commitment: 'I'll definitely reach out next week either way'",
      "Pricing was clear and fair — Scott said 'good ROI if we bump 10%' and 'low hurdle to implement'",
    ],
    improve: [
      "Jorge took too long to get to pricing — Scott had to ask. Should introduce pricing earlier after discovery",
      "Seasonal angle not used: Oct-Dec is their peak — 'if you start warming now, you'll be ready for Christmas campaigns' would have created urgency",
      "No follow-up meeting booked — 'next week' is vague without a calendar invite",
    ],
    score: 83,
    summary: "Jorge's clarity of explanation is excellent. Scott left fully understanding the product. The seasonal urgency angle (Oct-Dec peak season) was completely missed — this is a strong natural reason to start now. The follow-up should lead with that.",
  },
  {
    id: "M008", meetingId: "32bb06bf-be65-45d4-9ace-308d3b8e138f",
    ae: "jorget@warmy.io", contact: "Loron Grantham + Jake Vandersterren", company: "EchelonDawn",
    type: "Demo", date: "2026-05-14", duration: "3 min",
    went_well: [
      "Payment completed live in under 3 minutes — efficient transactional close",
      "Let Jake (the reseller) drive — correctly identified who the real operator was",
      "Jake said 'you'll hear from me again' — repeat referral source identified",
    ],
    improve: [
      "Jake's company/email wasn't captured for the partner program",
      "No onboarding confirmation sent during the call — should have sent the link live",
    ],
    score: 95,
    summary: "Perfect transactional execution. Jake Vandersterren is a valuable repeat referral source — should be enrolled in the partner program immediately.",
  },
  {
    id: "M015", meetingId: "96800305-c6fb-4a93-8167-57dfdaa1a603",
    ae: "jorget@warmy.io", contact: "Caitlin Marco", company: "Opal.dev",
    type: "Demo", date: "2026-05-15", duration: "29 min",
    went_well: [
      "Excellent discovery — identified the shared Google IP problem and 3% bounce rate immediately",
      "Caitlin came in with a specific requirements list (email validation, dedicated IP, IP warming) and Jorge matched each one",
      "Offered the SMTP server option (dedicated IP through Warmy) which was exactly what Caitlin needed",
      "Caitlin said 'Oh my gosh, I'm so excited' — strong buying signal Jorge handled with confidence",
      "Pricing discounted clearly: $189 → $120/mailbox, $360 total for 3 BDRs",
      "Monday 2PM follow-up call booked on the call",
    ],
    improve: [
      "Stutter on 'business plan or even premium' showed slight uncertainty on plan selection — should have a decision framework ready",
      "Didn't ask about the contract end date with Nooks (they're locked in) — understanding the timeline helps with urgency",
      "3% bounce rate is high — could have sold the email validation tool harder as a quick win",
    ],
    score: 89,
    summary: "Outstanding demo. Caitlin had a precise technical requirement and Jorge matched every point. The Monday follow-up call is already booked. HubSpot shows 90% close probability — this is the highest priority deal on Jorge's pipeline.",
  },
  {
    id: "M016", meetingId: "ce123b34-77ea-4c57-bf65-8407f051728d",
    ae: "jorget@warmy.io", contact: "Pedro Silva", company: "Agemobi",
    type: "Demo", date: "2026-05-14", duration: "18 min",
    went_well: [
      "Clean, efficient demo — 18 minutes is lean for Jorge",
      "Next step agreed on the call",
      "Jorge ran solo confidently",
    ],
    improve: [
      "HubSpot shows $0 deal amount — pricing was never confirmed on the call",
      "Very little context available from the transcript — unclear what Agemobi's specific pain point was",
      "Need to send a clear pricing proposal as the first follow-up action",
    ],
    score: 68,
    summary: "Brief call with limited data. HubSpot shows $0 — this is a data quality issue. The follow-up email must include clear pricing based on their specific use case.",
  },
  {
    id: "M017", meetingId: "fe3ebe6a-fd21-44be-ae69-2083847130d2",
    ae: "jorget@warmy.io", contact: "Bryan Bovey", company: "Individual (human rights advocate)",
    type: "Demo", date: "2026-05-14", duration: "32 min",
    went_well: [
      "Empathetic and patient — Bryan's use case was unusual (human rights advocacy, not commercial) and Jorge handled it respectfully",
      "Correctly identified the core problem: invalid email addresses from ChatGPT-generated lists",
      "Explained email validation tool as the immediate solution",
      "Directed Bryan to the free trial — right call for a low-budget individual",
    ],
    improve: [
      "Bryan is not a viable commercial prospect — the call should have been qualified out faster",
      "Significant technical issues (connection dropping, phone switch) disrupted flow",
      "Jorge spent 32 minutes on someone who explicitly said they have no budget",
    ],
    score: 58,
    summary: "Jorge was kind and helpful but this was not a commercial opportunity. The free trial suggestion was the right call. Time management: 30+ minutes on a zero-budget individual is a calibration issue — Jorge should qualify intent and budget in the first 3 minutes.",
  },
  {
    id: "M018", meetingId: "6c3ba678-c747-4ec1-9f9c-f13d4f0ea5ef",
    ae: "jorget@warmy.io", contact: "Jimmy Hendricks + Andy", company: "WSI World (digital marketing)",
    type: "Demo", date: "2026-05-14", duration: "36 min",
    went_well: [
      "Handled a two-person call (Jimmy the closer + Andy the operator) well — adapted his explanation for both",
      "Correctly sized their volume (under 1k/month) and confirmed they were within the safe zone",
      "Answered the AI question about engagement simulation clearly and accurately",
      "Andy's SDR background meant Jorge could speak more technically — he adapted well",
      "Clear pricing: $49/mo starter, suggested 7-day trial",
    ],
    improve: [
      "Jimmy and Andy left the call to 'have a conversation' — Jorge accepted this without booking a follow-up",
      "The seasonal Atlanta/Austin market angle (55,000 businesses) was an opening for a bigger deal — Jorge didn't explore it",
      "Andy's question about filtering spam-triggered opens vs real opens was sophisticated — Jorge's answer was vague",
    ],
    score: 76,
    summary: "Good call with an interesting two-person dynamic. Jimmy is the relationship closer, Andy handles execution. The lack of a booked follow-up is the main gap. The email should be sent to both with a specific call to action for Andy to start the trial.",
  },
  {
    id: "M019", meetingId: "9fc64ee8-9ec5-47e0-8f44-75e1716a02b4",
    ae: "jorget@warmy.io", contact: "Christina + Noor + Cam + Tony", company: "FanBasis",
    type: "Demo", date: "2026-05-15", duration: "21 min",
    went_well: [
      "Nicole (partnerships) ran the intro perfectly, setting up Jorge as the expert",
      "Jorge handled the large group (5 people) confidently without losing control of the room",
      "Referral agreement was already signed — Jorge correctly positioned this as a partner enablement session",
      "Answered the ICP question well: b2b agencies, SaaS, real estate, marketing agencies",
      "25% recurring rev share was confirmed clearly — Tony's follow-up question was answered by Nicole smoothly",
    ],
    improve: [
      "The session was more about partnership enablement than a demo — Jorge could have been more prescriptive about which FanBasis clients to target first",
      "No specific referral target was agreed — the call ended without a concrete 'send us X type of client' commitment",
      "Jorge's average deal size ($200-300) was shared openly — could anchor expectations too low",
    ],
    score: 75,
    summary: "Good partner session. FanBasis has a large client base of marketing businesses which is exactly Warmy's ICP. The main action item is to get FanBasis sending actual referrals — the partnership agreement is signed but no specific pipeline action was set.",
  },

  // ══════════════ SOFIIA ══════════════
  {
    id: "M009", meetingId: "52a69708-909b-436c-bbe3-e2dd24ef61d1",
    ae: "sofiiar@warmy.io", contact: "Mat Sykes + Agatha Pope", company: "Recolution Group",
    type: "Demo", date: "2026-05-15", duration: "54 min",
    went_well: [
      "Exceptional discovery — asked about opt-in status, Bullhorn architecture, and domain separation strategy before pitching",
      "Validated Mat's domain separation logic (yoke-talent vs main domain) — immediate trust builder",
      "Explained cold vs warm email risk without scaring him",
      "Correctly identified Bullhorn email authentication goes via MS365 mailboxes",
      "Gave concrete infrastructure advice: separate marketing (Sendgrid, high vol) from cold (40-50/day/mailbox)",
    ],
    improve: [
      "54 minutes is too long — could have been 35-40 without losing any value",
      "Pricing was presented at the very end after a long call — Mat had to ask. Should anchor earlier",
      "Trial explanation created a slight mismatch — Mat seemed surprised the 7-day trial wouldn't show improvements",
    ],
    score: 88,
    summary: "Sofiia's best strength on display: making technical prospects feel deeply understood. Mat left the call trusting her expertise. The post-call summary email she promised is critical — Mat said 2 weeks to decide but a great email could accelerate that.",
  },
  {
    id: "M020", meetingId: "09e13571-e4c5-42b9-b66f-2f21794d5eac",
    ae: "sofiiar@warmy.io", contact: "Raven Reichl", company: "Individual B2C sender",
    type: "Proposal", date: "2026-05-15", duration: "25 min",
    went_well: [
      "Closed on the call — Raven said 'send me the payment link and let's get started'",
      "Correctly explained subdomain vs main domain reputation impact",
      "Google Postmaster metrics education was proactive and valuable",
      "Negotiated clearly: $459 → $400 → $389 → final $350",
      "Ran the deliverability test live on the call — showed a 23% spam rate in real time",
      "Explained the GHL (GoHighLevel) SMTP integration correctly and precisely",
    ],
    improve: [
      "Pricing negotiation went through 4 rounds — should anchor the first offer lower to reduce rounds",
      "Raven's 100k/month sending volume with a B2C list is a significant deliverability risk — Sofiia should have flagged the list quality issue more prominently",
      "Took time to confirm IMAP details — slight uncertainty on a technical feature undermined confidence briefly",
    ],
    score: 86,
    summary: "Live close with a B2C sender. Sofiia's technical depth shone — she correctly identified the GoHighLevel integration requirement and ran the deliverability test live. The onboarding needs to include a list quality review before Raven starts sending high volumes.",
  },
  {
    id: "M021", meetingId: "5c4f9e1d-221b-4dfa-86a2-725b9eff276b",
    ae: "sofiiar@warmy.io", contact: "Anshuman Gupta + Ridhima", company: "Juno Innovation Labs",
    type: "Demo", date: "2026-05-15", duration: "18 min",
    went_well: [
      "Immediately validated Anshuman's infrastructure (3 domains × 5 mailboxes) as industry best practice — built confidence from the start",
      "Explained the difference between automated warm-up and seed list clearly and accurately",
      "Handled the Instantly comparison head-on with specific differentiators (database size, AI quality, expert support)",
      "Pricing was transparent: $29/mailbox × 15 = $435/mo, or $31 × 5 if starting smaller",
      "Explained the dedicated expert + Slack channel included at $400+/mo — strong value framing",
    ],
    improve: [
      "Hesitated on whether Warmy replies from the user's mailbox — admitted uncertainty on a basic feature question",
      "18 minutes is short — Anshuman said 'give me about a week' which suggests he wasn't fully sold",
      "Should have pushed for a decision by end of week rather than 'about a week'",
    ],
    score: 82,
    summary: "Good efficient demo with strong product knowledge. The Instantly comparison was handled particularly well. Anshuman's one-week timeline is soft — a strong follow-up email with a specific question about their campaign launch date would create natural urgency.",
  },
  {
    id: "M022", meetingId: "f3357285-4afe-4011-a136-cdb646eef9ec",
    ae: "sofiiar@warmy.io", contact: "Ayesha Mahera + Sabreena Shafi", company: "CloudHire.ai",
    type: "Proposal", date: "2026-05-15", duration: "29 min",
    went_well: [
      "Ayesha was already familiar with the product — Sofiia got right to the technical clarification questions",
      "Correctly explained the IMAP requirement for replies — precise and accurate",
      "Two-domain pricing negotiation was clear: $291 × 2 = $582 → offered $444 for both",
      "Ayesha confirmed management approval was underway during the call",
      "Offered to send the payment link immediately after the call",
    ],
    improve: [
      "Sofiia wasn't sure if the system replies from the user's mailbox — same uncertainty as in the Anshuman call. This is a recurring knowledge gap that needs to be resolved",
      "The clicks vs no-clicks discussion was slightly confusing — Ayesha seemed unsure about bot traffic concern",
      "Should have confirmed the number of senders per domain more explicitly",
    ],
    score: 80,
    summary: "Strong proposal call with a warm prospect. The recurring uncertainty about whether Warmy replies from the user's mailbox is appearing across multiple calls — Sofiia needs a definitive answer to this question to avoid undermining confidence.",
  },
  {
    id: "M023", meetingId: "ca65b2d4-fbf9-458b-9336-43a3d87fc60d",
    ae: "sofiiar@warmy.io", contact: "Charlie Mullinger", company: "WeConference Group",
    type: "Demo", date: "2026-05-14", duration: "24 min",
    went_well: [
      "Immediately and correctly diagnosed the alias problem — Charlie was using aliases for cold outreach which is fundamentally wrong",
      "Explained the alias vs separate mailbox distinction clearly and decisively",
      "Practical advice: create a secondary domain, up to 5 mailboxes, 40 cold emails/day each",
      "Reactivated Charlie's 6-month-old trial on the call — smart move",
      "Correctly identified the best path: add all team mailboxes under Ashley's existing account",
      "Included Ashley in the follow-up email plan — multi-stakeholder awareness",
    ],
    improve: [
      "Sofiia mentioned the starter plan is now annual-only — this may be a blocker for Charlie who wanted monthly",
      "No pricing confirmed — the conversation ended without a number for Charlie to evaluate",
      "Should have set a specific day/time for Charlie to respond rather than 'end of trial'",
    ],
    score: 84,
    summary: "Technically sharp call. Sofiia correctly diagnosed and fixed Charlie's misconception about aliases in minutes. The follow-up email to both Charlie and Ashley needs to include clear pricing and a specific decision deadline.",
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
  const url = `https://app.hubspot.com/contacts/warmy/deal/${dealId}`;
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

        {/* ════ ACTION QUEUE ════ */}
        {tab === "tasks" && (
          <div style={{ animation: "slideUp 0.3s ease" }}>
            {/* Summary strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
              {[
                { label: "Pending",  val: pendingTasks.length,  color: "var(--warmy-orange)" },
                { label: "Urgent",   val: urgentCount,           color: "var(--warmy-red)" },
                { label: "Sent",     val: sentTasks.length,      color: "var(--warmy-green)" },
                { label: "Pipeline", val: pipelinePending,       color: "var(--warmy-yellow)" },
              ].map(s => (
                <div key={s.label} style={{ padding: "12px 14px", background: "var(--warmy-navy-2)", border: "1px solid var(--warmy-border)", borderRadius: 10, borderTop: `2px solid ${s.color}` }}>
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
