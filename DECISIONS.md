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
