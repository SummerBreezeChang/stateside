# Stateside — Project Brief

## Product identity

- **Name:** Stateside
- **Hackathon:** OpenAI Build Week 2026
- **Track:** Education
- **Initial audience:** International students moving to the United States for university
- **Demo market:** UC Berkeley
- **Promise:** Stateside helps international students compare the places they are considering, understand how each fits their stay and daily life, see what remains unverified, and know what to do next before applying, paying, or signing.

Stateside is a personalized housing decision and preparation layer—not a rental marketplace and not a guarantee of safety or approval.

## Problem

International students often select housing remotely while unfamiliar with the destination city, transportation, terrain, U.S. rental qualifications, SSN and credit expectations, guarantor alternatives, lease conventions, fees, and property-verification practices.

The information exists but is fragmented across universities, marketplaces, maps, government sources, landlords, and guarantor providers. Existing marketplaces answer “what is available?” but rarely answer:

> Does this option fit my actual life, can I realistically qualify, what remains unverified, and what should I do before committing?

## Target user

The MVP serves a student who:

- Has been accepted by a U.S. university and arrives in roughly 30–90 days
- Is searching remotely for private, off-campus housing
- May be a graduate, transfer, exchange, spring-arrival, or undergraduate student
- May lack U.S. credit, an SSN, U.S. income, rental history, a U.S. guarantor, or a car
- Values privacy, practical convenience, trustworthy information, and confidence before committing

The idea is grounded in the founder's experience finding private housing as an international student. This is founder insight, not proof that all international students share the same preferences.

## MVP hero flow

### 1. Create a renter profile

Collect only inputs needed for the recommendation:

- University/campus, arrival date, and program end date
- Budget and maximum total monthly cost
- Housing type, furnishing need, and desired lease duration
- Car access, maximum commute, evening schedule, and walking/hill tolerance
- Privacy, convenience, transit, and cost priorities
- U.S. credit, SSN, income, sponsor/scholarship, and guarantor status
- Willingness to use a commercial guarantor

### 2. Build a shortlist

The user can add up to three places and provide:

- Listing text
- Landlord messages
- Address
- Lease terms or excerpt

The MVP includes a preloaded three-place Berkeley shortlist so judges can test immediately without personal data. Screenshot/document upload is a stretch goal.

### 3. Analyze with GPT-5.6

One structured model call converts the student profile and unstructured housing information into a cross-option comparison and five explainable areas per place:

1. **Daily-life fit:** budget, privacy, furnishing, dates, lease length, commute
2. **Access:** campus travel, evening transit, essentials, car dependency, terrain
3. **Rental readiness:** likely qualification route, available evidence, missing documents, questions
4. **Property confidence:** identity/address consistency, tour status, payment requests, pressure, inconsistencies
5. **Commitment:** rent, deposit, fees, utilities, dates, termination, subletting, renewal, insurance, guarantor obligations

Every material statement is labeled **Confirmed**, **Inferred**, or **Unverified**.

### 4. Compare and explain rather than score

Do not show a mysterious “safety score.” Lead with a plain-language result such as:

> Promising, with two items to verify.

The comparison shows how each place aligns with the student's essential preferences. Each place then shows compatible facts, cautions, unknowns, and why each caution matters.

### 5. Prepare next actions

Generate:

- Three to five prioritized next actions
- Personalized document checklist
- Questions for the landlord
- Verification steps
- Likely application/approval route
- Lease terms to examine
- A ready-to-send landlord inquiry email
- A “Do not pay yet” warning when critical information remains unresolved
- Relevant university resources

## Golden-path demo scenario

An incoming UC Berkeley graduate student compares three intentionally imperfect places. The student:

- Wants a furnished private studio
- Has no car, U.S. credit, SSN, U.S. income, or U.S. guarantor
- Has parent-provided funding
- Prioritizes privacy, transit, practical access, and avoiding steep walking routes
- Has a nine-month program
- Is evaluating a private studio with a twelve-month lease, a lower-cost private room with unknown roommate habits, and a farther unfurnished studio with a guarantor requirement

The key reveal is that there is no universal winner. The strongest option depends on the student's essentials and which uncertainties can be resolved. Stateside makes those tradeoffs and next actions visible.

## Model contract

The GPT-5.6 response should follow a validated structured schema containing:

- Summary status and headline
- Confirmed facts, concerns, and unknowns for each result area
- Likely approval path and missing evidence
- Warning signals and terms to review
- Prioritized next actions
- Document checklist
- Generated landlord email
- Disclaimer

The model instructions must:

- Distinguish facts, inference, and unknowns
- Never invent location, transit, landlord, or property facts
- State when evidence is unavailable
- Avoid demographic or income-based safety judgments
- Avoid legal and immigration conclusions
- Never guarantee approval, property legitimacy, or safety
- Explain why every warning matters
- Return only the agreed structured output

