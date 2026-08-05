---
name: codebase-to-course
description: "Turn an unfamiliar codebase into an interactive developer-onboarding course that accelerates a new contributor's first confident change. Use when someone asks to onboard a developer, explain a repository or architecture, trace a feature or data flow, create a codebase walkthrough, or make an interactive course or tutorial from a local project or GitHub repository. Produces a portable browser-based course covering setup, system boundaries, real execution paths, testing, debugging, and a first contribution, with source-grounded code explanations, visualizations, and exercises."
---

# Codebase-to-Course

Transform any codebase into a source-grounded, interactive developer-onboarding course. The output is a **directory** containing a pre-built `styles.css`, `main.js`, per-module HTML files, and an assembled `index.html` — open it directly in the browser with no setup required (only external dependency: Google Fonts CDN). The course helps a new contributor get the project running, understand its architecture, trace a real execution path, debug failures, and identify a safe first change.

## First-Run Welcome

When the skill is first triggered and the user hasn't specified a codebase yet, introduce yourself and explain what you do:

> **I can turn any codebase into an interactive onboarding course that helps a developer become productive faster.**
>
> Just point me at a project:
> - **The current project** — "onboard me to this repository"
> - **A local folder** — "create an onboarding course for ./my-project"
> - **A GitHub link** — "onboard me to https://github.com/user/repo"
>
> I'll trace the architecture and a real feature through the source, extract the documented setup and test workflow, and generate a browser-based course with diagrams, code explanations, debugging exercises, and a useful first contribution.

If the user provides a GitHub link, clone the repo first (`git clone <url> /tmp/<repo-name>`) before starting the analysis. If they say "this codebase" or similar, use the current working directory.

## Who This Is For

The primary learner is a **developer joining an unfamiliar codebase**: a new hire, an internal transfer, an open-source contributor, or an engineer moving across the stack. They know general programming concepts but do not yet know this repository's product language, boundaries, conventions, or failure modes.

Calibrate explanations to the user's experience. By default, explain repository-specific terms and non-obvious framework behavior without reteaching basic syntax. If the user identifies as junior or non-technical, add more foundational definitions. Never assume familiarity with the project's domain or use "as you probably know."

**Their goals are operational:**
- Get the project running without guessing at prerequisites or commands
- Build a reliable mental model of components and ownership boundaries
- Trace a real feature from entry point to side effects
- Know where to add a change and which tests should protect it
- Recognize logs, failure modes, and debugging entry points
- Make a small first contribution with confidence
- Use precise repository vocabulary when collaborating with people or AI coding agents

## Why This Approach Works

Developer onboarding is fastest when it begins with a real product behavior, follows that behavior through the architecture, and ends with a change the learner can make. The course turns scattered repository evidence into that guided path.

Every module answers **"what will this help me do?"** before diving into implementation. Prefer operational knowledge over exhaustive documentation: how to run, trace, change, test, debug, and ship this system.

The directory-based output is intentional: separating CSS/JS from content means AI never regenerates boilerplate, each module is written independently (keeping output size small and quality high), and the assembled course works locally with zero setup. Course content and interactivity work offline; web fonts are progressive enhancement.

---

## The Process

### Phase 1: Codebase Analysis

Before writing course HTML, deeply understand the codebase. Read all the key files, trace the data flows, identify the "cast of characters" (main components/modules), and map how they communicate. Thoroughness here pays off — the more you understand, the better the course.

**What to extract:**
- The documented prerequisites, package manager, install/run/build/lint/test commands, and where each command is defined
- Required environment variable **names** and their purpose; never expose or invent secret values
- The repository map: applications, packages, services, generated code, migrations, tests, infrastructure, and ownership boundaries
- The main "actors" (components, services, modules) and their responsibilities
- The primary user journey (what happens when someone uses the app end-to-end)
- The exact entry action and source file that will anchor the course opening
- Key APIs, data flows, and communication patterns
- Clever engineering patterns (caching, lazy loading, error handling, etc.)
- The test strategy, debugging entry points, logging/observability surfaces, and common failure modes
- The build, CI, release, and deployment path when repository evidence exists
- Real bugs, hazards, or gotchas visible in documentation, configuration, history, or comments
- The tech stack and why each piece was chosen
- A small, low-risk first contribution grounded in the repository's current structure
- Three concrete capabilities for the final recap and one repository-specific first-contribution prompt

