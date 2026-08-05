# Codebase to Course

Turn an unfamiliar repository into an interactive developer-onboarding course. New contributors get a practical mental model of the product, architecture, setup, key execution paths, testing and debugging workflow, and a sensible first contribution.

## Quick start

Install globally with the open agent-skills CLI:

```bash
npx skills add cedricmatalog/codebase-to-course -g
```

For a non-interactive install, choose your agent:

```bash
# Codex
npx skills add cedricmatalog/codebase-to-course -g -a codex -y

# Claude Code
npx skills add cedricmatalog/codebase-to-course -g -a claude-code -y
```

Then open your coding agent inside the repository you want to learn and paste:

```text
Use the codebase-to-course skill to create an interactive developer onboarding
course for this repository. Focus on setup, architecture, one key request flow,
testing and debugging, and a first safe contribution.
```

That is the complete setup. The generated course runs locally in a browser without a server.

## Other ways to start

```text
Turn this repository into a developer onboarding course.

Create an interactive architecture walkthrough for ./path/to/project.

Onboard me to https://github.com/owner/repository and show me where to make my first change.
```

## What developers learn

- How to install and run the project using commands found in the repository
- What the major components own and how they communicate
- How one real user action travels through the system
- Where external services, databases, queues, and APIs enter the flow
- How to test, debug, and validate a change
- Which small first contribution is safe and valuable

The course distinguishes verified facts from inferred behavior and links explanations to real files and code. It never invents undocumented setup commands or secret values.

## What gets generated

The result is a portable course directory:

```text
project-onboarding/
├── index.html      # Open this in a browser
├── styles.css
├── main.js
└── modules/       # Focused onboarding lessons
```

It includes scroll-based navigation, architecture and data-flow visualizations, real code with intent explanations, scenario-based exercises, glossary tooltips, progress saving, keyboard navigation, and responsive layouts.

## Installation options

The default install is project-local. Add `-g` to make the skill available in every repository:

```bash
# Install only in the current project
npx skills add cedricmatalog/codebase-to-course

# Preview what the repository exposes without installing
npx skills add cedricmatalog/codebase-to-course --list

# Update a global installation later
npx skills update codebase-to-course -g
```

The installer supports Codex, Claude Code, Cursor, OpenCode, and many other coding agents. Node.js is required only to run the installer; generated courses have no build or runtime dependency.

## Why this format works

Developer onboarding usually scatters knowledge across a README, source files, configuration, conversations, and unwritten conventions. This skill organizes that evidence around practical tasks: get the project running, trace a feature, locate the right ownership boundary, diagnose a failure, and make a first change.

Every course remains grounded in the source repository. Code excerpts are copied exactly, file paths are explicit, and uncertainty is labeled instead of guessed.

---

Originally created by [Zara Zhang](https://github.com/zarazhangrui/codebase-to-course). This fork adds a portable course runtime, accessibility and interaction improvements, validation tooling, and a developer-onboarding workflow.
