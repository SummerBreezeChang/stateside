# Stateside Experience Roadmap

## Product decision

Stateside will help an international student compare a **shortlist of places they are already considering**. It will not search the rental market or tell the student which neighborhood is safe.

The experience transforms scattered listing information into a prepared decision:

> These are the places I like → this is how each one fits my life → this is what is known and unknown → this is what I must verify → this is how I can confidently move forward.

## North-star outcome

The student should leave Stateside able to say:

> I understand the tradeoffs. I know which option fits me best, what could still change my decision, and exactly what I need to ask or verify before paying.

Confidence does not mean certainty or a guarantee of safety. It means the student can see the evidence, uncertainties, consequences, and next actions.

## Emotional journey

| Moment | Student may feel | Product response | Desired feeling |
|---|---|---|---|
| Arrival | Overwhelmed by unfamiliar decisions | Explain the small, concrete task | “I can do this.” |
| Profile | Unsure what matters in the U.S. | Ask plain-language questions with examples | “My real needs are understood.” |
| Shortlist | Information is inconsistent | Normalize the same facts across places | “I can finally compare these.” |
| Analysis | Afraid of missing something | Separate evidence, inference, and unknowns | “I know where uncertainty remains.” |
| Decision | Torn between compromises | Explain how each tradeoff affects daily life | “I understand why one fits better.” |
| Action | Nervous about contacting or paying | Produce a prioritized verification plan | “I know what to do next.” |

## The complete experience

### Screen 1 — Welcome and trust contract

**Purpose:** Set expectations and reduce the fear of starting.

**Primary message:**

> Compare the places you are considering before you apply, pay, or sign.

**Supporting message:** Stateside reviews how each option fits the student's stay, daily routine, rental readiness, and available evidence. It does not guarantee approval or determine whether a home or neighborhood is safe.

**Primary actions:**

- `Try the Berkeley example`
- `Compare my places`

**Why the sample matters:** A judge or uncertain student can see the value before entering personal information.

**Interface:** One calm introductory panel, a small three-step preview, and a visible privacy note explaining that only decision-relevant information is requested.

### Screen 2 — My stay

**Purpose:** Understand the constraints created by the student's academic stay.

**Fields:**

- University and campus
- Program start and end dates
- Arrival date
- Monthly housing budget
- Maximum move-in cash available
- Housing type: studio, private room, or shared room
- Furnished requirement
- Car access

**Important derived facts:**

- Required number of housing months
- Whether a common twelve-month lease would extend beyond the program
- Whether furnishing/setup costs are likely to matter
- Whether the student depends on transit

**Interface behavior:** Group questions into `My program`, `My budget`, and `How I will get around`. Show a compact summary as answers are entered. Avoid requesting passport numbers, immigration documents, bank details, or exact account balances.

**Completion state:**

> You need housing for nine months, plan to arrive August 12, and will depend on walking and transit.

### Screen 3 — What helps me live and rest well

**Purpose:** Capture preferences that listings rarely make comparable.

**Priority controls:** The student marks each as `Essential`, `Important`, or `Flexible`:

- Quiet enough for my sleep schedule
- Private sleeping space
- Short, dependable campus trip
- Easy evening return
- Furnished on arrival
- Grocery and laundry access
- Low move-in cost
- Lease aligned with program dates
- Living with roommates versus living alone

**Rest and roommate questions:**

- Typical sleep and wake times
- Sensitivity to noise
- Evening or early-morning classes/work
- Comfort with guests and shared spaces
- Preference for a roommate agreement

**Design principle:** Do not ask for a generic ranking of “safety.” Ask about concrete, actionable conditions such as building entry, evening transportation, live-tour evidence, lighting evidence when available, and the ability to verify the property.

**Completion state:**

> Your essentials are private sleep space, a furnished home, and dependable transit after evening classes.

### Screen 4 — My shortlist

**Purpose:** Let the student bring two or three places from any source.

**Per-place inputs:**

- Nickname, such as `Shattuck studio`
- Listing URL, if available
- Address or approximate location
- Listing text
- Monthly rent
- Landlord/property-manager messages
- Known lease terms
- Optional screenshot or excerpt later

**Primary interactions:**

- `Add another place`
- `Load sample shortlist`
- `Review my places`