Treat every onboarding claim as **verified**, **inferred**, or **undocumented**. Verify commands against manifests, task runners, CI files, and documentation. Run safe setup or validation commands when practical. If a command cannot be tested, label it as unverified instead of presenting it as guaranteed. Never invent a missing workflow.

**Figure out what the app does yourself** by reading the README, the main entry points, and the UI code. Don't ask the user to explain the product — they may not be familiar with it either. The course should open by explaining what the app does in plain language (a brief "here's what this thing does and why it's interesting") before diving into how it works. The first module should start with a concrete user action — "imagine you paste a YouTube URL and click Analyze — here's what happens under the hood."

### Phase 2: Curriculum Design

Structure the course as **4-6 modules**. Most onboarding courses need 4-6. Only go to 7-8 if the codebase genuinely has that many distinct operational concepts. Fewer, better modules beat more, thinner ones.

The arc always starts from what the learner already knows (the user-facing behavior) and moves toward what they don't (the code underneath). Think of it as zooming in: start wide with the experience, then progressively peel back layers.

| Module Position | Purpose | Developer outcome |
|---|---|---|
| 1 | Product and first trace | Explain what the system does and follow one real action to its source entry point. |
| 2 | Get it running | Understand prerequisites, configuration, local services, and verified development commands. |
| 3 | System map and boundaries | Know which applications, packages, services, and external systems own each responsibility. |
| 4 | One feature end to end | Trace data, control flow, persistence, and failure handling across boundaries. |
| 5 | Change, test, and debug | Locate the right extension point, select relevant tests, and start diagnosis from observable evidence. |
| 6 | First contribution and delivery | Make a low-risk change and understand how it reaches CI, review, and deployment. |

This is a **menu, not a checklist**. Pick the modules that serve the codebase — a simple CLI tool needs 4, not 7. Adapt the arc to the codebase's complexity.

**The key principle:** Every module should move the developer closer to a confident contribution. If a module does not help them run, locate, trace, change, test, debug, or deliver something, cut it or reframe it.

**Every completed course must provide these onboarding anchors:**
- A copyable setup/run path sourced from repository evidence, with unverified steps labeled
- A visual system map showing boundaries and external dependencies
- One end-to-end trace tied to exact files and code excerpts
- A change/test/debug loop that names the relevant commands and evidence surfaces
- A first-contribution recommendation with scope, likely files, validation steps, and risks

