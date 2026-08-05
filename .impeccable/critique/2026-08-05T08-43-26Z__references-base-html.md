---
target: project generated-course template
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-05T08-43-26Z
slug: references-base-html
---
Method: dual-agent (A: /root/critique_design · B: /root/critique_evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Scroll, module, chat, flow, and quiz status are visible, but dynamic changes are not announced and completion states often become inert without explanation. |
| 2 | Match System / Real World | 3 | Plain-English translations and practical scenarios fit novice learners; dot-only navigation still asks users to infer structure. |
| 3 | User Control and Freedom | 2 | Reset and module navigation exist, but Play All has no pause, motion cannot be reduced, and progress is not persisted. |
| 4 | Consistency and Standards | 2 | The visual system is cohesive, but controls alternate among buttons, clickable spans, draggable divs, and clickable diagram divs. |
| 5 | Error Prevention | 2 | Quizzes guard against empty submission, but drag targets can be overwritten and malformed flow JSON has no recovery. |
| 6 | Recognition Rather Than Recall | 2 | Main controls are visible, but five to eight unlabeled dots require a mental map and sequential widgets can hide earlier context. |
| 7 | Flexibility and Efficiency | 2 | Arrow-key module navigation helps, but there is no labeled contents view, search, resume, or reduced-motion path. |
| 8 | Aesthetic and Minimalist Design | 3 | Strong hierarchy and readable widths; repeated card grammar, flat long-page rhythm, and empty initial widget states weaken the composition. |
| 9 | Error Recovery | 2 | Quizzes explain and reset; other widgets largely offer only reset, malformed flow data fails silently, and status is not announced. |
| 10 | Help and Documentation | 3 | Glossary help is excellent in concept, but its unfocusable trigger excludes keyboard users. |
| **Total** | | **24/40** | **Acceptable — significant improvements needed** |

## Design Specificity Verdict

**LLM assessment:** Recognizably authored for developer education, but not yet specific to an individual codebase. The warm notebook palette, Bricolage/DM Sans/JetBrains Mono stack, code-to-English split view, actor chat, and message-flow interactions coherently serve “vibe coders.” Yet the durable shell customizes only title, accent, and nav dots. Rounded cards, emoji tiles, numbered modules, and generic diagrams could support almost any technical course. The learner’s repository should be the visual protagonist, but the template has no required repo-specific artifact, architecture silhouette, file-path motif, or opening trace.

The visual system also promises alternating module backgrounds without implementing a module-alternation rule. Accent customization is incomplete: the body wash and flow glow retain hard-coded vermillion values, so teal or forest courses still inherit red atmosphere.

**Deterministic scan:** The CLI detector returned 0 findings for `references/_base.html`. That result is narrow: it scanned the placeholder markup shell, not CSS-only files or a generated lesson. In rendered desktop and mobile fixtures, the browser detector created 13 visible overlay elements. Only one individual rule was exposed—`cream / beige palette` on `rgb(250, 247, 242)`. That is an intentional “aged paper” reading surface and is treated as a context-dependent false positive, not a priority defect. The other twelve rules were not individually emitted, so they are not inferred or invented here.

The browser evidence did independently support the mobile concern: a 390px viewport contained a 424px nav/nav-inner extent, though clipping prevented page-wide horizontal overflow. The unanchored review also directly observed the fixed header overlapping the mobile module number.

**Visual overlays:** Injection succeeded and the detector ran in both headless browser sessions; each had 13 visible overlay elements. Those sessions were closed after capture, so no persistent user-visible `[Human]` tab or overlay remains.

## Overall Impression

This is a thoughtful learning product wearing a reusable course template. Its strongest moment—the side-by-side translation from real code to plain English—makes the value proposition instantly tangible. The biggest opportunity is to make the shell as instructive and inclusive as its content: labeled location, native interaction semantics, mobile-safe navigation, and an opening/ending authored around the learner’s actual repository.

**Cognitive load: moderate (2 of 8 checklist failures).** Grouping, hierarchy, single focus, and progressive disclosure are strong. Minimal choices fails when five to eight anonymous dots appear together; working memory fails because their destinations are not persistently labeled and some sequential widgets conceal prior steps.

**Emotional journey:** The opening feels warm and credible; code-to-English creates the first confidence peak. Empty chat panels create an “is this broken?” valley. Quizzes and data-flow steps restore agency, but the shell has no guaranteed completion ritual, recap, saved progress, or next action, leaving the ending emotionally flat.

## What's Working

1. **Code ↔ English is a signature interaction.** The dark-code/warm-explanation split makes the product promise immediately legible and converts abstraction into recognition.
2. **The reading system is calm and coherent.** An 800px reading width, generous spacing, warm neutrals, and restrained shadows make code feel approachable without falling into generic AI-dashboard styling.
3. **Interactions test applied understanding.** Scenario quizzes, message flows, architecture inspection, and bug challenges match the learner’s real goal: steering and debugging with AI, not memorizing definitions.

## Priority Issues

### P1 — Core learning interactions exclude keyboard and screen-reader users

**Why it matters:** Glossary terms are clickable spans; drag chips/zones and architecture components are non-focusable divs; quiz/chat/flow changes lack live-region semantics. The most valuable help and practice features are unavailable or ambiguous to keyboard and assistive-technology users.

**Fix:** Use native buttons or links for every control; provide a select/place alternative for drag-and-drop; add `aria-live` or status roles; implement `:focus-visible` and `prefers-reduced-motion`; expose disclosure and selected states explicitly.

**Suggested command:** `$impeccable audit`

### P1 — Mobile chrome collides with content and uses undersized targets

**Why it matters:** At 390×844, the fixed nav overlaps the module number. The mobile `.module` padding shorthand erases the top offset reserved for the nav, while the 10×10px dots are far below a reliable touch target and depend on hover for labels.

**Fix:** Preserve a nav-aware mobile top offset or use scroll padding/margins; give dots at least a 44×44 hit area while keeping the visual mark small; verify direct-link and anchored module entry states.

**Suggested command:** `$impeccable adapt`

### P2 — Navigation shows progress but not usable location

**Why it matters:** Five to eight anonymous dots force learners to remember module order. `role="tablist"` is used without managed `aria-selected`, roving focus, or associated tabpanels. The control is neither a fully usable tab system nor a legible table of contents.

**Fix:** Add persistent “Module 2 of 5 · Meet the actors” context and a compact titled contents view; use `aria-current` for navigation or implement complete tab semantics; retain the progress bar as secondary status.

**Suggested command:** `$impeccable clarify`

### P2 — The visual world stops at “developer course template”

**Why it matters:** The learner’s own codebase is the emotional hook, but it does not shape the opening composition or module rhythm. Repeated white cards and emoji-led tiles make four to eight modules feel assembled rather than authored.

**Fix:** Require one repo-specific opening artifact—an annotated product screenshot, a real request trace, an architecture silhouette, or a recognizable file path. Derive module motifs from real actors, implement alternating surfaces, and replace hard-coded vermillion effects with accent variables.

**Suggested command:** `$impeccable bolder`

### P2 — Interaction pacing, failure handling, and closure are fragile

**Why it matters:** Empty chat canvases look unfinished; Play All cannot pause and can be retriggered; completed flows remain actionable; unguarded `JSON.parse` can silently kill a widget; the shell has no designed finish. Generated content makes malformed data and edge states routine.

**Fix:** Seed widgets with an explanatory initial state; make play/pause mutually exclusive; disable/relabel completed controls; parse data defensively with readable fallbacks; preserve content if JS fails; finish with a recap, architecture takeaway, and next prompt for the learner’s AI agent.

**Suggested command:** `$impeccable harden`

## Persona Red Flags

**Jordan — Confused First-Timer:** Five anonymous dots hide module names; an empty chat offers three unexplained controls; any missed glossary annotation turns `main.js`, DOM, or “service” into a jargon barrier; the shell guarantees no “you finished—here is what to do next” reassurance.

**Sam — Accessibility-Dependent User:** Glossary spans, drag-and-drop divs, and clickable architecture divs are not keyboard-complete; tab semantics are incomplete; dynamic feedback is not announced; motion has no reduced-motion path; some drag success/error meaning is color-dependent.

**Casey — Distracted Mobile User:** Fixed chrome overlaps the first module; 10px dots are hard to tap and impossible to decode without hover; drag-and-drop demands precise touch; interrupted learners cannot resume; no thumb-zone contents control exists.

## Minor Observations

- The README says the result works offline, while the branded type system depends on Google Fonts; content has fallbacks, but the promised look does not fully work offline.
- `min-height: 100dvh` is followed by `min-height: 100vh`, defeating the dynamic viewport value on supporting browsers.
- Global code wrapping hides horizontal overflow and can distort the exact code structure learners are meant to recognize in their repository.
- Emoji icons vary by platform and may be announced unexpectedly unless decorative instances are hidden.
- `.animate-in` begins invisible, so script failure can hide lesson content rather than degrade gracefully.
- The progress bar communicates direction but not scope; there is no visible percentage, module count, or time estimate.

## Questions to Consider

- Should the first three seconds communicate the reusable Codebase-to-Course brand, or make the learner feel “this is unmistakably my project”?
- Is the dot rail navigation or decoration? If it is navigation, why hide every destination name?
- What is the designed peak: tracing one real request, getting a quiz right, or seeing the entire architecture click into place?
- What should a learner leave with: a completion state, a personal architecture map, or a precise prompt for their AI agent?
- If a learner cannot drag, hover, or perceive motion, is the current course still the same course?
