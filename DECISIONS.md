# Decision Log

Record meaningful product, engineering, and design choices. These notes will become README and demo material.

| Date/time (PT) | Decision | Alternatives considered | Why we chose it | Evidence/result |
|---|---|---|---|---|
| 2026-07-18 | Focus Stateside on international students evaluating off-campus housing | Application navigator, I-20 checker, general concierge, host-family marketplace, crisis relay | Specific founder insight, credible Education impact, and a demonstrable decision workflow | Chosen product promise and audience |
| 2026-07-18 | Combine listing fit, rental readiness, property confidence, and preparation | Standalone scam checker or Rental Passport | The complete decision is more useful and differentiated than either isolated tool | Five-part structured analysis |
| 2026-07-18 | Use a Berkeley-only golden path for the MVP | Multi-school support and live inventory aggregation | Scope supports a polished, reliable demo before the deadline | Preloaded UC Berkeley scenario planned |
| 2026-07-18 | Explain evidence without a safety score | Single black-box score | Safety claims require context and unknowns; demographic proxies create fairness risks | Confirmed/inferred/unverified labeling required |
| 2026-07-18 | Keep accounts, marketplace, payments, scraping, and legal analysis out of scope | Full newcomer housing platform | They do not strengthen the core demo enough to justify delivery and safety risk | Explicit MVP non-goals recorded |
| 2026-07-19 | Return from implementation planning to problem discovery | Begin building the previously scoped Berkeley analyzer immediately | The founder wants deeper evidence about students' actual housing difficulties before committing to a solution | First-person community research and interview guide added; product brief treated as a hypothesis |
| 2026-07-21 | Center the MVP on comparing a student's shortlist | Single-listing analyzer, listing marketplace, or open-ended concierge | Students need to understand tradeoffs across places they already prefer; comparison creates a clearer decision and demo | Detailed nine-screen experience and three-option Berkeley scenario defined |
| 2026-07-21 | Position Stateside as a source-neutral decision companion | Compete directly with marketplaces, booking platforms, or guarantor providers | Mature competitors solve inventory and transactions well; the unresolved job is combining cross-platform options with personal readiness and evidence | Competitor analysis and “decision before transaction” positioning added |
| 2026-07-21 | Reduce the hackathon demo to three screens | Preserve the nine-screen roadmap or build an informational landing page | Setup, comparison, and one-place decision planning create the clearest complete judge story | One-click sample reaches the fixed comparison table, then a full decision plan |
| 2026-07-21 | Keep the judge path fixture-first | Call the API for every demo run | The saved response proves GPT-5.6 integration while avoiding latency, quota, and network risk during judging | One real structured GPT-5.6 response is versioned as the UI contract |
| 2026-07-21 | Keep arithmetic outside the model | Ask GPT-5.6 to calculate totals and date differences | Costs and dates must remain reproducible and testable | Monthly totals, move-in cash, and lease fit are calculated in application code |
| 2026-07-21 | Launch with guest favorites instead of real authentication | Build accounts, database persistence, password recovery, and judge credentials | Authentication expands security and operational scope without improving the core GPT-5.6 decision flow | Favorites persist on the current device; account sync is labeled as a post-demo feature |
| 2026-07-21 | Treat images as evidence, not decoration | Use stock neighborhood imagery or an aspirational marketplace gallery | Photo gaps and reused images are decision signals; generic imagery could falsely reassure students | 28 sourced images, photo-count bands, reused-image warnings, map links, and failure states added |
| 2026-07-21 | Lead with a three-second decision hierarchy | Give every comparison row equal visual weight | An anxious student needs to see the decision sequence before reading dense evidence | Qualification, true cost, commitment, and unknowns now lead the comparison |
| 2026-07-21 | Make the public deployment identifiable and indexable | Keep the starter favicon and minimal metadata | Judges and shared-link viewers should immediately recognize Stateside; search engines need explicit page information | Branded favicon, canonical metadata, social cards, manifest, robots rules, and sitemap added |
| 2026-07-21 | Explain Stateside with an outcome, mechanism, and three steps | Keep the more abstract “understand before you commit” landing page | Reference review showed that visitors need to know what the product is, what it does, and how to use it without inference | Hero now names the three-rental comparison; numbered visual steps explain the workflow |
| 2026-07-21 | Use a restrained photographic workflow concept | Keep the visibly generated paper-collage illustration | The first concept communicated well but felt synthetic; a natural tabletop image makes the mechanism feel more credible | Versioned photorealistic hero added with subtle reduced-motion-safe movement; real listing photos remain evidence-only |
| 2026-07-21 | Make the demo a single Berkeley path with plain-language navigation | Keep a multi-market selector and system-oriented labels such as “normalizing” and “analysis” | Only Berkeley has a complete judge flow, and students need task language they can trust immediately | Landing, setup, comparison, and decision screens now follow “Your needs → Compare places → Next steps,” with section links and a full-background photographic hero |
| 2026-07-21 | Pair progress with an explicit next action | Rely on highlighted step circles alone | Showing location without instructions still leaves users unsure how to proceed, especially on mobile | Every work screen now says “You are here,” explains the immediate task, and provides sticky section navigation; the wordmark always resets to Home |
| 2026-07-21 | Make real listing records the single source of truth | Keep fictional Shattuck/Fulton/Albany analysis labels attached to real Haste/Oxford photographs | Listing terms, photos, IDs, and warnings must describe the same properties for the comparison to be trustworthy | GPT-5.6 regenerated the fixture from `fixtures/listings.json`; Haste #27 now enters the distinct “Pause — do not pay yet” lane, and cross-listing findings are visible |
| 2026-07-21 | Make the repository reproducible from a clean clone | Depend on an ignored local Sites build plugin | Judges must be able to install, build, and test without the original Codex workspace | The required plugin is versioned; a clean GitHub clone completes install, production build, and all six tests |
| 2026-07-21 | Calculate lease overrun in application code | Ask GPT-5.6 to state the three-month cost consequence | Extracted facts should remain separate from deterministic arithmetic | Both 12-month Haste leases now show three months beyond the nine-month program: $5,700 and $5,550 respectively |
| 2026-07-21 | Add a curated discovery bookend instead of inventory search | Build search, scraping, or live listing aggregation | Students need a trustworthy place to begin without expanding the MVP into a marketplace | The setup now starts with the university board, explains private alternatives and cautions equally, and sends students back to the existing comparison flow |
| 2026-07-21 | Use the top stepper as Step 1's only orientation | Keep the breadcrumb bar, eyebrow, jump menu, and text-only next cue | Repeating location and direction obscured the actual task and primary action | Step 1 now has one title, one subhead, a compact profile and priority grid, and one full-width “Compare these three places” action |
| 2026-07-21 | Give the landing page one navigation destination and one repeated action | Keep decorative anchor links, a duplicate demo badge, and different section endings | Every visible route should advance the student into discovery or comparison | The header now opens the campus source directory, every section ends with “Start comparing,” and the hero and wordmark use a cleaner visual frame |
| 2026-07-21 | Center the landing wordmark and keep only one header action | Retain section links or the Berkeley demo label in the landing header | A quiet header makes the brand and the next action immediately legible | The borderless landing header now centers a larger 900-weight STATESIDE mark and places “Start comparing” at the right |
| 2026-07-21 | Turn setup into a three-question guided flow | Show profile, priorities, source directory, and three long listing forms on one page | Students need to understand one task at a time and see how outside listings enter Stateside | Setup now moves through stay dates, priorities, and listing links/details, while the judge-safe sample remains clearly labeled |
# 2026-07-21 — Lead comparison results with listing photos

