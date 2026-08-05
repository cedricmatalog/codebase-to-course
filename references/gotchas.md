# Gotchas — Common Failure Points

> **When to read this:** During Phase 3 (writing module HTML) and Phase 4 (review). Check every one of these before considering a course complete.

These are real problems encountered when building courses. Check every one before considering a course complete.

### Tooltip Clipping
Translation blocks use `overflow: hidden` for code wrapping. If tooltips use `position: absolute` inside the term element, they get clipped by the container. **Fix:** Tooltips must use `position: fixed` and be appended to `document.body`. Calculate position from `getBoundingClientRect()`. This is already handled by `main.js` but is the #1 bug that appears in every build.

### Not Enough Tooltips
The most common failure is leaving repository vocabulary unexplained. Always tooltip internal names, domain terms, acronyms, and non-obvious framework concepts. Calibrate general programming terms such as JSON, CLI, module, PR, and E2E to the learner's stated experience; excessive definitions slow experienced developers down.

### Invented Onboarding Commands
Do not turn a plausible package-manager command into a claimed setup step. Trace every install, run, test, lint, build, and deploy command to a README, manifest, task runner, or CI file. Run safe commands when practical. Clearly mark commands that were found but not executed, and call missing workflows undocumented.

### Missing First Contribution
A course that ends with only a conceptual recap does not complete onboarding. Recommend one low-risk change grounded in current repository evidence. Name its likely files, validation commands, dependencies, and risks without pretending the work has already been approved by a maintainer.

### Walls of Text
The course looks like a textbook instead of an infographic. This happens when you write more than 2-3 sentences in a row without a visual break. Every screen must be at least 50% visual. Convert any list of 3+ items into cards, any sequence into step cards or flow diagrams, any code explanation into a code↔English translation block.

### Recycled Metaphors
Using "restaurant" or "kitchen" for everything. Every module needs its own metaphor that feels inevitable for that specific concept. If you catch yourself reaching for the same metaphor twice, stop and find one that fits the concept organically.

### Code Modifications
Trimming, simplifying, or "cleaning up" code snippets from the codebase. The learner should be able to open the real file and see the exact same code. Instead of editing code to be shorter, *choose* naturally short snippets (5-10 lines) from the codebase that illustrate the point.

### Quiz Questions That Test Memory
Asking "What does API stand for?" or "Which file handles X?" — those test recall, not understanding. Every quiz question should present a new scenario the learner hasn't seen and ask them to *apply* what they learned.

### Scroll-Snap Mandatory
Using `scroll-snap-type: y mandatory` traps users inside long modules. Always use `proximity`.

### Module Quality Degradation
Trying to write all modules in one pass causes later modules to be thin and rushed. Build one module at a time and verify each before moving on. For complex codebases, use the parallel path with module briefs.

### Missing Interactive Elements
A module with only text and code blocks, no interactivity. Every module needs at least one of: quiz, data flow animation, group chat, architecture diagram, drag-and-drop. Use interactions to teach a decision or trace, not as decoration.

### Anonymous Course Navigation
Dots alone communicate progress but not destination. Every nav dot must carry a complete title, and the generated shell's current-module label and searchable Contents panel must remain intact.

### Mouse-Only Learning
Do not replace the reference buttons with clickable `<div>` or `<span>` elements. Matching must work through select/place as well as drag, glossary terms must be focusable buttons, and every dynamic result needs readable text rather than color alone.

### Generic Openings and Flat Endings
The opening must name a real user action and exact source path from this repository. The completion section must summarize three genuine capabilities and provide a repository-specific next prompt. Unchanged generic shell copy is a failed course.

### Motion Without Control
Use the shared engine's pause behavior and reduced-motion support. Never add an unpausable autoplay loop or a separate animation implementation inside a module.