**Interface:** Each option is a simple editable card. Show whether the minimum information needed for analysis is present. Allow incomplete listings—missing information is itself valuable evidence.

**MVP limit:** Three options. This keeps comparison readable and the model response reliable.

### Screen 5 — Check the extracted facts

**Purpose:** Prevent the model from silently turning assumptions into facts.

Before comparison, Stateside shows what it extracted from each listing:

- Rent and included utilities
- Furnished status
- Housing/room type
- Lease dates or duration
- Deposit and fees
- Application requirements
- Transit or location claims made by the listing
- Tour and payment information

Every item is marked:

- **Confirmed:** explicitly present in the supplied material
- **Inferred:** plausible interpretation that the student should check
- **Unknown:** not supplied

**Student action:** Correct a value, confirm it, or leave it unknown.

**Why this screen is essential:** Confidence begins with control over the facts. The system should never hide what it thinks it read.

### Screen 6 — Compare my places

**Purpose:** Make tradeoffs visible without producing a black-box winner.

**Comparison rows:**

1. Rest and privacy
2. Daily-life fit
3. Campus and essentials access
4. Total cost and move-in cash
5. Lease alignment
6. Rental readiness
7. Property and payment verification

**Per-place headline states:**

- `Strong fit based on what is known`
- `Promising—verify first`
- `Significant mismatch`
- `Not enough information yet`

These are explanations, not safety or quality ratings.

**Example comparison:**

| | Shattuck studio | Fulton private room | Albany studio |
|---|---|---|---|
| Headline | Promising—verify first | Strong practical fit | Significant commute tradeoff |
| Rest/privacy | Private, quiet unknown | Private room, roommate habits unknown | Private, street noise unknown |
| Estimated monthly total | $1,980 confirmed/inferred mix | $1,470 | $1,720 plus furnishing |
| Program alignment | 12-month lease for 9-month stay | 9-month term | 9-month term |
| Qualification | No-SSN policy unknown | Sponsor letter accepted | U.S. guarantor requested |
| Biggest next question | Screening and live tour | Roommate sleep/guest habits | Guarantor alternative and evening trip |

**Interaction:** Select a place to understand the reasoning. Do not sort by a single score; preserve the student's priorities and show why the tradeoff matters.

### Screen 7 — Place decision view

**Purpose:** Explain one option deeply enough to support action.

**Header:**

- Place nickname and rent
- Plain-language status
- One-sentence reason
- Critical action, if present

**Sections:**

#### Rest and privacy

- Sleeping-space arrangement
- Known/unknown noise evidence
- Roommate schedule and guest questions
- Heating/cooling, light, and furnishings when supplied
- Questions to ask during a live tour

#### Daily life and access

- Campus trip and evening return
- Transfers and car dependency
- Grocery, pharmacy, laundry, and other essentials
- Terrain and weather considerations when supported

#### Total commitment

- Rent plus known recurring expenses
- Move-in cash
- Furnishing/setup costs
- Lease start/end versus program dates
- Subletting, early termination, and renewal unknowns

#### Rental readiness

- Evidence the student can provide
- Property's stated requirements
- Plausible route: funding letter, sponsor evidence, foreign credit, guarantor, or student-oriented screening
- Missing requirements and exact questions

#### Trust and verification

- What identity/property information matches
- Whether a live or trusted-person tour occurred
- Payment method and urgency
- Inconsistencies
- Unknowns that must remain unresolved until independently checked

**Evidence interaction:** Every important statement can reveal `Source`, `Why it matters`, and `How to verify`.

### Screen 8 — My decision plan

**Purpose:** Convert analysis into a safe, manageable next step.

Each place receives one action lane:

#### Ready to contact

The known information fits the student's priorities and no payment-stopping condition is present. This does not mean ready to sign.

#### Verify before applying

The option may fit, but specific missing facts could change the decision.

#### Pause—do not pay yet

Critical identity, tour, payment, or inconsistency questions remain unresolved.

#### Set aside

The option conflicts with an essential need, such as cost, lease term, private sleeping space, or viable transportation.

**Outputs:**

- Top three next actions
- Questions grouped for landlord/property manager
- Personalized document checklist
- Live-tour checklist
- Generated inquiry email
- University or authoritative resources to contact
- Optional printable/shareable decision summary

**Final confirmation:**

> You have not chosen a guaranteed “safe” home. You have identified the best-supported option, the remaining uncertainties, and the actions required before committing.