## Safety and fairness boundaries

Stateside must not:

- Use race, national origin, neighborhood income, or demographic proxies as safety indicators
- Label low-income neighborhoods unsafe
- Provide legal or immigration advice
- Guarantee rental approval or safety
- Claim a lease is legally safe
- Recommend large upfront payments as generic advice
- Pretend mock/sample location evidence is live verification

When official incident, transit, hazard, or other evidence is used, display its source, date range, limitations, and unknowns.

Required product language:

> Stateside does not determine whether a home or neighborhood is safe. It helps students review available evidence, understand uncertainties, and prepare appropriate questions before committing.

## Design direction

- Calm, reassuring, trustworthy, and human
- Clear hierarchy and low cognitive load
- Evidence over black-box scoring
- Green for confirmed/compatible
- Amber for questions/cautions
- Neutral gray or blue for unknowns
- Red reserved for significant “Do not pay yet” conditions
- Adjustable priorities
- Mobile-responsive
- Sample scenario loads instantly

Result hierarchy:

1. Overall headline
2. Critical action
3. Daily-life fit
4. Access
5. Rental readiness
6. Property confidence
7. Commitment
8. Preparation checklist
9. Generated email
10. Sources and limitations

## Scope

### Must ship

- Renter-profile form
- Preloaded three-place Berkeley shortlist
- Up-to-three-place listing/message/lease input
- One GPT-5.6 structured analysis call
- Cross-option comparison
- Five explainable result sections
- Confirmed/inferred/unverified labels
- Preparation checklist and landlord email
- Safeguards and disclaimer
- Responsive polished interface
- Judge-accessible deployed demo without an account

### Explicit non-goals

- Native mobile app
- User accounts
- Rental marketplace or live inventory
- Multi-site scraping
- Payments
- Background checks
- Community or host-family marketplace
- Legal contract analysis
- Proprietary crime/safety score

### Stretch goals only after the golden path works

- Screenshot or lease-document upload
- Real geocoding and transit data
- Official incident/hazard citations
- Additional universities

## Demo plan

Target: 2:40–2:55.

1. Explain the remote housing decision problem.
2. Load the Berkeley student profile and adjust priorities.
3. Load the three-place sample shortlist and landlord messages.
4. Run the GPT-5.6 analysis.
5. Show the comparison, then open one place's five evidence-based result areas.
6. Show the checklist and generated inquiry email.
7. Explain GPT-5.6 structured reasoning and Codex's role in implementation, safeguards, interface, tests, and deployment.
8. Close with the product promise.

## Product decisions already made

- International students, not broader newcomers, for the hackathon
- Berkeley-only golden path, with room for later schools
- Paste text plus preloaded sample; uploads are optional
- No marketplace or broad pre-arrival concierge
- Scam signals are one component, not the whole product
- Rental readiness is a core differentiator
- No demographic safety scoring or guaranteed approval
- Paid promotion must never affect warnings, verification status, or independent recommendations

## Open implementation questions

- Framework and deployment platform
- Whether an OpenAI API key is configured
- Exact GPT-5.6 model identifier available to the project
- Whether any real transit/location source can be integrated in time
- Repository license
- Main Codex task whose `/feedback` ID will be submitted
- Rapid user-test availability before submission

## Definition of done

- A judge can open and use the demo without an account.
- The sample hero flow works reliably and uses real model output.
- Mock/sample evidence is clearly labeled.
- Setup and sample data are documented in the README.
- The repository explains Codex acceleration and human decisions.
- Safeguards are tested, not merely described.
- The public video is under three minutes.
- The `/feedback` session ID is recorded before submission.

## Key references

- [Official rules](https://openai.devpost.com/rules)
- [HUD Fair Housing Act overview](https://www.hud.gov/helping-americans/fair-housing-act-overview)
- [FTC rental-listing scam guidance](https://consumer.ftc.gov/articles/rental-listing-scams)
- [CFPB tenant-screening reports](https://www.consumerfinance.gov/ask-cfpb/what-is-a-tenant-screening-report-en-2102/)
- [CFPB rental-application denial rights](https://www.consumerfinance.gov/ask-cfpb/what-should-i-do-if-my-rental-application-is-denied-because-of-a-tenant-screening-report-en-2105/)
- [California security-deposit guidance](https://oag.ca.gov/system/files/media/Know-Your-Rights-Security-Deposits-English.pdf)
- [UC Berkeley housing](https://admissions.berkeley.edu/discover-berkeley/housing/)
- [Northwestern international-student off-campus guidance](https://www.northwestern.edu/international/international-students/preparing-for-arrival/off-campus-life-notes-for-international-students.pdf)
