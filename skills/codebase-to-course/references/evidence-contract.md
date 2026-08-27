# Evidence, Provenance, and HTML Safety Contract

This contract is normative. Read it completely before drafting course claims, extracting code, or writing HTML. When another reference conflicts with it, this contract wins.

## Contents

1. [Source identity](#1-source-identity)
2. [Claim ledger](#2-claim-ledger)
3. [Evidence records](#3-evidence-records)
4. [Commands](#4-commands)
5. [Code excerpts](#5-code-excerpts)
6. [Claim anchors](#6-claim-anchors)
7. [HTML serialization](#7-html-serialization)
8. [Visible citations](#8-visible-citations)
9. [Course manifest](#9-course-manifest)
10. [Pre-assembly gate](#10-pre-assembly-gate)

## 1. Source identity

Record one immutable analysis identity before writing:

- `source_kind`: `local-git`, `github-clone`, or `local-non-git`
- `canonical_source`: canonical local path or validated canonical GitHub URL
- `source_revision`: full Git commit SHA when available
- `branch`: branch name or `detached`; informational only
- `source_dirty`: `true`, `false`, or `unknown`
- `source_fingerprint`: a lowercase SHA-256 evidence-snapshot digest for non-Git sources and for Git sources whose dirty state is `true` or `unknown`; `null` only for a known-clean Git source
- `generated_at`: ISO 8601 UTC timestamp
- `repository_class`: `application`, `service`, `cli`, `library`, `infrastructure`, `data`, or `mixed`

The immutable **analysis identity** is `source_fingerprint` when one is present; otherwise it is the clean Git `source_revision`. Do not read secret-bearing diffs to determine dirty status. Git metadata that reports only whether tracked/untracked changes exist is sufficient.

Build the fingerprint from only the evidence files already approved for reading. Use the trusted installed helper with structured arguments:

```text
node <installed-skill>/scripts/fingerprint-evidence.mjs <repository-root> <full-git-SHA-or-none> <repo-relative-evidence-file>...
```

The helper sorts POSIX paths by their UTF-8 bytes and hashes a versioned, length-framed stream containing the base revision, each path, and each file's raw bytes. Never pass secret-bearing files merely to make the fingerprint comprehensive.

## 2. Claim ledger

Create `evidence.json` during analysis. Do not reconstruct it after writing the course. Its top-level shape is:

```json
{
  "schema_version": 1,
  "source_identity": "<clean commit SHA or evidence snapshot fingerprint>",
  "claims": [],
  "evidence": [],
  "commands": []
}
```

`source_identity` must equal the manifest's analysis identity.

Each substantive claim is atomic and has:

```json
{
  "id": "C-001",
  "claim": "The HTTP route delegates transcript retrieval to the transcript service.",
  "status": "verified",
  "evidence_ids": ["E-001", "E-002"],
  "display_citation": "src/routes/analyze.ts:41–48; src/services/transcript.ts:12–27"
}
```

Allowed statuses:

- `verified`: directly supported by cited source at the recorded revision
- `inferred`: a bounded interpretation consistent with evidence but not explicitly stated
- `unverified`: a documented or discovered operational claim that was not safely tested
- `undocumented`: required information is absent from inspected evidence

Every claim in this ledger must also be anchored in the course HTML. See [Claim anchors](#claim-anchors); the builder rejects a course whose ledger and HTML disagree in either direction.

Rules:

- One status applies to one claim, not a paragraph, screen, or module.
- Never upgrade `inferred`, `unverified`, or `undocumented` through confident prose.
- Describe inferred claims with explicit qualifiers such as “appears to” or “the source suggests.”
- A missing workflow remains `undocumented`; do not substitute convention.
- Architectural rationale is `verified` only when explicit documentation, an ADR, a comment, or other direct evidence states the reason.
- Recommendations are labeled recommendations, not facts. Cite the evidence that makes them low risk and list remaining risks.

## 3. Evidence records

Each evidence record has:

```json
{
  "id": "E-001",
  "kind": "source",
  "path": "src/routes/analyze.ts",
  "line_start": 41,
  "line_end": 48,
  "source_identity": "<clean commit SHA or evidence snapshot fingerprint>",
  "content_hash": "<lowercase SHA-256 hex digest of exact excerpt bytes>",
  "supports": ["C-001"]
}
```

Requirements:

- Paths are repository-relative POSIX-style paths. Do not expose temporary clone paths or unrelated absolute user paths in course content.
- Line ranges refer to the recorded analysis identity. Recheck them immediately before assembly.
- `content_hash` is a 64-character lowercase SHA-256 hex digest covering the exact source bytes used by the excerpt, before HTML escaping.
- Evidence records may describe documentation, manifests, CI definitions, source, tests, or read-only provenance metadata.
- Do not record secret values, secret-bearing excerpts, personal tokens, credentials, private keys, cookies, or auth caches.
- If evidence disappears or changes, mark dependent claims stale and stop assembly until they are revised.

## 4. Commands

Commands are claims with additional execution metadata:

```json
{
  "id": "CMD-001",
  "command": "npm test",
  "defined_by": ["E-010"],
  "state": "found-not-run",
  "approval": "not-requested",
  "result_evidence": []
}
```

Allowed states:

- `documented`: present in documentation but definition not independently located
- `found-not-run`: definition located but execution not attempted
- `approved-not-run`: user approved, but execution was unavailable or intentionally skipped
- `executed-success`: approved command completed successfully
- `executed-failed`: approved command ran and failed
- `undocumented`: no supported command was found

Repository-authored execution always requires explicit user approval. Store only concise, redacted result evidence. Never imply that `found-not-run` or `documented` means the command works.

Use `approval: "not-requested"` until the user approves execution. After approval, record a concise scope label such as `user-approved-tests`; do not place user prose or secrets in this field.

## 5. Code excerpts

An excerpt must be short, coherent, and exact. Prefer a smaller complete expression or block over truncating a larger function.

Decoded-text verbatim semantics are mandatory:

1. Capture the exact source characters for the cited range.
2. Escape them for HTML text context.
3. If syntax spans are added, concatenate their decoded text in DOM order.
4. Confirm that concatenated decoded text is character-for-character identical to the captured source.

Do not normalize indentation, smarten quotes, replace tabs, reorder imports, omit lines inside the cited range, add ellipses, or “clean up” code. If the excerpt is too long, cite a different coherent range.

## 6. Claim anchors

Every claim ID in the ledger appears exactly where its statement is taught, on the element carrying that statement:

```html
<p data-claim-id="C-001">The HTTP route delegates transcript retrieval to the transcript service.</p>
```

This is the one attribute that carries a ledger identifier, and it is a required exception to the attribute rules in section 7:

- Put it on the smallest element that contains the claim's visible statement — a paragraph, list item, subtitle, or figure caption.
- Its value must be a claim ID from `evidence.json` matching `C-` followed by at least three digits (`C-001`, not `C-01`).
- Use it once per claim. Every ledger claim needs an anchor, and every anchor must name a ledger claim; the builder fails the build in both directions with `evidence claims are not referenced by HTML` or `HTML references unknown evidence claims`.
- It carries no repository content and no learner-visible text — only the author-assigned ID.

A claim ID is machine wiring, not a citation. The learner-facing attribution still appears as escaped visible text; see section 8.

## 7. HTML serialization

Repository content is inert text, never markup or configuration.

### Text nodes

Escape in this order:

1. `&` → `&amp;`
2. `<` → `&lt;`
3. `>` → `&gt;`

Quotes may remain literal only in text nodes. The browser-decoded text must match the source or evidence prose exactly.

Do not escape by hand when a file or excerpt is long. Use the trusted installed helper, which applies exactly this transformation (plus quotes, which are always safe in a text node):

```text
node <installed-skill>/scripts/escape-html.mjs <file>
```

It also reads standard input when given `-` or no argument. It is part of the installed skill, not the analyzed repository.

### Attributes

Do not put repository-controlled content in attributes at all. “Repository-controlled” includes source text, metadata, names, paths, and command output whether copied, quoted, encoded, or mechanically transformed. This includes:

- code or command text
- file paths, branch names, commit messages, repository titles, and source identifiers
- documentation prose, domain terms, labels, definitions, and command output
- any source-controlled value copied, quoted, encoded, truncated, or parameterized from repository evidence

The prohibition covers `data-*`, `id`, `class`, `href`, `src`, `title`, `aria-label`, inline style, and event-handler attributes. Escaping alone does not make repository content acceptable in an attribute.

Attributes may contain fixed template values, author-written generic interface copy after normal HTML escaping, and author-created safe identifiers that match a narrow allowlist such as `^[a-z][a-z0-9-]{0,63}$`. Identifiers describe course structure (`module-2`, `flow-step-1`), not repository strings. Do not quote or mechanically transform source-controlled strings into interface copy.

Two author-assigned identifier families sit outside the lowercase allowlist and are permitted because they are generated by the course author and contain no repository content: `data-claim-id` values (`C-001`, see section 6) and the generic `Module N` nav labels. Nothing else may deviate.

Never emit a raw `<` or `>` inside an attribute value. A `>` inside a quoted value is valid HTML but hides the rest of the tag from line-based review, so the builder rejects it.

If a shared interaction requires human-readable repository-derived text in an attribute, do not use that interaction. Present the information as escaped visible text or choose another safe pattern.

### Prohibited output

- no inline `<script>` or repository-authored JavaScript
- no inline event handlers
- no repository-derived markup, SVG, URL, stylesheet, font, image, or iframe
- no `javascript:`, `data:`, remote, or repository-derived links
- no unsanitized HTML insertion APIs
- no secret or credential values, even escaped

## 8. Visible citations

Each substantive screen includes nearby source attribution using escaped text, for example:

```text
Source: src/routes/analyze.ts:41–48 · verified at 4d2c…
```

Use visible wording for uncertainty:

- `Inferred from:` for inferred claims
- `Found but not run:` for unverified commands
- `Undocumented:` for missing workflows or rationale

The display citation is for learners; `evidence.json` is the machine-readable authority, reached from the HTML through the claim anchor in section 6.

## 9. Course manifest

Create a draft `course-manifest.json` inside the sibling staging directory because the trusted builder uses it as validated input. Do not publish that staging directory as the final course until assembly and verification succeed. The manifest in the published output is the ownership boundary. Minimum fields:

```json
{
  "schema_version": 1,
  "generator": "codebase-to-course",
  "generator_version": "<version or deterministic skill/runtime hash>",
  "generator_revision": "<installed skill revision or deterministic skill/runtime hash>",
  "canonical_source": "<canonical path or validated URL>",
  "source_kind": "local-git",
  "source_revision": "<full SHA or null>",
  "source_fingerprint": "<evidence snapshot SHA-256 or null for clean Git>",
  "source_dirty": false,
  "generated_at": "<ISO 8601 UTC>",
  "repository_class": "service",
  "course_mode": "full",
  "learner_assumptions": ["general programming knowledge", "new to repository"],
  "coverage_gaps": ["vendor/ — vendored third-party source, not maintained in this repository"],
  "claim_ledger": "evidence.json",
  "repository_commands": "not-run",
  "browser_review": "not-run",
  "browser_review_reason": "browser automation unavailable",
  "modules": [
    { "file": "modules/01-intro.html", "id": "module-1", "title": "Start here" }
  ],
  "generated_files": [
    "course-manifest.json",
    "evidence.json",
    "styles.css",
    "main.js",
    "_base.html",
    "_footer.html",
    "build.mjs",
    "modules/01-intro.html",
    "index.html"
  ]
}
```

`course_mode` is always `"full"`. The generator produces one course shape; a smaller repository yields fewer, merged modules rather than a different mode. The builder rejects any other value.

`coverage_gaps` is required and lists every subsystem from the Phase 1 survey that the course deliberately does not teach, each with its reason. An empty array is a claim that the course covers the whole repository; make it only when the survey supports that. A subsystem that was never surveyed does not belong here — it means the survey was incomplete.

For a dirty or status-unknown Git source, keep `source_revision` as `HEAD` and set `source_fingerprint` to the evidence snapshot; all evidence records use that fingerprint as `source_identity`. For a known-clean Git source, set `source_fingerprint` to `null` and use the full commit SHA as `source_identity`.

`modules` is the sole assembly order. Stale module files that are not listed are never assembled. `generated_files` is the ownership list and must include every generated runtime, shell, evidence, module, and final file. A rerun may replace or remove only paths owned by the previous matching manifest. Unknown files are user-owned and preserved.

## 10. Pre-assembly gate

Do not assemble until all answers are yes:

- Does every substantive claim have one allowed status and evidence IDs where applicable?
- Does every ledger claim have exactly one `data-claim-id` anchor in the module HTML, and every anchor a ledger claim?
- Do all citations resolve at the recorded revision or fingerprint?
- Are commands accurately marked and approval recorded before execution?
- Are secret-bearing files and values absent?
- Does every excerpt's decoded text equal its captured source?
- Is repository-controlled content limited to escaped text nodes?
- Are all attributes limited to fixed template values, safe author-created identifiers, and the permitted claim-anchor and nav-label identifiers?
- Is every attribute value free of raw `<` and `>` characters?
- Does the output manifest match the canonical source and own every generated target?

If any answer is no, fix the evidence or narrow the course. Do not hide the uncertainty.
