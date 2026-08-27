# Design System Reference

Reference for the canonical system in `references/styles.css`. Copy `styles.css` verbatim into every course; use this document to understand the available tokens and patterns. Only the four accent variables are overridden in `_base.html`.

The CSS in this document is a description of what the copied stylesheet already provides, not code to author. Module files contain no `<style>` block and no `<script>`; the builder rejects both.

## Table of Contents
1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Shadows & Depth](#shadows--depth)
5. [Animations & Transitions](#animations--transitions)
6. [Navigation & Progress](#navigation--progress)
7. [Module Structure](#module-structure)
8. [Responsive Breakpoints](#responsive-breakpoints)
9. [Scrollbar & Background](#scrollbar--background)

---

## Color Palette

```css
:root {
  /* --- BACKGROUNDS --- */
  --color-bg:             #FAF7F2;       /* warm off-white, like aged paper */
  --color-bg-warm:        #F5F0E8;       /* slightly warmer for alternating modules */
  --color-bg-code:        #1E1E2E;       /* deep indigo-charcoal for code blocks */
  --color-text:           #2C2A28;       /* dark charcoal, easy on eyes */
  --color-text-secondary: #4D4945;       /* strong warm gray for secondary text */
  --color-text-muted:     #625D58;       /* AA-safe muted text */
  --color-border:         #E5DFD6;       /* subtle warm border */
  --color-border-light:   #EEEBE5;       /* even lighter border */
  --color-surface:        #FFFFFF;       /* card surfaces */
  --color-surface-warm:   #FDF9F3;       /* warm card surface */

  /* --- ACCENT (adapt per project — pick ONE bold color) ---
     Default: vermillion. Choose a complete AA-safe palette from _base.html. */
  --color-accent:         #B7442B;
  --color-accent-hover:   #91351F;
  --color-accent-light:   #FDEEE9;
  --color-accent-muted:   #C96C57;
  --color-on-accent:      #FFFFFF;

  /* --- SEMANTIC --- */
  --color-success:        #216B40;
  --color-success-light:  #E8F5EE;
  --color-error:          #A52D2D;
  --color-error-light:    #FDE8E8;
  --color-info:           #1F6079;
  --color-info-light:     #E4F2F7;

  /* --- ACTOR COLORS (assign to main components) ---
     Each major "character" in the codebase gets a distinct color
     for chat bubbles, diagrams, and highlights */
  --color-actor-1:        #B7442B;       /* vermillion */
  --color-actor-2:        #216A84;       /* teal */
  --color-actor-3:        #66558F;       /* muted plum */
  --color-actor-4:        #806116;       /* dark gold */
  --color-actor-5:        #267247;       /* forest */
}
```

**Rules:**
- Odd-numbered modules use `--color-bg`, even-numbered modules use `--color-bg-warm`; `styles.css` applies this automatically
- Actor colors should be visually distinct from each other and from the accent
- Code blocks always use `--color-bg-code` with light text

---

## Typography

```css
:root {
  /* --- OFFLINE FONT STACKS --- */
  --font-display: ui-rounded, 'Arial Rounded MT Bold', Georgia, serif;
  --font-body: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: ui-monospace, 'SFMono-Regular', Consolas, monospace;

  /* --- TYPE SCALE (1.25 ratio) --- */
  --text-xs:   0.875rem;   /* 14px — labels, badges */
  --text-sm:   1rem;       /* 16px — secondary text, code */
  --text-base: 1rem;       /* 16px — body text */
  --text-lg:   1.125rem;   /* 18px — lead paragraphs */
  --text-xl:   1.25rem;    /* 20px — screen headings */
  --text-2xl:  1.5rem;     /* 24px — sub-module titles */
  --text-3xl:  1.875rem;   /* 30px — module subtitles */
  --text-4xl:  2.25rem;    /* 36px — module titles */
  --text-5xl:  3rem;       /* 48px — hero text */
  --text-6xl:  3.75rem;    /* 60px — module numbers */

  /* --- LINE HEIGHTS --- */
  --leading-tight:  1.15;  /* headings */
  --leading-snug:   1.3;   /* subheadings */
  --leading-normal: 1.6;   /* body text */
  --leading-loose:  1.8;   /* relaxed reading */
}
```

Do not add web-font links. The system stacks keep the course portable, private, and usable from `file://` without a network connection.

**Rules:**
- Module numbers: `--text-6xl`, font-display, weight 800, `--color-accent` with 15% opacity
- Module titles: `--text-4xl`, font-display, weight 700
- Screen headings: `--text-xl` or `--text-2xl`, font-display, weight 600
- Body text: `--text-base` or `--text-lg`, font-body, `--leading-normal`
- Code: `--text-sm`, font-mono
- Labels/badges: `--text-xs`, font-mono, uppercase, letter-spacing 0.05em

---

## Spacing & Layout

```css
:root {
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */

  --content-width:     960px;   /* immersive exercise width; prose keeps its own measure */
  --content-width-wide: 1000px; /* for side-by-side layouts */
  --nav-height:        64px;
  --radius-sm:  8px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-full: 9999px;
}
```

**Module layout:**
```css
.module {
  min-height: 100vh;        /* fallback first */
  min-height: 100dvh;
  scroll-snap-align: start;
  padding: var(--space-16) var(--space-6);
  padding-top: calc(var(--nav-height) + var(--space-12));
}
.module-content {
  max-width: var(--content-width);
  margin: 0 auto;
}
```

---

## Shadows & Depth

```css
:root {
  --shadow-sm:  0 1px 2px rgba(44, 42, 40, 0.05);
  --shadow-md:  0 4px 12px rgba(44, 42, 40, 0.08);
  --shadow-lg:  0 8px 24px rgba(44, 42, 40, 0.1);
  --shadow-xl:  0 16px 48px rgba(44, 42, 40, 0.12);
}
```

Use warm-tinted RGBA (44, 42, 40) — never pure black shadows.

---

## Animations & Transitions

```css
:root {
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast:   150ms;
  --duration-normal: 300ms;
  --duration-slow:   500ms;
  --stagger-delay:   120ms;
}
```

**Scroll-triggered reveal pattern:**
```css
.animate-in { opacity: 1; transform: none; } /* readable if JS is unavailable */
.motion-ready .animate-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--duration-slow) var(--ease-out),
              transform var(--duration-slow) var(--ease-out);
}
.motion-ready .animate-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
.stagger-children > .animate-in {
  transition-delay: calc(var(--stagger-index, 0) * var(--stagger-delay));
}
```

**JavaScript:** none to write. `main.js` adds `.motion-ready` only when it can initialize reveal behavior, sets `--stagger-index` on every `.stagger-children` child, and runs the IntersectionObserver that adds `.visible`. It also honors `prefers-reduced-motion`, removes animation delays, and keeps every element visible. Never add a separate unpausable animation loop inside module HTML.

---

## Navigation & Progress

**HTML structure:**
```html
<nav class="nav">
  <div class="progress-bar" role="progressbar" aria-label="Course progress" aria-valuenow="0"></div>
  <div class="nav-inner">
    <a class="nav-title" href="#course-overview">Project Name</a>
    <p class="nav-status" aria-live="polite">Module 1 of 5 · Module name</p>
    <div class="nav-dots" aria-label="Course modules" hidden>
      <button class="nav-dot" type="button" data-target="module-1"
              data-tooltip="Module 1" aria-label="Module 1"></button>
      <!-- one per module -->
    </div>
    <!-- searchable Contents and Help controls are supplied by _base.html -->
  </div>
</nav>
```

**Progress:** `main.js` owns the progress bar, the persistent `.nav-status` text, saved progress, and the Contents panel. A module never writes navigation or progress code.

**Nav behavior:**
- Module dots stay hidden in the shipped shell; the persistent status gives location without adding simultaneous choices
- Direct module navigation lives in the searchable **Contents** panel, while J/K and arrow shortcuts accelerate linear reading
- Hidden dots retain the module metadata used by the shared engine; current location is written in the persistent `.nav-status`
- The searchable Contents panel exposes every module title without requiring hover or memory
- Saved progress offers Resume or Start from the beginning; Help documents keyboard shortcuts

**Keyboard navigation:** `main.js` ignores every interactive control before handling J/K, arrows, Home, End, and `?`. Never add a second global keyboard handler in a module.

---

## Module Structure

**HTML template for each module:**
```html
<section class="module" id="module-N">
  <div class="module-content">
    <header class="module-header animate-in">
      <span class="module-stage">Trace the request</span>
      <span class="module-number" aria-hidden="true">0N</span>
      <h2 class="module-title">Module Title</h2>
      <p class="module-subtitle" data-claim-id="C-001">One-line description of what this module teaches</p>
    </header>

    <div class="module-body">
      <section class="screen animate-in">
        <h3 class="screen-heading">Screen Title</h3>
        <p data-claim-id="C-002">One substantive claim, anchored to its evidence ledger entry...</p>
        <!-- Interactive elements, code translations, etc. -->
      </section>

      <section class="screen animate-in">
        <!-- Next screen -->
      </section>
    </div>
  </div>
</section>
```

---

## Responsive Breakpoints

```css
/* Tablet */
@media (max-width: 768px) {
  :root {
    --text-4xl: 1.875rem;
    --text-5xl: 2.25rem;
    --text-6xl: 3rem;
  }
  .translation-block { grid-template-columns: 1fr; } /* stack code/english */
  .pattern-cards { grid-template-columns: 1fr 1fr; }
}

/* Mobile */
@media (max-width: 480px) {
  :root {
    --text-4xl: 1.5rem;
    --text-5xl: 1.875rem;
    --text-6xl: 2.25rem;
  }
  .module {
    padding: var(--space-8) var(--space-4);
    padding-top: calc(var(--nav-height) + var(--space-8));
  }
  .pattern-cards { grid-template-columns: 1fr; }
  .flow-steps { flex-direction: column; }
  .flow-arrow { transform: rotate(90deg); }
}
```

---

## Scrollbar & Background

```css
/* Custom scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-full);
}

/* Subtle atmospheric background */
body {
  background: var(--color-bg);
  background-image: radial-gradient(
    ellipse at 20% 18%,
    color-mix(in srgb, var(--color-accent) 5%, transparent),
    transparent 42%
  );
}

/* Page scroll setup */
html {
  scroll-snap-type: y proximity;
  scroll-behavior: smooth;
}
```

---

## Code Block Globals

Code blocks preserve the exact indentation and token shape from the source repository. Choose naturally short excerpts; when a line is genuinely long, the code container may scroll horizontally without making the whole page overflow.

```css
code { overflow-wrap: anywhere; }
pre { max-width: 100%; overflow-x: auto; white-space: pre; }
.translation-code pre,
.translation-code code,
.bug-code code {
  white-space: pre;
  overflow-wrap: normal;
  word-break: normal;
}
```

Code snippets must be **exact copies** from the real codebase — never modified, trimmed, or simplified. Choose naturally short 5–10-line sections so preserved indentation remains readable at every breakpoint.

---

## Syntax Highlighting (Catppuccin-inspired)

For code blocks on the dark `--color-bg-code` background:

```css
.code-keyword  { color: #CBA6F7; }  /* purple — if, else, return, function */
.code-string   { color: #A6E3A1; }  /* green — "strings" */
.code-function { color: #89B4FA; }  /* blue — function names */
.code-comment  { color: #9399B2; }  /* AA-safe muted gray — // comments */
.code-number   { color: #FAB387; }  /* peach — numbers */
.code-property { color: #F9E2AF; }  /* yellow — object keys */
.code-operator { color: #94E2D5; }  /* teal — =, =>, +, etc. */
.code-tag      { color: #F38BA8; }  /* pink — HTML tags */
.code-attr     { color: #F9E2AF; }  /* yellow — HTML attributes */
.code-value    { color: #A6E3A1; }  /* green — attribute values */
```
