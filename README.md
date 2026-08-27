# Codebase to Course

Codebase to Course is an Agent Skill that turns repository evidence into an interactive developer-onboarding course. The installable skill is located at [`skills/codebase-to-course/`](skills/codebase-to-course/); root-level scripts and package metadata are maintainer tooling and are not part of the skill payload.

> **RELEASE BLOCKED:** This project is derived from Zara Zhang's original Codebase to Course repository, which currently provides no license granting redistribution or modification rights. Public distribution, marketplace publication, and claims that this fork is live or safe to install are blocked until the maintainer obtains explicit permission or a compatible upstream license. This repository does not invent or imply a license.

## Install and use

The intended one-command Codex install, once redistribution permission or licensing is in place, is:

```bash
npx skills add cedricmatalog/codebase-to-course -g -a codex -y
```

For another supported coding agent, omit `-a codex -y` and choose the agent interactively.

Then open your coding agent inside the repository you want to learn and use:

```text
Use the codebase-to-course skill to create an interactive developer onboarding
course for this repository. Focus on setup, architecture, one key request flow,
testing and debugging, and a first safe contribution.
```

The open `skills` CLI discovers the skill from `skills/codebase-to-course/SKILL.md`. A project-local preview of discovery is:

```bash
npx skills add . --list
```

Do not publish or redistribute an installation while the release block above remains unresolved.

## Release checklist

1. Obtain written permission from the upstream copyright holder or wait for an upstream license that clearly permits this fork's modification and redistribution. Record the permission; do not guess at a license.
2. If you want this repository to stop appearing as a GitHub fork, follow GitHub's [detaching-a-fork procedure](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/detaching-a-fork). Detaching changes GitHub's repository relationship only; it does not remove attribution, copyright, or license obligations.
3. Run the validation commands below and require the `Validate` workflow to pass on the exact release commit.
4. Run every scenario in `evaluations/` against each model tier the skill is expected to support, and record the results. `npm test` checks that the evaluations are well formed; it cannot run them, because grading requires observing an agent.
5. From a clean temporary directory, verify `npx skills add cedricmatalog/codebase-to-course --list`, install it, and confirm that only `skills/codebase-to-course/` is delivered.
6. Only after steps 1–5, update the release notice and announce the install command.

## What the skill is designed to produce

The skill instructs an agent to analyze a target repository, distinguish verified facts from inference, and generate a static course directory containing an assembled `index.html`, shared CSS and JavaScript, and authored module fragments. Intended course topics include setup, architecture, a real execution path, testing and debugging evidence, and a scoped first contribution.

Generated courses may include source excerpts, paths, commands, architecture descriptions, and inferred behavior from the target repository. They must be reviewed by a person familiar with that repository before being treated as onboarding or operational documentation.

## Repository structure

```text
.
├── skills/
│   └── codebase-to-course/
│       ├── SKILL.md
│       ├── agents/openai.yaml
│       ├── references/
│       └── scripts/                 # Trusted escaping/fingerprint helpers
├── evaluations/                # Skill scenario evaluations and the hostile fixture
├── scripts/                    # Maintainer validation tooling
├── .github/workflows/          # CI checks
├── package.json                # Private maintainer tooling only
└── README.md
```

## Validation

Maintainers use Node.js and npm for repository checks. Browser binaries are not installed by `npm ci`; install Chromium separately before the full test run:

```bash
npm ci
npx playwright install chromium
npm test
```

`npm test` runs static syntax checks and `node scripts/test.mjs`, which owns the end-to-end maintainer validation flow and verifies that the scenario evaluations in `evaluations/` are well formed. CI repeats these checks and performs a local `npx skills` discovery/install smoke check to confirm that the intended skill is discoverable and internal artifacts are not included in the installed payload.

Validation provides evidence about the committed templates, assembly, and tested browser paths. It does not prove that every generated course is accurate, secure, accessible, or appropriate for a target repository; generated output still requires human review.

Artifact tests cannot observe agent behaviour. The scenario evaluations in [`evaluations/`](evaluations/) cover what the agent does with the skill — coverage that scales to the repository, an intact trust boundary against a hostile fixture, and correct provenance for a non-Git source. They are graded by a person against each scenario's `expected_behavior` list; see [`evaluations/README.md`](evaluations/README.md).

## Security

Treat the skill as instructions for an agent with access to the target repository and its available tools:

- Review requested filesystem, shell, network, and Git operations before approving them.
- Do not expose secret values. Environment-variable names may be documented, but credentials and local secret files must not be copied into a course.
- Review generated source excerpts and architecture details before sharing a course outside the target repository's authorized audience.
- Treat setup, test, clone, and validation commands as untrusted until they are traced to repository evidence and judged appropriate for the current environment.
- Report suspected security issues privately to the repository maintainer rather than placing sensitive details in a public issue.

No security audit or public safety guarantee is claimed while release remains blocked.

## Provenance

Originally created by [Zara Zhang](https://github.com/zarazhangrui/codebase-to-course). This fork reorganizes the project as a multi-skill-compatible repository and adds a portable course runtime, accessibility and interaction work, validation tooling, and a developer-onboarding workflow.

Attribution records origin; it is not a substitute for a license. The upstream repository currently exposes no license, so explicit permission or a compatible upstream license is required before this fork can be publicly distributed.