- The comparison page now shows all three listing-photo galleries immediately after its heading.
- Decision guidance and the full evidence table follow the visual overview.
- Photo-source dates and the live-tour warning remain visible so imagery is treated as evidence, not proof.
# 2026-07-21 — Show Bay Area campus expansion honestly

- Added a seven-school selector covering UC Berkeley, Stanford, San Francisco State, San José State, University of San Francisco, Golden Gate University, and Santa Clara University.
- UC Berkeley remains the complete researched demo; the other schools are labeled directory previews and link first to official university resources.
- School and marketplace links are framed as research starting points, not endorsements.
# 2026-07-21 — Make the demo contract honest and finish the decision flow

- The setup now presents a dated, researched Berkeley sample instead of implying that arbitrary pasted links or edited priorities trigger new analysis.
- Students may select one, two, or three prepared listings; the comparison and detail navigation respect that shortlist.
- The comparison leads with photos and concise conclusions, while the wide evidence table is collapsed behind “View full comparison.”
- Detail pages show complete next actions immediately after the headline recommendation and provide accessible, named controls.
- Custom profiles, live link retrieval, and GPT-5.6 analysis of new listings remain the next product phase rather than simulated demo behavior.
# 2026-07-21 — Make the Stateside wordmark the navigation anchor

- Centered the Stateside wordmark geometrically in both landing and in-product navigation.
- Increased the wordmark size, tightened its tracking, and retained the 900-weight Unbounded face for a more obvious brand signature.
- Rebalanced the surrounding controls so progress and demo context do not shift the logo away from center.
# 2026-07-21 — Use one restrained motion language throughout Stateside

- Added a shared scroll-reveal system across landing, setup, comparison, and detail screens instead of one-off section animations.
- Sections and repeated cards alternate subtle left/right movement with small staggered delays, light blur, and a soft ease-out.
- Motion runs once as content enters the viewport and is fully disabled when the visitor prefers reduced motion.