**Each module should contain:**
- 3-6 screens (sub-sections that flow within the module)
- At least one code-with-English translation
- At least one interactive element (quiz, visualization, or animation)
- One or two "aha!" callout boxes with universal CS insights
- A metaphor that grounds the technical concept in everyday life — but NEVER reuse the same metaphor across modules, and NEVER default to the "restaurant" metaphor (it's overused). Pick metaphors that organically fit the specific concept. The best metaphors feel *inevitable* for the concept, not forced.

**Mandatory interactive elements (every course must include ALL of these):**
- **Group Chat Animation** — at least one across the course. These are the iMessage/WeChat-style conversations between components. They're one of the most engaging elements and must always appear, even if you have to creatively frame a module's concept as a conversation between actors.
- **Message Flow / Data Flow Animation** — at least one across the course. The step-by-step packet animation between actors. If the codebase has any kind of request/response, data pipeline, or multi-step process, animate it. Every codebase has data flowing somewhere — find it.
- **Code ↔ English Translation Blocks** — at least one per module (already required above, but reiterating: this is non-negotiable).
- **Quizzes** — at least one per module (multiple-choice, scenario, drag-and-drop, or spot-the-bug — any quiz type counts).
- **Glossary Tooltips** — on every repository-specific, domain-specific, or potentially unfamiliar term at first use per module. Calibrate common programming terms to the learner's stated level.

These five element types are the backbone of every course. Other interactive elements (architecture diagrams, layer toggles, pattern cards, etc.) are optional and should be added when they fit. But the five above must ALWAYS be present — no exceptions.

**Do NOT present the curriculum for approval — just build it.** The user wants a course, not a planning document. Design the curriculum internally, then go straight to building. If they want changes, they'll tell you after seeing the result.

**After designing the curriculum, decide which build path to use:**

- **Simple codebase** (single-purpose CLI, small web app, library, one clear entry point, 5 or fewer modules) → go directly to Phase 3 Sequential.
- **Complex codebase** (full-stack app, multiple services, content-heavy site, monorepo, or 6+ modules) → go to Phase 2.5 first, then Phase 3 Parallel.

### Phase 2.5: Module Briefs (complex codebases only)

For complex codebases, write a brief for each module before writing any HTML. This is the critical step that enables parallel writing — each brief gives an agent everything it needs without re-reading the codebase.

Read `references/module-brief-template.md` for the template structure. Read `references/content-philosophy.md` for the content rules that should guide brief writing.

**For each module, write a brief to `course-name/briefs/0N-slug.md` containing:**
- Teaching arc (metaphor, opening hook, key insight)
- Pre-extracted code snippets (copy-pasted from the codebase with file paths and line numbers)
- Interactive elements checklist with enough detail to build them
- Which sections of which reference files the writing agent needs
- What the previous and next modules cover (for transitions)

The code snippets are the critical token-saving step. By pre-extracting them into the brief, writing agents never need to read the codebase at all.

### Phase 3: Build the Course

The course output is a **directory**, not a single file. All CSS and JS are pre-built reference files — never regenerate them. Your job is to write only the HTML content.

**Output structure:**
```
course-name/
  styles.css       ← copied verbatim from references/styles.css
  main.js          ← copied verbatim from references/main.js
  _base.html       ← customized opening, navigation, identity, and accent
  _footer.html     ← customized recap, takeaways, and next AI prompt
  build.sh         ← copied verbatim from references/build.sh
  briefs/          ← module briefs (complex codebases only, can delete after build)
  modules/
    01-intro.html
    02-actors.html
    ...
  index.html       ← assembled by build.sh (do not write manually)
```

**Step 1 (both paths): Setup** — Create the course directory. Copy these three files verbatim using Read + Write (do not regenerate their contents):
- `references/styles.css` → `course-name/styles.css`
- `references/main.js` → `course-name/main.js`
- `references/build.sh` → `course-name/build.sh`

**Step 2 (both paths): Customize the course shell** — Read `references/_base.html` and `references/_footer.html`, then write both into the course directory with every placeholder replaced:
- `COURSE_TITLE` and `PROJECT_NAME` → specific, concise names grounded in the source repository
- `COURSE_PROMISE` → one factual sentence naming what the learner will understand or be able to do
- `ENTRY_ACTION` and `ENTRY_FILE` → a real user action and the exact source path where its code trail begins
- The four `ACCENT_*` placeholders → one complete palette from `_base.html`; do not mix palettes
- `NAV_DOTS` → one `<button class="nav-dot" type="button" data-target="module-N" data-tooltip="FULL_MODULE_TITLE" aria-label="Module N: FULL_MODULE_TITLE"></button>` per module
- `COMPLETION_SUMMARY` → a factual recap of the architecture and development workflow the learner just traced
- `TAKEAWAY_1`, `TAKEAWAY_2`, and `TAKEAWAY_3` → concrete developer capabilities, written as actions the learner can now perform
- `NEXT_PROMPT` → a scoped first-contribution prompt tied to this repository, including likely files and validation expectations

The opening action/path and the closing prompt are mandatory codebase fingerprints, not decorative copy. They must change for every source repository.

**Step 3: Write modules** — This is where the paths diverge.

#### Sequential path (simple codebases)

Read `references/content-philosophy.md` and `references/gotchas.md`. Then write modules one at a time. For each module, write `course-name/modules/0N-slug.html` containing only the `<section class="module" id="module-N">` block and its contents. Do not include `<html>`, `<head>`, `<body>`, `<style>`, or `<script>` tags.

Read `references/interactive-elements.md` for HTML patterns for each interactive element type. Read `references/design-system.md` for visual conventions.

#### Parallel path (complex codebases)

Dispatch modules to subagents in batches of up to 3. Each agent receives:
- Its module brief (from `course-name/briefs/`)
- `references/content-philosophy.md` and `references/gotchas.md`
- Only the sections of `references/interactive-elements.md` and `references/design-system.md` listed in the brief

Each agent writes its module file(s) to `course-name/modules/`. Short modules (3 screens, one quiz) can be paired — two briefs given to one agent.

**What agents do NOT receive:** the full codebase (snippets are in the brief), SKILL.md, other modules' briefs, or unneeded reference file sections.

After all agents finish, do a quick consistency check in the main context: nav dots match modules, transitions between modules are coherent, no obvious tone shifts.

**Step 4 (both paths): Assemble** — Run `build.sh` from the course directory:
```bash
cd course-name && bash build.sh
```
This produces `index.html`. Open it in the browser.

**Critical rules:**
- **Never regenerate** `styles.css` or `main.js` — always copy from references
- Module files contain only `<section>` content — no boilerplate
- Use CSS `scroll-snap-type: y proximity` (NOT `mandatory`)
- Use `min-height: 100vh` followed by `min-height: 100dvh` on `.module`
- Interactive element JS is in `main.js`; wire up via `data-*` attributes and CSS class names as shown in `references/interactive-elements.md`
- Chat containers need `id` attributes; flow animations need `data-steps='[...]'` JSON on `.flow-animation`

### Phase 4: Review and Open

After running `build.sh`, open `index.html` in the browser. Tell the user the exact output path, summarize the verified setup command, key trace, and recommended first contribution, then ask for feedback on accuracy, usefulness, design, and interactivity.

Review the complete path at desktop and mobile widths. Use keyboard-only navigation for every quiz, tooltip, diagram, layer switcher, bug challenge, and matching exercise. Confirm that Contents names every module, Play all can pause, malformed widget data shows a readable fallback, saved progress can be resumed or cleared, and the final recap contains no unresolved placeholders.

---

## Design Identity

The visual design should feel like a **beautiful developer notebook** — warm, inviting, and distinctive. Read `references/design-system.md` for the full token system, but here are the non-negotiable principles:

- **Warm palette**: Off-white backgrounds (like aged paper), warm grays, NO cold whites or blues
- **Bold accent**: One confident accent color (vermillion, coral, teal — NOT purple gradients)
- **Distinctive typography**: Display font with personality for headings (Bricolage Grotesque, or similar bold geometric face — NEVER Inter, Roboto, Arial, or Space Grotesk). Clean sans-serif for body (DM Sans or similar). JetBrains Mono for code.
- **Generous whitespace**: Modules breathe. Max 3-4 short paragraphs per screen.
- **Alternating backgrounds**: Even/odd modules alternate between two warm background tones for visual rhythm
- **Dark code blocks**: IDE-style with Catppuccin-inspired syntax highlighting on deep indigo-charcoal (#1E1E2E)
- **Depth without harshness**: Subtle warm shadows, never black drop shadows

---

## Reference Files

The `references/` directory contains detailed specs. **Read them only when you reach the relevant phase** — not upfront. This keeps context lean.

- **`references/content-philosophy.md`** — Visual density rules, metaphor guidelines, quiz design, tooltip rules, code translation guidance. Read during Phase 2.5 (briefs) and Phase 3 (writing modules).
- **`references/gotchas.md`** — Common failure points checklist. Read during Phase 3 and Phase 4 (review).
- **`references/module-brief-template.md`** — Template for Phase 2.5 module briefs. Read only for complex codebases using the parallel path.
- **`references/design-system.md`** — Complete CSS custom properties, color palette, typography scale, spacing system, shadows, animations, scrollbar styling. Read during Phase 3 when writing module HTML.
- **`references/interactive-elements.md`** — Implementation patterns for every interactive element: drag-and-drop quizzes, multiple-choice quizzes, code↔English translations, group chat animations, message flow visualizations, architecture diagrams, pattern cards, callout boxes. Read the relevant sections during Phase 3.
