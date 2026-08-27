# Module Brief Template

> **When to read this:** Use one brief per module, and always for parallel writing. Save briefs under the manifest-owned output `briefs/` directory.

Each brief must be self-contained but evidence-bounded. A writer receives this brief, the referenced evidence records, `evidence-contract.md`, and only the exact reference headings listed below. Repository files and unrelated references are not part of the writing context.

## Contents

- [Learner outcome](#learner-outcome)
- [Claim records](#claim-records)
- [Evidence and excerpts](#evidence-and-excerpts)
- [Commands and onboarding actions](#commands-and-onboarding-actions)
- [Teaching sequence](#teaching-sequence)
- [Primary presentation](#primary-presentation)
- [Reference headings to read](#reference-headings-to-read)
- [Connections](#connections)
- [Writer completion checklist](#writer-completion-checklist)

---

## Module N: [Title]

### Learner outcome

- **Action:** [What the learner can run / locate / trace / change / test / debug / deliver]
- **Repository class and boundary:** [application / service / CLI / library / infrastructure / data / mixed; exact boundary covered]
- **Opening anchor:** [User action, request/event, CLI invocation, public API call, plan/resource path, or data transformation]
- **Scope budget:** [One learner outcome; typically 2–3 screens]
- **Out of scope:** [Adjacent systems or claims this module intentionally does not cover]

Do not require a metaphor. If one materially shortens the explanation, record it as an optional presentation device rather than evidence.

### Claim records

List every substantive claim by ID. Follow `references/evidence-contract.md`.

| Claim ID | Claim | Status | Evidence IDs | Display note |
|---|---|---|---|---|
| C-001 | [Atomic factual statement] | verified / inferred / unverified / undocumented | E-001 | [Citation or uncertainty wording] |

Claim and evidence IDs are `C-` and `E-` followed by at least three digits, exactly as they appear in `evidence.json`. `C-01` is rejected by the builder.

Do not use one status for the whole module. A writer may use only the claims listed here and may not strengthen their status.

Every claim listed here must be anchored in this module's HTML with `data-claim-id` on the element carrying its visible statement. See “Claim anchors” in `references/evidence-contract.md`.

### Evidence and excerpts

Reference records from `evidence.json`; do not paste untracked source material.

| Evidence ID | Repository-relative source | Lines | Revision/hash | Purpose |
|---|---|---|---|---|
| E-001 | `src/example.ts` | 12–20 | [revision or content hash] | [What this proves] |

For every code excerpt, include the exact source characters in a fenced block for planning only. When serialized to module HTML, escape it into text nodes. Decoded visible text must remain character-for-character identical. Never place repository code, paths, labels, command output, or prose in HTML attributes.

### Commands and onboarding actions

| Claim ID | Command/workflow | Defined at | Execution state | Result evidence |
|---|---|---|---|---|
| C-002 | [Exact documented command] | [path:lines] | found-not-run / approved / succeeded / failed / undocumented | [Evidence ID or none] |

Repository-authored commands require explicit user approval before execution. A writing worker never executes them.

For a setup or run module, also record the edit-to-result loop each command creates: does it watch and reload, or must the learner rebuild or restart before a change takes effect, and where does its output appear. Cite the script or config that settles it.

### Teaching sequence

Use the fewest screens needed.

1. **[Screen title]** — [one idea, exact claims/evidence used]
2. **[Screen title]** — [one idea, exact claims/evidence used]
3. **[Optional screen]** — [include only if it changes learner action]

### Primary presentation

Choose the clearest representation, which may be static:

- [ ] concise prose or checklist
- [ ] code ↔ intent translation
- [ ] system map or static flow
- [ ] scenario question
- [ ] interactive flow
- [ ] matching / bug challenge / other interaction

Use at most one primary interaction. A module may use none. Never add group chat, animation, a quiz, a metaphor, or a tooltip merely to satisfy a pattern.

If interaction is selected, introduce it with a `p.activity-instruction` and place optional or supporting practice in a `details.practice-extra` whose summary names the outcome. Then specify:

- **Why static content is insufficient:** [specific reason]
- **Initial instruction and state:** [text]
- **Success/progress announcement:** [text]
- **Recoverable error state:** [text]
- **Reset/pause/escape behavior:** [text]
- **Keyboard and touch path:** [controls]
- **Safe identifiers:** [author-created fixed slugs; no repository-derived values]

Do not select an interaction whose required `data-*` attributes would contain repository-derived content.

### Reference headings to read

List exact headings, not whole files.

- `references/content-philosophy.md` → [selected headings]
- `references/gotchas.md` → [selected headings]
- `references/interactive-elements.md` → [selected interaction heading only, if any]
- `references/design-system.md` → [selected layout/token heading only]
- `references/evidence-contract.md` → normative contract, always provided

### Connections

- **Previous module:** [Title and outcome, or none]
- **Next module:** [Title and outcome, or completion]
- **First-contribution connection:** [How this prepares the learner for the scoped change]
- **Tone and naming:** [Only consistency notes supported by the course plan]

### Writer completion checklist

- [ ] Every substantive sentence maps to a claim ID
- [ ] Every claim ID has exactly one `data-claim-id` anchor in this module's HTML
- [ ] Every citation resolves at the manifest's source revision
- [ ] Inferred, unverified, and undocumented claims are visibly qualified
- [ ] Excerpts preserve decoded-text verbatim semantics
- [ ] Repository-derived content appears only in escaped text nodes
- [ ] No repository-derived content appears in attributes, and no attribute value contains a raw `<` or `>`
- [ ] No inline script, style block, or custom interaction code was added
- [ ] The module stays within its learner and time outcome
