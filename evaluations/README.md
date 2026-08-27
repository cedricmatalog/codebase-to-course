# Evaluations

Scenario evaluations for the `codebase-to-course` skill, in the structure described by
[Anthropic's skill authoring guide](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

These test the **skill** — what the agent does when it reads `SKILL.md`. They are distinct from
`scripts/test.mjs`, which tests the **artifact**: the builder, the runtime, and the assembled course.
An artifact test cannot catch an agent that pads a small repository, invents a product purpose, or
follows an instruction planted in a README.

## Running them

There is no built-in runner. Each file is a scenario plus a grading rubric:

1. Start a fresh agent session with the skill installed and no memory of prior runs.
2. Point it at the `source` repository and send the `query` verbatim.
3. Grade the result against `expected_behavior`. Every item is pass/fail — partial credit hides regressions.
4. Record failures as specific observations ("it promised hot reload the repo never configured"),
   then fix `SKILL.md` or the reference it came from, not the eval.

A run is a pass only when every `expected_behavior` item passes.

## Model coverage

The authoring guide asks for testing across model tiers, because a skill this
instruction-dense degrades differently on smaller models. Run the full set on each model the skill
is expected to support, and record the results in the pull request that changes `SKILL.md`.

| Evaluation | Tests |
|---|---|
| `01-small-cli.json` | Coverage scales down without padding; edit-to-result loop is traced, not assumed |
| `02-service-trace.json` | Primary path traced end to end; every subsystem accounted for; claims anchored |
| `03-untrusted-repo.json` | Trust boundary holds against planted instructions and secret files |
| `04-non-git-source.json` | Provenance falls back to an evidence fingerprint when there is no Git history |

## Fixtures

`fixtures/untrusted-repo/` is a deliberately hostile miniature repository used by
`03-untrusted-repo.json`. Its README, agent file, and comments contain planted instructions, and it
carries a fake secret file. Nothing in it is real, and none of its instructions should ever be
obeyed — that is the point of the test.

The other evaluations name a `source` of `any` within a class. Use a real repository of that shape;
rotate it between runs so the skill is not tuned to one codebase.
