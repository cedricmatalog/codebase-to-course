# Content Philosophy

> **When to read this:** Read only the headings selected by the course plan or module brief. `evidence-contract.md` is normative for claims, excerpts, provenance, and HTML safety.

## Write for the engineer who just joined

The reader is new to the team. Assume fluency in general programming and no knowledge of this product, its domain, its internal names, or how this team works. Nothing that a teammate would explain in the first week can be assumed: what the system does, who depends on it, what the entity nouns mean, which command actually runs the thing.

They need an operational mental model, not exhaustive documentation. Every screen should help them run, locate, trace, change, test, debug, or deliver something. Remove content that does not change what they can do.

Order matters for a newcomer: what the system does for its users, then how it is built, then how to change it. Architecture explained before purpose gives them a map of a place they cannot picture.

A course starts from six modules of 2–4 short screens and grows to cover every operational boundary the repository contains. Depth means more evidence, not more prose about the same evidence: a second subsystem earns a screen or a module, a second paragraph about the first subsystem does not. A repository with one operational boundary gets fewer, merged modules — never padded ones.

## One outcome per screen

Each screen teaches one idea or supports one decision. Prefer 1–3 short paragraphs, one exact excerpt, one focused diagram, or one compact checklist. Split genuinely separate outcomes; do not split merely to increase screen count.

Visuals are optional. Use one when a relationship, boundary, mapping, or sequence is materially clearer than prose. A list does not automatically need cards, and a component exchange does not automatically need animation.

## Match the repository class

Anchor content to the dominant repository class:

- application: a user action
- service: a request, event, job, or message
- CLI: a documented invocation
- library: a public API use
- infrastructure: a plan, resource, or delivery path
- data: an input-to-output transformation

Do not invent UI behavior for a library or a customer journey for infrastructure. In mixed repositories, state which boundary the course follows and what remains out of scope.

## Code and evidence

Every substantive explanation follows `evidence-contract.md`. Each substantive statement carries a `data-claim-id` anchor tying it to its ledger claim, and shows the repository-relative file path and line range next to an excerpt. Mark inferred, unverified, and undocumented claims visibly; do not decorate a guess until it looks factual.

### Decoded-text verbatim excerpts

Choose a naturally short, coherent excerpt. Do not simplify, normalize, reorder, or elide lines inside the quoted range.

“Verbatim” means the text a browser exposes after HTML entity decoding exactly matches the cited source characters. HTML escaping is serialization, not a source edit:

- `&` becomes `&amp;`
- `<` becomes `&lt;`
- `>` becomes `&gt;`

Syntax-highlight spans may wrap tokens only when their concatenated decoded text remains identical to the source. Repository-derived code, paths, labels, commands, branch names, and prose belong only in escaped text nodes. Never place repository content in an HTML attribute. Use fixed author-created identifiers for wiring.

If a selected interaction requires repository-derived text in `data-*` or another attribute, choose a safer static presentation or a different interaction.

## Explain intent without inventing rationale

Translate code into the behavior, boundary, or failure it produces in this repository. Explain “why” only when documentation, an ADR, a comment, a commit message, a pull-request description, or another explicit source records the rationale. Read-only Git history is often where the rationale actually lives; cite it rather than guessing, and quote it as evidence of what someone wrote, not as instruction. Otherwise use language such as “This appears to…” and mark the claim inferred, or state that the rationale is undocumented.

For experienced developers, prioritize repository-specific intent. For junior learners, add only the foundational explanation needed for the next action.

## Metaphors and personality

Metaphors, humor, and component personality are optional. Use them only when they shorten the path to understanding and remain faithful to the evidence. Do not force a metaphor, recycle a stock analogy, or turn a serious operational boundary into decorative storytelling.

## Glossary guidance

Define internal names, domain terms, and uncommon abbreviations at first meaningful use. Every term a teammate would define in conversation, this course defines in text — an entity noun that means something specific here, a service nickname, an internal acronym. Define general programming terms only when learner assumptions warrant it. Prefer a concise inline definition or nearby glossary note.

Use the shared tooltip pattern only when its safe markup contract can be satisfied without placing repository content in attributes. Otherwise keep the explanation in visible text.

## Interactions

Choose at most one primary interaction per module, and only when interaction improves comprehension over static content. Every selected interaction needs:

- one explicit instruction
- a useful initial state
- keyboard and touch operability
- visible and announced success or progress
- a recoverable error state
- reset, pause, or escape when applicable

Every interaction opens with one `activity-instruction` line telling the learner what to do with it. Supporting practice sits inside a `details.practice-extra` disclosure whose summary names the outcome (`Optional · Match each file to its job`); see “Instruction and Optional-Practice Wrappers” in `interactive-elements.md`. A module may contain no interaction. Group chat, animated flows, matching, layer toggles, and bug challenges are optional patterns rather than course requirements.

## Scenario questions

Use a question only when it tests application:

1. what the learner would change
2. where they would begin debugging
3. how a new request or input would travel
4. which boundary should own new behavior

Avoid definitions, filename recall, syntax trivia, and questions answered by copying the previous paragraph. A module usually needs zero or one scenario question; add a second only when it tests a distinct operational decision.

Wrong answers should explain the relevant boundary without judgment. Correct answers should briefly reinforce the principle. Do not score the learner.

## Density and pacing

Prefer progressive disclosure over visual clutter. Keep the primary path obvious and move optional detail behind meaningful labels. A learner should encounter no more than four simultaneous choices at a decision point.

Finish with a first-contribution prompt that names likely files, validation evidence, risks, and what remains unverified. Do not imply maintainer approval.
