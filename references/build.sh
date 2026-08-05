#!/bin/bash
# Validates and assembles the course from parts.
# Run from the course directory: bash build.sh
set -euo pipefail

shopt -s nullglob
module_files=(modules/*.html)

if (( ${#module_files[@]} == 0 )); then
  echo "Build failed: modules/ contains no HTML module files." >&2
  exit 1
fi

placeholder_pattern='COURSE_TITLE|PROJECT_NAME|COURSE_PROMISE|ENTRY_ACTION|ENTRY_FILE|ACCENT_COLOR|ACCENT_HOVER|ACCENT_LIGHT|ACCENT_MUTED|NAV_DOTS|COMPLETION_SUMMARY|TAKEAWAY_[123]|NEXT_PROMPT'
if grep -En "$placeholder_pattern" _base.html _footer.html; then
  echo "Build failed: replace every course-shell placeholder listed above." >&2
  exit 1
fi

nav_count=$(grep -c '<button class="nav-dot"' _base.html || true)
if (( nav_count != ${#module_files[@]} )); then
  echo "Build failed: found $nav_count nav dots for ${#module_files[@]} module files." >&2
  exit 1
fi

cat _base.html "${module_files[@]}" _footer.html > index.html
echo "Built index.html with ${#module_files[@]} modules — open it in your browser."
