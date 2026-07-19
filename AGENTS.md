# Repository Guidance

## Objective

Build a polished, testable OpenAI Build Week 2026 submission using Codex and GPT-5.6 by July 21, 2026 at 5:00 PM PT.

## Working principles

- Protect the selected hero flow; keep scope small enough to finish and demo reliably.
- Use GPT-5.6 for a capability central to the product, not a decorative chat wrapper.
- Prefer a thin end-to-end implementation before adding secondary features.
- Include safe sample data and a judge-friendly path that does not require rebuilding.
- Never commit secrets, private user data, or judge credentials.
- Record material product and engineering choices in `DECISIONS.md`.
- Record concrete Codex contributions in `CODEX_LOG.md`.
- Keep `README.md` accurate as setup and architecture change.

## Verification

- Test the complete hero flow after meaningful changes.
- Run the project's formatter, type checker, and tests before declaring work complete once those commands exist.
- Verify the clean-start setup path before submission.