### Screen 9 — Return and update

**Purpose:** Treat housing selection as a progressive decision rather than a one-time answer.

The student can add a landlord reply, corrected lease term, tour result, or new place. Stateside updates the comparison and shows what changed:

- `SSN requirement confirmed`
- `Live tour completed`
- `Utilities added to total cost`
- `Roommate quiet hours still unknown`

**MVP implementation:** This can be a local in-session update without accounts or long-term storage.

## The demo shortlist

The demo should compare three intentionally imperfect options:

### A. Shattuck studio

- Private and furnished
- Direct transit to Berkeley
- At the top of the student's budget
- Twelve-month lease for a nine-month program
- No-SSN screening and live-tour availability unknown

### B. Fulton private room

- Lower total cost and nine-month term
- Sponsor/funding documentation accepted
- Private bedroom with shared common space
- Roommate quiet hours, guests, and cleaning expectations unknown

### C. Albany studio

- Private and moderately priced
- Unfurnished
- Longer evening trip with transfers
- Requires a U.S. guarantor but no alternative is stated
- Property tour is available

There should be no perfect answer. The experience demonstrates that the best option depends on the student's essentials and on which uncertainties can be resolved.

## GPT-5.6's central role

One structured analysis request receives:

- Student stay and priorities
- Up to three listings
- Landlord messages and known terms
- Student-confirmed extracted facts

It returns:

- Normalized facts per option
- Confirmed/inferred/unknown evidence labels
- Priority-specific fit and mismatch explanations
- Qualification paths and missing evidence
- Verification concerns
- Cross-option comparison
- Next actions, questions, checklist, and draft email

Deterministic application logic should still calculate date differences and arithmetic totals where possible. GPT-5.6 handles interpretation, synthesis, ambiguity, and personalized explanation.

## Safety rules

- Never declare a property, person, or neighborhood safe.
- Never use demographic composition, national origin, race, or neighborhood income as a proxy.
- Never guarantee rental approval or property legitimacy.
- Never convert an unknown into a reassuring inference.
- Never provide legal or immigration conclusions.
- Always show the evidence supplied by the user separately from external or sample evidence.
- Label all mock demo information clearly.
- Reserve `Do not pay yet` for unresolved verification/payment conditions, not subjective neighborhood judgments.

## Interface language

Prefer:

- `What we know`
- `What is still unclear`
- `Why this matters to you`
- `Ask before applying`
- `Verify before paying`
- `This conflicts with an essential preference`

Avoid:

- `Safe / unsafe`
- `Best neighborhood`
- `Guaranteed approval`
- `Scam detected`
- `Perfect match`
- `AI score`

## MVP build roadmap

### Milestone 1 — Golden-path interface

- Welcome/sample entry
- Preloaded student profile and priorities
- Three-place shortlist
- Fact-review screen
- Comparison and place-detail views
- Decision-plan output using fixture data

**Done when:** The entire experience can be demonstrated without an API call.

### Milestone 2 — GPT-5.6 structured analysis

- Define and validate the response schema
- Connect the shortlist to one analysis request
- Render successful, incomplete, malformed, and failure states
- Preserve deterministic totals and date calculations

**Done when:** The same interface renders live structured output reliably.

### Milestone 3 — Trust and usability polish

- Evidence labels and source reveal
- Clear sample-data labeling
- Input validation and privacy copy
- Mobile layout and keyboard flow
- Loading, retry, and error states
- Safeguard test cases

**Done when:** A first-time judge completes the sample without explanation.

### Milestone 4 — Submission readiness

- Deploy without account creation
- Verify clean setup and sample path
- Update README and architecture notes
- Record Codex decisions and contributions
- Capture `/feedback` session ID
- Record a sub-three-minute demo

**Done when:** The repository, demo, video, and testing instructions are judge-ready.

## Product success signals

For the hackathon, success is qualitative:

- A student can explain why one place fits better than another.
- They can name the most important unresolved fact for each option.
- They know whether to contact, verify, pause payment, or set an option aside.
- They receive useful questions they would not have known to ask.
- The result reduces uncertainty without pretending to eliminate it.

Longer-term measures could include decisions changed after verification, avoided application fees or unsuitable leases, time to a confident shortlist, and student-reported preparedness after move-in.
