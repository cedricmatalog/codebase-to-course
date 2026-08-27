# Interactive Elements Reference

Implementation patterns for every interactive element type used in courses. Pick the elements that best serve each module's teaching goal.

> **Architecture and safety note:** All CSS and JavaScript for these elements already live in `references/styles.css` and `references/main.js`, which are copied verbatim into every course directory. **Write only the HTML patterns below.** The CSS blocks in this document describe what the shipped stylesheet already provides so you can predict the rendering — they are documentation, not code to copy; the builder rejects any module containing `<style>` or `<script>`. Repository-derived prose and source text belongs in escaped text nodes, including the hidden text nodes shown here. `data-*`, `id`, `class`, and ARIA attributes may contain only fixed author-created identifiers or generic template labels, plus the `data-claim-id` anchors defined in `evidence-contract.md`. No attribute value may contain a raw `<` or `>`. The builder rejects the legacy prose-bearing attributes.

## Table of Contents
1. [Code ↔ English Translation Blocks](#code--english-translation-blocks)
2. [Multiple-Choice Quizzes](#multiple-choice-quizzes)
3. [Drag-and-Drop Matching](#drag-and-drop-matching)
4. [Group Chat Animation](#group-chat-animation)
5. [Message Flow / Data Flow Animation](#message-flow--data-flow-animation)
6. [Interactive Architecture Diagram](#interactive-architecture-diagram)
7. [Layer Toggle Demo](#layer-toggle-demo)
8. ["Spot the Bug" Challenge](#spot-the-bug-challenge)
9. [Scenario Quiz](#scenario-quiz)
10. [Callout Boxes](#callout-boxes)
11. [Pattern/Feature Cards](#patternfeature-cards)
12. [Flow Diagrams](#flow-diagrams)
13. [Permission/Config Badges](#permissionconfig-badges)
14. [Glossary Tooltips](#glossary-tooltips)
15. [Visual File Tree](#visual-file-tree)
16. [Icon-Label Rows](#icon-label-rows)
17. [Numbered Step Cards](#numbered-step-cards)
18. [Instruction and Optional-Practice Wrappers](#instruction-and-optional-practice-wrappers)

---

## Code ↔ English Translation Blocks

The most important teaching element. Shows real code from the project on the left and a plain English translation on the right, line by line.

**HTML:**
```html
<div class="translation-block animate-in">
  <div class="translation-code">
    <span class="translation-label">CODE</span>
    <pre><code>
<span class="code-line"><span class="code-keyword">const</span> response = <span class="code-keyword">await</span> <span class="code-function">fetch</span>(url, {</span>
<span class="code-line">  <span class="code-property">method</span>: <span class="code-string">'POST'</span>,</span>
<span class="code-line">  <span class="code-property">headers</span>: { <span class="code-string">'Authorization'</span>: apiKey }</span>
<span class="code-line">});</span>
    </code></pre>
  </div>
  <div class="translation-english">
    <span class="translation-label">PLAIN ENGLISH</span>
    <div class="translation-lines">
      <p class="tl">Send a request to the URL and wait for a response...</p>
      <p class="tl">We're sending data (POST), not just asking for it (GET)...</p>
      <p class="tl">Include our API key so the server knows who we are...</p>
      <p class="tl">End of the request setup.</p>
    </div>
  </div>
</div>
```

**CSS:**
```css
.translation-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  margin: var(--space-8) 0;
}
.translation-code {
  background: var(--color-bg-code);
  color: #CDD6F4;
  padding: var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.7;
  position: relative;
  overflow-x: auto;  /* contain long lines without changing source indentation */
}
.translation-code pre,
.translation-code code {
  white-space: pre;
  word-break: normal;
  overflow-wrap: normal;
}
.translation-english {
  background: var(--color-surface-warm);
  padding: var(--space-6);
  font-size: var(--text-sm);
  line-height: 1.7;
  border-left: 1px solid var(--color-border);
}
.translation-label {
  position: absolute;
  top: var(--space-2);
  right: var(--space-3);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #A6ADC8;
}
.translation-english .translation-label {
  color: var(--color-text-muted);
}
/* Responsive: stack vertically on mobile */
@media (max-width: 768px) {
  .translation-block { grid-template-columns: 1fr; }
  .translation-english { border-left: none; border-top: 1px solid var(--color-border); }
}
```

**Rules:**
- Each English line should correspond to 1-2 code lines
- Use conversational language, not technical jargon
- Highlight the "why" not just the "what" — e.g., "Include our API key so the server knows who we are" not "Set the Authorization header"

---

## Multiple-Choice Quizzes

For testing understanding with instant feedback. Each question has options, one correct answer, and per-question explanations.

**Wiring:** `main.js` auto-initializes the options and the `.quiz-check-btn` / `.quiz-reset-btn` controls inside every uniquely identified `.quiz-container`. Put per-question explanations in hidden `.quiz-explanation-right` and `.quiz-explanation-wrong` text nodes.

**HTML:**
```html
<div class="quiz-container" id="quiz-module3">
  <div class="quiz-question-block" data-correct="option-b">
    <h3 class="quiz-question">Question text here?</h3>
    <div class="quiz-options">
      <button class="quiz-option" type="button" data-value="option-a">
        <span class="quiz-option-radio" aria-hidden="true"></span>
        <span>Answer A</span>
      </button>
      <button class="quiz-option" type="button" data-value="option-b">
        <span class="quiz-option-radio" aria-hidden="true"></span>
        <span>Answer B (correct)</span>
      </button>
      <button class="quiz-option" type="button" data-value="option-c">
        <span class="quiz-option-radio" aria-hidden="true"></span>
        <span>Answer C</span>
      </button>
    </div>
    <p class="quiz-explanation-right" hidden>Exactly—because X is responsible for Y in this architecture.</p>
    <p class="quiz-explanation-wrong" hidden>Not quite. Review where Y lives, then try again.</p>
    <div class="quiz-feedback"></div>
  </div>

  <button class="quiz-check-btn" type="button">Check answers</button>
  <button class="quiz-reset-btn" type="button">Try again</button>
</div>
```

**CSS for quiz states:**
```css
.quiz-option {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer; width: 100%;
  transition: border-color var(--duration-fast), background var(--duration-fast);
}
.quiz-option:hover { border-color: var(--color-accent-muted); }
.quiz-option.selected { border-color: var(--color-accent); background: var(--color-accent-light); }
.quiz-option.correct { border-color: var(--color-success); background: var(--color-success-light); }
.quiz-option.incorrect { border-color: var(--color-error); background: var(--color-error-light); }
.quiz-option-radio {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid var(--color-border);
  transition: border-color var(--duration-fast), background var(--duration-fast), box-shadow var(--duration-fast);
}
.quiz-option.selected .quiz-option-radio {
  border-color: var(--color-accent);
  background: var(--color-accent);
  box-shadow: inset 0 0 0 3px white;
}
.quiz-feedback {
  max-height: 0; overflow: hidden; opacity: 0;
  transition: max-height var(--duration-normal), opacity var(--duration-normal);
}
.quiz-feedback.show { max-height: 200px; opacity: 1; padding: var(--space-3); margin-top: var(--space-2); border-radius: var(--radius-sm); }
.quiz-feedback.success { background: var(--color-success-light); color: var(--color-success); }
.quiz-feedback.error { background: var(--color-error-light); color: var(--color-error); }
```

---

## Drag-and-Drop Matching

For matching concepts to descriptions. Supports mouse drag, tap-to-place, and keyboard select/place using the same controls.

**HTML:**
```html
<div class="dnd-container" id="dnd-module2">
  <div class="dnd-chips">
    <button class="dnd-chip" type="button" draggable="true" data-answer="actor-a">Actor A</button>
    <button class="dnd-chip" type="button" draggable="true" data-answer="actor-b">Actor B</button>
    <button class="dnd-chip" type="button" draggable="true" data-answer="actor-c">Actor C</button>
  </div>
  <div class="dnd-zones">
    <div class="dnd-zone" data-correct="actor-a">
      <p class="dnd-zone-label">Description for Actor A</p>
      <button class="dnd-zone-target" type="button">Place an item here</button>
    </div>
    <!-- more zones -->
  </div>
  <button class="btn btn-primary dnd-check-btn" type="button">Check matches</button>
  <button class="btn dnd-reset-btn" type="button">Reset</button>
  <p class="dnd-feedback" role="status" aria-live="polite">Select an item to begin.</p>
</div>
```

`main.js` owns all drag, selection, replacement, checking, and reset behavior. Do not add custom touch handlers; tap-to-place is the reliable mobile path.

---

## Group Chat Animation

iMessage/WeChat-style chat showing components "talking" to each other. Messages appear one by one with typing indicators.

**Wiring:** `main.js` auto-initializes every `.chat-window` on page load. Give each chat window a unique `id`. Control buttons need these classes: `.chat-next-btn`, `.chat-all-btn`, `.chat-reset-btn`. The typing indicator avatar element should have `id="{chatWindowId}-typing-avatar"` or simply be the first `.chat-avatar` inside `.chat-typing`.

**HTML:**
```html
<div class="chat-window" id="chat-module2">
  <div class="chat-messages">
    <div class="chat-message" data-msg="0" data-sender="actor-a">
      <div class="chat-avatar" style="background: var(--color-actor-1)">A</div>
      <div class="chat-bubble">
        <span class="chat-sender" style="color: var(--color-actor-1)">Actor A</span>
        <p>Hey Background, I need the data for this item.</p>
      </div>
    </div>
    <!-- more messages... -->
  </div>

  <div class="chat-typing" hidden>
    <div class="chat-avatar" id="chat-module2-typing-avatar">A</div>
    <div class="chat-typing-dots">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  </div>

  <div class="chat-controls">
    <button class="btn chat-next-btn" type="button">Next message</button>
    <button class="btn chat-all-btn" type="button" aria-pressed="false">Play all</button>
    <button class="btn chat-reset-btn" type="button">Replay</button>
    <span class="chat-progress"></span>
  </div>
</div>
```

**CSS for typing dots:**
```css
.typing-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--color-text-muted);
  animation: typingBounce 1.4s infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}
```

---

## Message Flow / Data Flow Animation

Step-by-step visualization of data moving between components. User clicks "Next Step" to advance.

**Wiring:** `main.js` auto-initializes every `.flow-animation` on page load and reads its steps from `.flow-step-data .flow-step` only, so the `<ol class="flow-step-data" hidden>` wrapper is required — the unrelated static [Flow Diagrams](#flow-diagrams) pattern reuses the `.flow-step` class name and would otherwise be picked up as walkthrough data. Each hidden `.flow-step` uses only fixed author-created actor IDs in `data-highlight`, `data-from`, and `data-to`; its human-readable description goes in a `.flow-step-text` text node. Actor element IDs must be fixed safe IDs such as `flow-m3-actor-1`. Control buttons need classes `.flow-next-btn` and `.flow-reset-btn`.

**HTML:**
```html
<div class="flow-animation">
  <ol class="flow-step-data" hidden>
    <li class="flow-step" data-highlight="flow-m3-actor-1">
      <span class="flow-step-text">The entry action reaches the first component.</span>
    </li>
    <li class="flow-step" data-highlight="flow-m3-actor-2" data-packet="true" data-from="m3-actor-1" data-to="m3-actor-2">
      <span class="flow-step-text">The first component delegates the request.</span>
    </li>
    <li class="flow-step" data-highlight="flow-m3-actor-3" data-packet="true" data-from="m3-actor-2" data-to="m3-actor-3">
      <span class="flow-step-text">The final component produces the documented result.</span>
    </li>
  </ol>
  <div class="flow-actors">
    <div class="flow-actor" id="flow-m3-actor-1">
      <div class="flow-actor-icon">A</div>
      <span>Actor 1</span>
    </div>
    <div class="flow-actor" id="flow-m3-actor-2">
      <div class="flow-actor-icon">B</div>
      <span>Actor 2</span>
    </div>
    <div class="flow-actor" id="flow-m3-actor-3">
      <div class="flow-actor-icon">C</div>
      <span>Actor 3</span>
    </div>
  </div>

  <div class="flow-packet" aria-hidden="true"></div>

  <div class="flow-step-label">Choose Next step to begin</div>

  <div class="flow-controls">
    <button class="btn flow-next-btn" type="button">Next step</button>
    <button class="btn flow-reset-btn" type="button">Restart</button>
    <span class="flow-progress"></span>
  </div>
</div>
```

**CSS for active actor glow:**
```css
.flow-actor.active {
  box-shadow: 0 0 0 3px var(--color-accent-light),
              0 8px 24px color-mix(in srgb, var(--color-accent) 20%, transparent);
  transform: scale(1.05);
  transition: transform var(--duration-normal) var(--ease-out);
}
```

---

## Interactive Architecture Diagram

Full-system diagram where hovering/clicking a component shows a description tooltip. This is the natural home for the internal dependency graph: one component per module, package, or workspace, with each description naming what it depends on and what depends on it.

**HTML:**
```html
<div class="arch-diagram">
  <div class="arch-zone arch-zone-browser">
    <h4 class="arch-zone-label">Browser</h4>
    <button class="arch-component" type="button">
      <span class="arch-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h6"/></svg>
      </span>
      <span>Component A</span>
      <span class="arch-component-description" hidden>Explain the component with evidence-backed text here.</span>
    </button>
    <!-- more components -->
  </div>
  <div class="arch-zone arch-zone-external">
    <h4 class="arch-zone-label">External Services</h4>
    <!-- API cards -->
  </div>
  <div class="arch-description">Choose a component to learn what it does.</div>
</div>
```

---

## Layer Toggle Demo

Shows how different layers (e.g., HTML/CSS/JS, or data/logic/UI) build on each other. Three tabs switch between views.

**HTML:**
```html
<div class="layer-demo">
  <div class="layer-tabs">
    <button class="layer-tab active" type="button" data-layer="html">HTML</button>
    <button class="layer-tab" type="button" data-layer="css">+ CSS</button>
    <button class="layer-tab" type="button" data-layer="js">+ JS</button>
  </div>
  <div class="layer-viewport">
    <div class="layer" id="layer-html">
      <!-- Raw unstyled version -->
    </div>
    <div class="layer" id="layer-css" hidden>
      <!-- Styled version -->
    </div>
    <div class="layer" id="layer-js" hidden>
      <!-- Interactive version -->
    </div>
  </div>
  <p class="layer-description" id="layer-desc">This is the raw HTML...</p>
</div>
```

---

## "Spot the Bug" Challenge

Show code with a deliberate bug. User clicks the buggy line. Reveal explains the issue.

**HTML:**
```html
<div class="bug-challenge">
  <h3>Find the bug in this code:</h3>
  <div class="bug-code">
    <button class="bug-line" type="button" data-line="1" data-correct="false">
      <span class="line-num">1</span>
      <code>chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {</code>
      <span class="bug-hint" hidden>Not this line—look for where asynchronous timing changes the response.</span>
    </button>
    <button class="bug-line" type="button" data-line="2" data-correct="false">
      <span class="line-num">2</span>
      <code>  if (msg.action === 'fetchData') {</code>
      <span class="bug-hint" hidden>This condition is valid. Look at the asynchronous work instead.</span>
    </button>
    <button class="bug-line bug-target" type="button" data-line="3" data-correct="true">
      <span class="line-num">3</span>
      <code>    fetch(url).then(r => r.json()).then(data => sendResponse(data));</code>
      <span class="bug-explanation" hidden>The asynchronous response needs the message channel to remain open. Add return true at the end of the listener.</span>
    </button>
    <button class="bug-line" type="button" data-line="4" data-correct="false">
      <span class="line-num">4</span>
      <code>  }</code>
      <span class="bug-hint" hidden>This brace only closes the condition. Look for the missing asynchronous return value.</span>
    </button>
    <button class="bug-line" type="button" data-line="5" data-correct="false">
      <span class="line-num">5</span>
      <code>});</code>
      <span class="bug-hint" hidden>This closes the listener. The missing behavior belongs immediately before it.</span>
    </button>
  </div>
  <div class="bug-feedback" id="bug-feedback"></div>
</div>
```

`main.js` reads the fixed `data-correct` identifier plus the hidden hint/explanation text nodes, then handles focus, disabling, feedback, and recovery automatically.

---

## Scenario Quiz

"What would a senior engineer do?" — situational questions with explanations.

Same HTML/CSS/JS pattern as Multiple-Choice Quizzes, but with longer scenario descriptions and more detailed explanations. Wrap each question in a scenario context block:

```html
<div class="scenario-block">
  <div class="scenario-context">
    <span class="scenario-label">Scenario</span>
    <p>Your app processes a 3-hour podcast transcript. The API has a 16,000 token limit. What do you do?</p>
  </div>
  <!-- quiz-options here -->
</div>
```

---

## Callout Boxes

"Aha!" moments — universal CS insights. Max 2 per module.

```html
<div class="callout callout-accent">
  <span class="callout-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M8.5 15.5A7 7 0 1 1 15.5 15.5c-.9.7-1.3 1.4-1.5 2.5h-4c-.2-1.1-.6-1.8-1.5-2.5Z"/></svg>
  </span>
  <div class="callout-content">
    <strong class="callout-title">Key Insight</strong>
    <p>This pattern — splitting responsibilities into focused roles — is one of the most important ideas in software engineering. Engineers call it "separation of concerns."</p>
  </div>
</div>
```

**Variants:**
- `callout-accent`: vermillion left border, light accent background (for CS insights)
- `callout-info`: teal left border, light info background (for "good to know")
- `callout-warning`: red left border, light error background (for common mistakes)

---

## Pattern/Feature Cards

Grid of cards highlighting engineering patterns, tech stack components, or key concepts.

```html
<div class="pattern-cards">
  <div class="pattern-card">
    <span class="pattern-icon" style="background: var(--color-actor-1)" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M20 7v5h-5M4 17v-5h5M6.2 9A7 7 0 0 1 18 7l2 5M18 15a7 7 0 0 1-12 2l-2-5"/></svg>
    </span>
    <h4 class="pattern-title">Caching</h4>
    <p class="pattern-desc">Store results to avoid redundant work — like keeping leftovers instead of cooking a new meal every time.</p>
  </div>
  <!-- more cards -->
</div>
```

```css
.pattern-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
}
.pattern-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal);
}
.pattern-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
```

---

## Flow Diagrams

A static, non-interactive sequence. It shares the `.flow-step` class name with the [Message Flow](#message-flow--data-flow-animation) walkthrough but is a different pattern with no wiring: use it inside `.flow-steps`, and never inside a `.flow-animation` container.

**Horizontal flow (desktop):**
```html
<div class="flow-steps">
  <div class="flow-step">
    <div class="flow-step-num">1</div>
    <p>User clicks button</p>
  </div>
  <div class="flow-arrow">→</div>
  <div class="flow-step">
    <div class="flow-step-num">2</div>
    <p>Component A detects click</p>
  </div>
  <div class="flow-arrow">→</div>
  <!-- more steps -->
</div>
```

Arrows rotate to `↓` on mobile via CSS transform.

---

## Permission/Config Badges

For annotating config files, permissions, or settings:

```html
<div class="badge-list">
  <div class="badge-item">
    <code class="badge-code">storage</code>
    <span class="badge-desc">Save data between sessions (like browser bookmarks)</span>
  </div>
  <div class="badge-item">
    <code class="badge-code">activeTab</code>
    <span class="badge-desc">Access the currently open tab (only when the user clicks)</span>
  </div>
</div>
```

```css
.badge-item {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  transition: border-color var(--duration-fast);
}
.badge-item:hover { border-color: var(--color-accent-muted); }
.badge-code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--color-bg-code);
  color: #CBA6F7;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  white-space: nowrap;
}
```

---

## Glossary Tooltips

The most important accessibility feature for non-technical learners. Any technical term in the course text should be wrapped in a tooltip that shows a plain-English definition on hover (desktop) or tap (mobile). The learner never has to leave the page or Google anything.

**HTML — mark up terms inline:**
```html
<p>The extension uses a
  <button class="term" type="button">service worker<span class="term-definition" hidden>A service worker is a background script that runs independently of the web page.</span></button>
  to handle API calls.
</p>
```

**CSS:**
```css
.term {
  display: inline;
  padding: 0;
  border: 0;
  border-bottom: 1.5px dashed var(--color-accent-muted);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;    /* NOT cursor: help — pointer feels clickable and inviting */
}
.term:hover, .term.active {
  border-bottom-color: var(--color-accent);
  color: var(--color-accent);
}

/* The tooltip bubble — uses position: fixed and is appended to document.body
   via JS so it is NEVER clipped by ancestor overflow: hidden containers
   (like translation blocks). See JS section below for positioning logic. */
.term-tooltip {
  position: fixed;        /* CRITICAL: fixed, not absolute — prevents clipping */
  background: var(--color-bg-code);
  color: #CDD6F4;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-family: var(--font-body);
  line-height: var(--leading-normal);
  width: max(200px, min(320px, 80vw));
  box-shadow: var(--shadow-lg);
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-fast);
  z-index: 10000;        /* Above everything, including nav */
}
/* Arrow pointing down */
.term-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--color-bg-code);
}
.term-tooltip.visible {
  opacity: 1;
}

/* If tooltip goes off-screen top, flip to below */
.term-tooltip.flip {
  bottom: auto;
  top: calc(100% + 8px);
}
.term-tooltip.flip::after {
  top: auto;
  bottom: 100%;
  border-top-color: transparent;
  border-bottom-color: var(--color-bg-code);
}
```

**JavaScript:** none to write. `main.js` creates each tooltip element from the hidden `.term-definition` text node, appends it to `document.body` so no ancestor can clip it, positions and flips it against the viewport, and wires hover, click, focus, Enter/Space, Escape, and outside-click dismissal. Do not add tooltip scripts to a module; the builder rejects them.

**Rules:**
- Mark up a term on its first meaningful use in a module, calibrated to the learner: repository vocabulary and domain terms always, general programming terms only when the learner assumptions warrant it (see “Tooltip overload” in `gotchas.md`)
- Keep definitions to 1-2 sentences max, in everyday language
- Use a metaphor in the definition when it helps — e.g., "A **callback** is like leaving your phone number at a restaurant so they can call you when your table is ready"
- Don't mark the same term twice within the same screen — only on first appearance per module
- The dashed underline should be subtle enough not to distract but visible enough that curious learners discover it

---

## Visual File Tree

Use instead of paragraphs listing "this folder does X, that folder does Y." Much easier to scan.

```html
<div class="file-tree">
  <div class="ft-folder open">
    <span class="ft-name">app/</span>
    <span class="ft-desc">Pages and API routes</span>
    <div class="ft-children">
      <div class="ft-folder">
        <span class="ft-name">api/</span>
        <span class="ft-desc">Backend endpoints the frontend calls</span>
      </div>
      <div class="ft-file">
        <span class="ft-name">layout.tsx</span>
        <span class="ft-desc">The shell that wraps every page</span>
      </div>
    </div>
  </div>
  <div class="ft-folder">
    <span class="ft-name">components/</span>
    <span class="ft-desc">Reusable UI building blocks</span>
  </div>
  <div class="ft-folder">
    <span class="ft-name">lib/</span>
    <span class="ft-desc">Shared logic and utilities</span>
  </div>
</div>
```

```css
.file-tree { font-family: var(--font-mono); font-size: var(--text-sm); }
.ft-folder, .ft-file {
  padding: var(--space-2) var(--space-3);
  border-left: 1px solid var(--color-border-light);
  margin-left: var(--space-4);
}
.ft-folder > .ft-name { color: var(--color-accent); font-weight: 600; }
.ft-folder > .ft-name::before,
.ft-file > .ft-name::before {
  content: ''; display: inline-block; width: 10px; height: 10px;
  margin-right: var(--space-2); vertical-align: 0;
}
.ft-folder > .ft-name::before {
  border-radius: 2px; background: currentColor;
  clip-path: polygon(0 18%, 36% 18%, 45% 0, 100% 0, 100% 100%, 0 100%);
}
.ft-file > .ft-name::before { border: 1px solid currentColor; border-radius: 1px; }
.ft-desc {
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  margin-left: var(--space-2);
  font-size: var(--text-xs);
}
.ft-children { margin-left: var(--space-4); }
```

---

## Icon-Label Rows

For listing components, features, or concepts visually. Replaces bullet-point paragraphs.

```html
<div class="icon-rows">
  <div class="icon-row">
    <div class="icon-circle" style="background: var(--color-actor-1)" aria-hidden="true">UI</div>
    <div>
      <strong>Frontend (Next.js)</strong>
      <p>What the user sees and interacts with</p>
    </div>
  </div>
  <div class="icon-row">
    <div class="icon-circle" style="background: var(--color-actor-2)" aria-hidden="true">API</div>
    <div>
      <strong>API Routes</strong>
      <p>Backend logic that runs on the server</p>
    </div>
  </div>
  <div class="icon-row">
    <div class="icon-circle" style="background: var(--color-actor-3)" aria-hidden="true">DB</div>
    <div>
      <strong>Database (Supabase)</strong>
      <p>Where all the data is stored permanently</p>
    </div>
  </div>
</div>
```

```css
.icon-rows { display: flex; flex-direction: column; gap: var(--space-4); }
.icon-row {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.icon-row p { margin: 0; color: var(--color-text-secondary); font-size: var(--text-sm); }
.icon-circle {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-on-accent); font-family: var(--font-mono);
  font-size: var(--text-xs); font-weight: 700; flex-shrink: 0;
}
```

---

## Numbered Step Cards

For sequences that would otherwise be a numbered paragraph list. Visual, scannable, and each step stands alone.

```html
<div class="step-cards">
  <div class="step-card">
    <div class="step-num">1</div>
    <div class="step-body">
      <strong>User pastes a YouTube URL</strong>
      <p>The frontend captures the URL and extracts the video ID</p>
    </div>
  </div>
  <div class="step-card">
    <div class="step-num">2</div>
    <div class="step-body">
      <strong>API fetches the transcript</strong>
      <p>A server-side route calls an external service to get the video's text</p>
    </div>
  </div>
  <div class="step-card">
    <div class="step-num">3</div>
    <div class="step-body">
      <strong>AI analyzes the content</strong>
      <p>The transcript is sent to an AI model that extracts key moments</p>
    </div>
  </div>
</div>
```

```css
.step-cards { display: flex; flex-direction: column; gap: var(--space-3); }
.step-card {
  display: flex; align-items: flex-start; gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}
.step-num {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--color-accent);
  color: white; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  flex-shrink: 0;
}
.step-body p { margin: var(--space-1) 0 0; color: var(--color-text-secondary); font-size: var(--text-sm); }
```

---

## Instruction and Optional-Practice Wrappers

Two wrappers apply to every interaction in this file regardless of type. Both are styled by `styles.css`; neither needs any JavaScript.

**Instruction line.** Every interaction opens with one sentence telling the learner exactly what to do with it. Without it, learners look at an exercise and do not know it is theirs to operate.

```html
<p class="activity-instruction"><strong>Do this next:</strong> advance the trace to keep every transformation visible in order.</p>
```

**Optional practice.** Supporting or secondary practice belongs in a native disclosure so the primary path stays short. The summary must name the outcome, not just say "Optional".

```html
<details class="practice-extra">
  <summary>Optional · Match each file to its job</summary>
  <p class="activity-instruction"><strong>Do this next:</strong> select each file, place it beside the job it owns, then check both matches.</p>
  <!-- one interaction from this file -->
</details>
```

**Rules:**
- One `activity-instruction` per interaction, immediately before it, phrased as an action
- `Optional · ` prefix on every `practice-extra` summary, followed by the outcome the learner gets
- A module's primary interaction is never hidden inside a disclosure
- `<details>` is native: it works without JavaScript, with a keyboard, and with a screen reader
