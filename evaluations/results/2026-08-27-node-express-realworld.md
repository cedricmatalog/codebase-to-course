# Evaluation run — 2026-08-27

**Scenario:** `02-service-trace.json`
**Source:** `https://github.com/gothinkster/node-express-realworld-example-app` at `30b68e1e881462b2f4164ea09ab4c4f5699c7b0b`
**Model:** Claude Opus 5
**Scope:** Phase 1 analysis and curriculum design. A full course build was not produced, so
expectations that depend on assembled HTML are marked not-exercised rather than passed.

The repository is a RealWorld reference implementation: Express, Prisma, PostgreSQL, JWT auth,
two Nx projects (`api`, `e2e`), 67 files.

## Graded expectations

| Expectation | Result |
|---|---|
| Product purpose sourced and cited before architecture | pass — README states the RealWorld spec and links it |
| Purpose marked undocumented when absent | not-exercised — the README states it |
| Primary path traced end to end with resolvable line ranges | pass — `main.ts` → `routes.ts` → `<feature>.controller.ts` → `.service.ts` → Prisma |
| Other significant entry points named | pass — four feature routers: article, auth, profile, tag |
| Testing and debugging covered, including where output appears | pass — Jest via `nx test`; `console.info('server up on port …')` on stdout |
| What must already exist to run, and what a local run needs | pass, and see finding 1 |
| Which environment a local run talks to | pass, and see finding 3 |
| Identity, authorisation, and where state lives | pass — `express-jwt` in `auth/auth.ts`; four Prisma models |
| Deprecated pattern coexisting with its replacement | pass (negative) — none found; the four features are structurally identical |
| Placement convention for a new endpoint or test | pass — see finding 5 |
| Domain vocabulary defined at first use | pass — Article, Comment, Tag, User, slug, favorite, following |
| Contribution conventions reported or marked undocumented | pass (negative) — no CONTRIBUTING, CODEOWNERS, or PR template exists; correctly `undocumented` |
| Every claim anchored to an evidence record | not-exercised — no course was assembled |
| First contribution with files, validation, and risks | not-exercised |

## What the instructions caught that a manifest read would not

1. **`axios` and `@ngneat/falso` are runtime `dependencies` but are imported only by the e2e tests
   and the seed script.** Reading `package.json` would tell a newcomer this service makes outbound
   HTTP calls. It does not. The rule requiring the role to be established from where the repository
   actually imports a package is what caught this.
2. **The only true outbound dependency is PostgreSQL**, reached through the Prisma datasource
   (`env("DATABASE_URL")`).
3. **There is no compose file and no local database.** Postgres has no local substitute here, so the
   documented setup cannot be completed without bringing your own — the blocked-first-day case.
   The README also instructs local developers to set `NODE_ENV=production`.
4. **`PORT` is read in `src/main.ts` but is absent from the README's list of required variables.**
   A documentation-versus-source discrepancy that only source-derived evidence surfaces.
5. **The placement convention is inferrable and unwritten:** every feature is
   `src/app/routes/<feature>/` containing `<feature>.controller.ts`, `.service.ts`, `.model.ts`,
   with the controller registered in `routes.ts` via `.use()`. Nothing documents this; it is an
   `inferred` claim supported by four consistent examples.
6. **`credentialsRequired: false`** in the JWT middleware means some routes accept anonymous
   requests — an authorisation subtlety a structural summary would miss.
7. **`e2e/` is a second Nx project the primary path never touches.** The coverage checklist forces
   it to be taught or recorded as a gap instead of silently ignored.
8. **Git history records the current structure's origin** (`chore: move to nx`), which is the only
   evidence that could make a "why" claim verified here.
9. **Nothing in the repository settles whether `npm start` watches for changes.** Correctly recorded
   as undocumented rather than promising hot reload.

## Gaps found in the skill itself

- **Clone depth is unspecified.** `SKILL.md` prescribes `git clone -- <url> <dest>` with no guidance
  on depth. A shallow clone silently truncates the Git history the rationale item now depends on,
  and a full clone of a large repository is expensive. Neither trade-off is stated.
- **No guidance when the answer lives in a third-party tool.** Tracing `npm start` bottoms out at
  `nx serve` → `@nx/js:node`, whose watch behaviour is defined by Nx, not by this repository.
  Marking it undocumented is correct but unhelpful; the learner should be pointed at the tool and
  version that owns the behaviour.

## Follow-up

Both gaps above were patched the same day: clone-depth guidance and the rationale trade-off were
added to the source-resolution steps, a "when the trace leaves the repository" rule was added to
Phase 1, and `06-github-url-source.json` was added to cover URL sources, which no earlier scenario
exercised.

## Verdict

The Phase 1 instructions produced a materially better picture than a manifest-and-structure summary
would have, and the four findings above (1, 3, 4, 6) are ones a new engineer would otherwise hit on
their first day. Two small gaps in the skill were found and are recorded above.
