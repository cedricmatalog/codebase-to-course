/**
 * CODEBASE-TO-COURSE — COMPLETE JS ENGINE
 * Copy this file verbatim into the course output directory.
 * Never regenerate it. It handles navigation, saved progress,
 * accessibility, recovery, and every interactive course pattern.
 */
(function () {
  'use strict';

  /* ── HELPERS ──────────────────────────────────────────────── */
  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  function findById(id, context) {
    return $$('[id]', context).find(element => element.id === id) || null;
  }

  function motionIsReduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function scrollToElement(element) {
    if (!element) return;
    element.scrollIntoView({ behavior: motionIsReduced() ? 'auto' : 'smooth', block: 'start' });
  }

  function isTypingOrInteractive(target) {
    return Boolean(target && target.closest('input, textarea, select, button, a, summary, [contenteditable="true"], [role="button"], [role="tab"], [role="option"]'));
  }

  function makeStatus(element, politeness) {
    if (!element) return;
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', politeness || 'polite');
    element.setAttribute('aria-atomic', 'true');
  }

  function makeLegacyControl(element, label) {
    if (!element) return;
    if (element.tagName === 'BUTTON') {
      if (!element.hasAttribute('type')) element.type = 'button';
      return;
    }
    element.setAttribute('role', 'button');
    element.tabIndex = 0;
    if (label && !element.getAttribute('aria-label')) element.setAttribute('aria-label', label);
  }

  function activateOnKeyboard(element, callback) {
    if (['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) return;
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        callback(event);
      }
    });
  }

  function setFeedback(element, lead, detail, state) {
    if (!element) return;
    const strong = document.createElement('strong');
    strong.textContent = lead;
    element.replaceChildren(strong, document.createTextNode(detail ? ' ' + detail : ''));
    element.className = element.className.split(' ').filter(name => !['show', 'success', 'error', 'warning'].includes(name)).join(' ');
    element.classList.add('show', state);
  }

  const storage = {
    get(key) {
      try { return window.localStorage.getItem(key); } catch (_) { return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch (_) { /* Reading still works without persistence. */ }
    },
    remove(key) {
      try { window.localStorage.removeItem(key); } catch (_) { /* Nothing to clear. */ }
    }
  };

  /* ── COURSE SHELL, NAVIGATION, AND PROGRESS ──────────────── */
  const progressBar = $('#progress-bar');
  const navDots = $$('.nav-dot');
  const modules = $$('.module');
  const navStatus = $('#nav-status');
  const courseOverview = $('#course-overview');
  const courseCompletion = $('#course-complete');
  const outlineToggle = $('#outline-toggle');
  const outlineClose = $('#outline-close');
  const outline = $('#course-outline');
  const outlineList = $('#outline-list');
  const outlineSearch = $('#outline-search');
  const outlineEmpty = $('#outline-empty');
  const courseKey = 'codebase-to-course:' + (document.title || window.location.pathname);
  let outlineLinks = [];
  let lastSavedLocation = null;
  let scrollFrame = null;
  let resumeDecisionPending = false;

  function moduleTitle(index) {
    const dot = navDots[index];
    const module = modules[index];
    return (dot && dot.dataset.tooltip) || (module && $('.module-title', module) && $('.module-title', module).textContent.trim()) || `Module ${index + 1}`;
  }

  function currentLocation() {
    const scrollMidpoint = window.scrollY + window.innerHeight / 2;
    if (!modules.length || (modules[0] && scrollMidpoint < modules[0].offsetTop)) return { type: 'overview', index: -1 };
    for (let index = 0; index < modules.length; index += 1) {
      const module = modules[index];
      if (scrollMidpoint >= module.offsetTop && scrollMidpoint < module.offsetTop + module.offsetHeight) {
        return { type: 'module', index };
      }
    }
    return { type: 'completion', index: modules.length };
  }

  function saveLocation(location, percent) {
    if (resumeDecisionPending) return;
    const identifier = location.type === 'module' ? modules[location.index].id : location.type;
    if (identifier === 'overview' && window.scrollY < 8 && lastSavedLocation === null) {
      try {
        const existing = JSON.parse(storage.get(courseKey) || 'null');
        if (existing && existing.location && existing.location !== 'overview') return;
      } catch (_) { /* Invalid saved data is replaced below. */ }
    }
    if (identifier === lastSavedLocation && percent < 100) return;
    lastSavedLocation = identifier;
    storage.set(courseKey, JSON.stringify({
      location: identifier,
      title: location.type === 'module' ? moduleTitle(location.index) : location.type === 'completion' ? 'Course recap' : 'Course overview',
      percent: Math.round(percent),
      completed: location.type === 'completion',
      savedAt: Date.now()
    }));
  }

  function updateNavigation() {
    const location = currentLocation();
    const scrollHeight = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const percent = scrollHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollHeight) * 100)) : 0;

    if (progressBar) {
      progressBar.style.transform = `scaleX(${percent / 100})`;
      progressBar.setAttribute('aria-valuenow', String(Math.round(percent)));
    }

    const compactStatus = window.matchMedia && window.matchMedia('(max-width: 480px)').matches;
    let statusText = 'Course overview';
    if (location.type === 'module') statusText = compactStatus
      ? `${location.index + 1}/${modules.length} · ${moduleTitle(location.index)}`
      : `Module ${location.index + 1} of ${modules.length} · ${moduleTitle(location.index)}`;
    if (location.type === 'completion') statusText = compactStatus ? 'Course complete' : `Course complete · ${modules.length} modules`;
    if (navStatus && navStatus.textContent !== statusText) navStatus.textContent = statusText;
    if (progressBar) progressBar.setAttribute('aria-valuetext', `${Math.round(percent)}% complete · ${statusText}`);

    navDots.forEach((dot, index) => {
      const isCurrent = location.type === 'module' && index === location.index;
      dot.classList.toggle('active', isCurrent);
      dot.classList.toggle('visited', location.type === 'completion' || (location.type === 'module' && index < location.index));
      if (isCurrent) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });

    outlineLinks.forEach((link, index) => {
      const isCurrent = location.type === 'module' && index === location.index;
      if (isCurrent) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });

    saveLocation(location, percent);
  }

  function closeOutline(returnFocus) {
    if (!outline || !outlineToggle) return;
    outline.hidden = true;
    outlineToggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) outlineToggle.focus();
  }

  function openOutline() {
    if (!outline || !outlineToggle) return;
    outline.hidden = false;
    outlineToggle.setAttribute('aria-expanded', 'true');
    if (outlineSearch) outlineSearch.focus();
  }

  if (outlineList) {
    navDots.forEach((dot, index) => {
      dot.type = 'button';
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'outline-link';
      link.href = '#' + dot.dataset.target;
      link.textContent = moduleTitle(index);
      link.dataset.searchText = moduleTitle(index).toLocaleLowerCase();
      link.addEventListener('click', () => closeOutline(false));
      item.appendChild(link);
      outlineList.appendChild(item);
      outlineLinks.push(link);
    });
  }

  navDots.forEach(dot => {
    dot.addEventListener('click', () => {
      scrollToElement(document.getElementById(dot.dataset.target));
    });
  });

  if (outlineToggle) {
    outlineToggle.addEventListener('click', () => {
      outlineToggle.getAttribute('aria-expanded') === 'true' ? closeOutline(false) : openOutline();
    });
  }
  if (outlineClose) outlineClose.addEventListener('click', () => closeOutline(true));
  if (outlineSearch) {
    outlineSearch.addEventListener('input', () => {
      const query = outlineSearch.value.trim().toLocaleLowerCase();
      let visibleCount = 0;
      outlineLinks.forEach(link => {
        const matches = !query || link.dataset.searchText.includes(query);
        link.parentElement.hidden = !matches;
        if (matches) visibleCount += 1;
      });
      if (outlineEmpty) outlineEmpty.hidden = visibleCount !== 0;
    });
  }

  document.addEventListener('pointerdown', event => {
    if (outline && !outline.hidden && !outline.contains(event.target) && event.target !== outlineToggle && !outlineToggle.contains(event.target)) {
      closeOutline(false);
    }
  });

  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      updateNavigation();
      scrollFrame = null;
    });
  }, { passive: true });

  /* ── SAVED PROGRESS AND COURSE HELP ──────────────────────── */
  const resumeBanner = $('#resume-banner');
  const resumeDetail = $('#resume-detail');
  const resumeCourse = $('#resume-course');
  const dismissResume = $('#dismiss-resume');
  const helpToggle = $('#help-toggle');
  const helpDialog = $('#course-help');
  const restartCourse = $('#restart-course');

  function readSavedProgress() {
    const raw = storage.get(courseKey);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { storage.remove(courseKey); return null; }
  }

  const savedProgress = readSavedProgress();
  if (savedProgress && savedProgress.location && savedProgress.location !== 'overview' && !savedProgress.completed && resumeBanner) {
    resumeDecisionPending = true;
    if (resumeDetail) resumeDetail.textContent = `${savedProgress.title} · ${savedProgress.percent || 0}% complete`;
    resumeBanner.hidden = false;
  }

  if (resumeCourse) {
    resumeCourse.addEventListener('click', () => {
      const saved = savedProgress || readSavedProgress();
      const target = saved && document.getElementById(saved.location);
      resumeDecisionPending = false;
      resumeBanner.hidden = true;
      scrollToElement(target || courseOverview);
    });
  }

  if (dismissResume) {
    dismissResume.addEventListener('click', () => {
      resumeDecisionPending = false;
      storage.remove(courseKey);
      lastSavedLocation = null;
      resumeBanner.hidden = true;
      scrollToElement(courseOverview);
    });
  }

  function openHelp() {
    if (!helpDialog) return;
    if (typeof helpDialog.showModal === 'function') helpDialog.showModal();
    else helpDialog.setAttribute('open', '');
  }

  if (helpToggle) helpToggle.addEventListener('click', openHelp);
  if (restartCourse) {
    restartCourse.addEventListener('click', () => {
      if (restartCourse.dataset.confirm !== 'true') {
        restartCourse.dataset.confirm = 'true';
        restartCourse.textContent = 'Confirm restart — saved progress will be cleared';
        return;
      }
      storage.remove(courseKey);
      window.location.hash = 'course-overview';
      window.location.reload();
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && outline && !outline.hidden) {
      event.preventDefault();
      closeOutline(true);
      return;
    }
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || isTypingOrInteractive(event.target)) return;

    const location = currentLocation();
    if (event.key === '?') {
      event.preventDefault();
      openHelp();
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: motionIsReduced() ? 'auto' : 'smooth' });
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      scrollToElement(courseCompletion || modules[modules.length - 1]);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.key.toLocaleLowerCase() === 'j') {
      const nextIndex = location.type === 'overview' ? 0 : location.index + 1;
      const next = nextIndex < modules.length ? modules[nextIndex] : courseCompletion;
      if (next) { event.preventDefault(); scrollToElement(next); }
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key.toLocaleLowerCase() === 'k') {
      const previousIndex = location.type === 'completion' ? modules.length - 1 : location.index - 1;
      const previous = previousIndex >= 0 ? modules[previousIndex] : courseOverview;
      if (previous) { event.preventDefault(); scrollToElement(previous); }
    }
  });

  updateNavigation();

  /* ── SCROLL-TRIGGERED REVEAL ─────────────────────────────── */
  const animatedElements = $$('.animate-in');
  document.documentElement.classList.add('motion-ready');
  if (motionIsReduced() || !('IntersectionObserver' in window)) {
    animatedElements.forEach(element => element.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    animatedElements.forEach(element => revealObserver.observe(element));
  }
  $$('.stagger-children').forEach(parent => {
    Array.from(parent.children).forEach((child, index) => child.style.setProperty('--stagger-index', index));
  });

  /* ── GLOSSARY TOOLTIPS ───────────────────────────────────── */
  let activeTooltip = null;

  function hideActiveTooltip() {
    if (!activeTooltip) return;
    activeTooltip.term.classList.remove('active');
    activeTooltip.term.setAttribute('aria-expanded', 'false');
    activeTooltip.tip.classList.remove('visible');
    activeTooltip = null;
  }

  function showTooltip(term, tip) {
    if (activeTooltip && activeTooltip.term !== term) hideActiveTooltip();
    const rect = term.getBoundingClientRect();
    const tipWidth = Math.min(320, Math.max(200, window.innerWidth * 0.8));
    const left = Math.max(8, Math.min(rect.left + rect.width / 2 - tipWidth / 2, window.innerWidth - tipWidth - 8));
    tip.style.left = left + 'px';
    tip.style.width = tipWidth + 'px';
    const tipHeight = tip.offsetHeight;
    if (rect.top - tipHeight - 12 < 0) {
      tip.style.top = rect.bottom + 8 + 'px';
      tip.classList.add('flip');
    } else {
      tip.style.top = rect.top - tipHeight - 8 + 'px';
      tip.classList.remove('flip');
    }
    term.classList.add('active');
    term.setAttribute('aria-expanded', 'true');
    activeTooltip = { term, tip };
    requestAnimationFrame(() => {
      if (activeTooltip && activeTooltip.term === term && activeTooltip.tip === tip) tip.classList.add('visible');
    });
  }

  $$('.term').forEach((term, index) => {
    makeLegacyControl(term, `Define ${term.textContent.trim()}`);
    term.setAttribute('aria-expanded', 'false');
    const tip = document.createElement('span');
    tip.className = 'term-tooltip';
    tip.id = `term-definition-${index + 1}`;
    tip.setAttribute('role', 'tooltip');
    tip.textContent = term.dataset.definition || 'No definition was provided for this term.';
    document.body.appendChild(tip);
    term.setAttribute('aria-describedby', tip.id);

    term.addEventListener('mouseenter', () => showTooltip(term, tip));
    term.addEventListener('mouseleave', () => {
      if (document.activeElement !== term) hideActiveTooltip();
    });
    term.addEventListener('blur', hideActiveTooltip);
    term.addEventListener('click', event => {
      event.stopPropagation();
      activeTooltip && activeTooltip.term === term ? hideActiveTooltip() : showTooltip(term, tip);
    });
    term.addEventListener('keydown', event => {
      if (event.key === 'Escape' && activeTooltip && activeTooltip.term === term) {
        event.preventDefault();
        hideActiveTooltip();
      }
    });
    activateOnKeyboard(term, event => {
      event.stopPropagation();
      activeTooltip && activeTooltip.term === term ? hideActiveTooltip() : showTooltip(term, tip);
    });
  });
  document.addEventListener('click', hideActiveTooltip);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeTooltip) hideActiveTooltip();
  });

  /* ── QUIZ ENGINE ──────────────────────────────────────────── */
  $$('.quiz-question-block').forEach((block, blockIndex) => {
    const options = $$('.quiz-option', block);
    const question = $('.quiz-question', block);
    const questionId = question && (question.id || `quiz-question-${blockIndex + 1}`);
    if (question && !question.id) question.id = questionId;
    const optionsContainer = $('.quiz-options', block);
    if (optionsContainer) {
      optionsContainer.setAttribute('role', 'radiogroup');
      if (questionId) optionsContainer.setAttribute('aria-labelledby', questionId);
    }
    options.forEach(option => {
      if (option.tagName === 'BUTTON') option.type = 'button';
      option.setAttribute('role', 'radio');
      option.setAttribute('aria-checked', 'false');
    });
    makeStatus($('.quiz-feedback', block));
  });

  window.selectOption = function (button) {
    const block = button && button.closest('.quiz-question-block');
    if (!block || button.disabled) return;
    $$('.quiz-option', block).forEach(option => {
      option.classList.remove('selected');
      option.setAttribute('aria-checked', 'false');
    });
    button.classList.add('selected');
    button.setAttribute('aria-checked', 'true');
    const container = button.closest('.quiz-container');
    const checkButton = container && $('.quiz-check-btn', container);
    const allAnswered = container && $$('.quiz-question-block', container).every(block => Boolean($('.quiz-option.selected', block)));
    if (checkButton) checkButton.disabled = !allAnswered;
  };

  window.checkQuiz = function (containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let allAnswered = true;
    $$('.quiz-question-block', container).forEach(question => {
      const selected = $('.quiz-option.selected', question);
      const feedback = $('.quiz-feedback', question);
      if (!selected) {
        allAnswered = false;
        setFeedback(feedback, 'Choose an answer first.', 'Nothing has been submitted yet.', 'warning');
        return;
      }

      const correct = question.dataset.correct;
      $$('.quiz-option', question).forEach(option => { option.disabled = true; });
      if (selected.dataset.value === correct) {
        selected.classList.add('correct');
        setFeedback(feedback, 'Exactly.', question.dataset.explanationRight || 'That answer follows the code path shown above.', 'success');
      } else {
        selected.classList.add('incorrect');
        const correctButton = $$('.quiz-option', question).find(option => option.dataset.value === correct);
        if (correctButton) correctButton.classList.add('correct');
        setFeedback(feedback, 'Not quite.', question.dataset.explanationWrong || 'Review the relevant code path, then try again.', 'error');
      }
    });
    const checkButton = $('.quiz-check-btn', container);
    if (checkButton && allAnswered) checkButton.disabled = true;
  };

  window.resetQuiz = function (containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    $$('.quiz-option', container).forEach(option => {
      option.classList.remove('selected', 'correct', 'incorrect');
      option.setAttribute('aria-checked', 'false');
      option.disabled = false;
    });
    $$('.quiz-feedback', container).forEach(feedback => {
      feedback.className = 'quiz-feedback';
      feedback.textContent = '';
    });
    const checkButton = $('.quiz-check-btn', container);
    if (checkButton) checkButton.disabled = true;
    const firstOption = $('.quiz-option', container);
    if (firstOption) firstOption.focus();
  };

  $$('.quiz-container').forEach(container => {
    $$('.quiz-option', container).forEach(option => {
      if (!option.hasAttribute('onclick')) option.addEventListener('click', () => window.selectOption(option));
    });
    const checkButton = $('.quiz-check-btn', container);
    const resetButton = $('.quiz-reset-btn', container);
    if (checkButton) checkButton.disabled = true;
    if (checkButton && !checkButton.hasAttribute('onclick')) checkButton.addEventListener('click', () => window.checkQuiz(container.id));
    if (resetButton && !resetButton.hasAttribute('onclick')) resetButton.addEventListener('click', () => window.resetQuiz(container.id));
  });

  /* ── DRAG, TAP, AND KEYBOARD MATCHING ────────────────────── */
  function initDnD(container) {
    const chips = $$('.dnd-chip', container);
    const zones = $$('.dnd-zone', container);
    const targets = zones.map(zone => $('.dnd-zone-target', zone)).filter(Boolean);
    let selectedChip = null;
    let feedback = $('.dnd-feedback', container);
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.className = 'dnd-feedback';
      container.appendChild(feedback);
    }
    makeStatus(feedback);

    function setTargetsEnabled(enabled) {
      targets.forEach(target => { target.disabled = !enabled; });
    }

    function chipFor(answer) {
      return chips.find(chip => chip.dataset.answer === answer) || null;
    }

    function selectChip(chip) {
      if (selectedChip === chip) {
        chip.classList.remove('selected');
        chip.setAttribute('aria-pressed', 'false');
        selectedChip = null;
        setTargetsEnabled(false);
        feedback.textContent = 'Selection cleared.';
        return;
      }
      chips.forEach(item => {
        item.classList.remove('selected');
        item.setAttribute('aria-pressed', 'false');
      });
      selectedChip = chip;
      setTargetsEnabled(true);
      chip.classList.add('selected');
      chip.setAttribute('aria-pressed', 'true');
      feedback.textContent = `${chip.textContent.trim()} selected. Now choose a destination.`;
    }

    function placeChip(chip, target) {
      if (!chip || !target) return;
      const oldAnswer = target.dataset.placed;
      if (oldAnswer && oldAnswer !== chip.dataset.answer) {
        const oldChip = chipFor(oldAnswer);
        if (oldChip) oldChip.classList.remove('placed');
      }
      const previousTarget = $$('.dnd-zone-target', container).find(candidate => candidate !== target && candidate.dataset.placed === chip.dataset.answer);
      if (previousTarget) {
        previousTarget.textContent = 'Place an item here';
        delete previousTarget.dataset.placed;
        previousTarget.classList.remove('correct-placed', 'incorrect-placed');
      }
      target.textContent = chip.textContent.trim();
      target.dataset.placed = chip.dataset.answer;
      target.setAttribute('aria-label', `${chip.textContent.trim()} placed here. Select to replace it.`);
      target.classList.remove('correct-placed', 'incorrect-placed');
      chip.classList.add('placed');
      chip.classList.remove('selected');
      chip.setAttribute('aria-pressed', 'false');
      selectedChip = null;
      setTargetsEnabled(false);
      feedback.textContent = `${chip.textContent.trim()} placed. You can select it again to move it.`;
      const checkButton = $('.dnd-check-btn', container);
      if (checkButton) checkButton.disabled = $$('.dnd-zone-target', container).some(candidate => !candidate.dataset.placed);
    }

    chips.forEach(chip => {
      makeLegacyControl(chip, `Select ${chip.textContent.trim()} to place it`);
      chip.setAttribute('aria-pressed', 'false');
      chip.draggable = true;
      chip.addEventListener('click', () => selectChip(chip));
      activateOnKeyboard(chip, () => selectChip(chip));
      chip.addEventListener('dragstart', event => {
        event.dataTransfer.setData('text/plain', chip.dataset.answer || '');
        chip.classList.add('dragging');
        setTargetsEnabled(true);
      });
      chip.addEventListener('dragend', () => {
        chip.classList.remove('dragging');
        if (!selectedChip) setTargetsEnabled(false);
      });
    });

    zones.forEach(zone => {
      const target = $('.dnd-zone-target', zone);
      if (!target) return;
      makeLegacyControl(target, `Destination: ${($('.dnd-zone-label', zone) || {}).textContent || 'matching area'}`);
      target.addEventListener('click', () => {
        if (selectedChip) placeChip(selectedChip, target);
        else feedback.textContent = 'Select an item first, then choose this destination.';
      });
      activateOnKeyboard(target, () => {
        if (selectedChip) placeChip(selectedChip, target);
        else feedback.textContent = 'Select an item first, then choose this destination.';
      });
      target.addEventListener('dragover', event => { event.preventDefault(); target.classList.add('drag-over'); });
      target.addEventListener('dragleave', () => target.classList.remove('drag-over'));
      target.addEventListener('drop', event => {
        event.preventDefault();
        target.classList.remove('drag-over');
        placeChip(chipFor(event.dataTransfer.getData('text/plain')), target);
      });
    });

    container._resetDnD = function () {
      selectedChip = null;
      $$('.dnd-zone-target', container).forEach(target => {
        target.textContent = 'Place an item here';
        target.setAttribute('aria-label', 'Empty destination. Select an item, then select this destination.');
        delete target.dataset.placed;
        target.classList.remove('correct-placed', 'incorrect-placed', 'drag-over');
      });
      chips.forEach(chip => {
        chip.classList.remove('placed', 'dragging', 'selected');
        chip.setAttribute('aria-pressed', 'false');
      });
      feedback.textContent = 'Exercise reset. Select an item to begin.';
      setTargetsEnabled(false);
      const checkButton = $('.dnd-check-btn', container);
      if (checkButton) checkButton.disabled = true;
    };

    const checkButton = $('.dnd-check-btn', container);
    const resetButton = $('.dnd-reset-btn', container);
    setTargetsEnabled(false);
    if (checkButton) checkButton.disabled = true;
    if (checkButton && !checkButton.hasAttribute('onclick')) checkButton.addEventListener('click', () => window.checkDnD(container.id));
    if (resetButton && !resetButton.hasAttribute('onclick')) resetButton.addEventListener('click', () => window.resetDnD(container.id));
  }

  window.checkDnD = function (containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const zones = $$('.dnd-zone', container);
    const feedback = $('.dnd-feedback', container);
    const unplaced = zones.filter(zone => !$('.dnd-zone-target', zone) || !$('.dnd-zone-target', zone).dataset.placed);
    if (unplaced.length) {
      if (feedback) feedback.textContent = `${unplaced.length} ${unplaced.length === 1 ? 'match is' : 'matches are'} still empty. Place every item before checking.`;
      return;
    }
    let correctCount = 0;
    zones.forEach(zone => {
      const target = $('.dnd-zone-target', zone);
      const correct = target.dataset.placed === zone.dataset.correct;
      target.classList.toggle('correct-placed', correct);
      target.classList.toggle('incorrect-placed', !correct);
      if (correct) correctCount += 1;
    });
    if (feedback) feedback.textContent = correctCount === zones.length
      ? `All ${zones.length} matches are correct.`
      : `${correctCount} of ${zones.length} matches are correct. Move the highlighted mismatches and check again.`;
  };

  window.resetDnD = function (containerId) {
    const container = document.getElementById(containerId);
    if (container && container._resetDnD) container._resetDnD();
  };

  $$('.dnd-container').forEach(container => initDnD(container));

  /* ── GROUP CHAT ENGINE ───────────────────────────────────── */
  function initChat(container) {
    const messages = $$('.chat-message', container);
    const typing = $('.chat-typing', container);
    const typingAvatar = findById(container.id + '-typing-avatar', container) || $('.chat-avatar', typing);
    const progress = $('.chat-progress', container);
    const nextButton = $('.chat-next-btn', container);
    const allButton = $('.chat-all-btn', container);
    const resetButton = $('.chat-reset-btn', container);
    const messageArea = $('.chat-messages', container);
    let index = 0;
    let playing = false;
    let busy = false;
    let timer = null;

    if (messageArea) {
      messageArea.setAttribute('role', 'log');
      messageArea.setAttribute('aria-live', 'polite');
      messageArea.setAttribute('aria-relevant', 'additions');
    }
    makeStatus(progress);

    const empty = document.createElement('div');
    empty.className = 'chat-empty';
    const emptyTitle = document.createElement('strong');
    emptyTitle.textContent = 'Watch the exchange unfold';
    empty.append(emptyTitle, document.createTextNode(`Reveal ${messages.length} messages one at a time, or play the complete exchange.`));
    if (messageArea) messageArea.prepend(empty);

    const actors = {};
    messages.forEach(message => {
      const avatar = $('.chat-avatar', message);
      if (avatar && !actors[message.dataset.sender]) actors[message.dataset.sender] = { initial: avatar.textContent.trim(), style: avatar.style.background };
      message.hidden = true;
      message.style.display = '';
    });

    function clearTimer() {
      if (timer) window.clearTimeout(timer);
      timer = null;
    }

    function updateChatState() {
      const complete = index >= messages.length;
      if (progress) progress.textContent = complete ? `Complete · ${messages.length} messages` : `${index} of ${messages.length} messages`;
      if (nextButton) {
        nextButton.disabled = complete || busy;
        nextButton.textContent = complete ? 'Conversation complete' : 'Next message';
      }
      if (allButton) {
        allButton.disabled = complete;
        allButton.textContent = playing ? 'Pause' : complete ? 'Played in full' : 'Play all';
        allButton.setAttribute('aria-pressed', String(playing));
      }
    }

    function pause() {
      playing = false;
      busy = false;
      clearTimer();
      if (typing) typing.hidden = true;
      updateChatState();
    }

    function revealNext() {
      if (busy || index >= messages.length) {
        if (index >= messages.length) pause();
        return;
      }
      busy = true;
      empty.hidden = true;
      const message = messages[index];
      const actor = actors[message.dataset.sender];
      if (typing && actor) {
        if (typingAvatar) {
          typingAvatar.textContent = actor.initial;
          typingAvatar.style.background = actor.style;
        }
        typing.hidden = false;
      }
      updateChatState();
      timer = window.setTimeout(() => {
        if (typing) typing.hidden = true;
        message.hidden = false;
        index += 1;
        busy = false;
        updateChatState();
        if (playing && index < messages.length) {
          timer = window.setTimeout(revealNext, motionIsReduced() ? 0 : 450);
        } else if (index >= messages.length) {
          playing = false;
          updateChatState();
        }
      }, motionIsReduced() ? 0 : 650);
    }

    function reset(shouldFocus) {
      pause();
      index = 0;
      messages.forEach(message => { message.hidden = true; });
      empty.hidden = false;
      updateChatState();
      if (shouldFocus && nextButton) nextButton.focus();
    }

    if (nextButton) nextButton.addEventListener('click', revealNext);
    if (allButton) allButton.addEventListener('click', () => {
      if (playing) { pause(); return; }
      playing = true;
      updateChatState();
      revealNext();
    });
    if (resetButton) resetButton.addEventListener('click', reset);
    updateChatState();
  }

  $$('.chat-window').forEach(container => initChat(container));

  /* ── FLOW ANIMATION ENGINE ───────────────────────────────── */
  function initFlow(container) {
    const label = $('.flow-step-label', container);
    const progress = $('.flow-progress', container);
    const packet = $('.flow-packet', container);
    const nextButton = $('.flow-next-btn', container);
    const resetButton = $('.flow-reset-btn', container);
    let steps = [];
    let step = 0;
    let packetTimer = null;

    makeStatus(label);
    makeStatus(progress);

    try {
      steps = JSON.parse(container.dataset.steps || '[]');
      if (!Array.isArray(steps) || !steps.length) throw new Error('No flow steps were supplied.');
    } catch (_) {
      const error = document.createElement('p');
      error.className = 'flow-error';
      error.setAttribute('role', 'alert');
      error.textContent = 'This walkthrough’s step list is incomplete. The surrounding lesson is still available; rebuild the course to restore the walkthrough.';
      container.insertBefore(error, $('.flow-controls', container));
      if (nextButton) nextButton.disabled = true;
      if (resetButton) resetButton.disabled = true;
      if (progress) progress.textContent = 'Walkthrough unavailable';
      return;
    }

    const history = document.createElement('ol');
    history.className = 'flow-history';
    history.setAttribute('aria-label', 'Completed walkthrough steps');
    if (label) label.insertAdjacentElement('afterend', history);

    function actorFor(reference) {
      if (!reference) return null;
      return findById(reference, container) || findById('flow-' + reference, container);
    }

    function animatePacket(from, to) {
      if (!packet || motionIsReduced()) return;
      const fromElement = actorFor(from);
      const toElement = actorFor(to);
      if (!fromElement || !toElement) return;
      const fromRect = fromElement.getBoundingClientRect();
      const toRect = toElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      packet.style.setProperty('--packet-from-x', fromRect.left + fromRect.width / 2 - containerRect.left + 'px');
      packet.style.setProperty('--packet-from-y', fromRect.top + fromRect.height / 2 - containerRect.top + 'px');
      packet.style.setProperty('--packet-to-x', toRect.left + toRect.width / 2 - containerRect.left + 'px');
      packet.style.setProperty('--packet-to-y', toRect.top + toRect.height / 2 - containerRect.top + 'px');
      packet.style.display = 'block';
      packet.style.animation = 'none';
      void packet.offsetHeight;
      packet.style.animation = 'packetMove 0.8s var(--ease-in-out) forwards';
      if (packetTimer) window.clearTimeout(packetTimer);
      packetTimer = window.setTimeout(() => { packet.style.display = 'none'; }, 850);
    }

    function updateFlowState() {
      const complete = step >= steps.length;
      if (progress) progress.textContent = complete ? `Complete · ${steps.length} steps` : `Step ${step} of ${steps.length}`;
      if (nextButton) {
        nextButton.disabled = complete;
        nextButton.textContent = complete ? 'Walkthrough complete' : 'Next step';
      }
    }

    function next() {
      if (step >= steps.length) return;
      const current = steps[step];
      $$('.flow-actor', container).forEach(actor => actor.classList.remove('active'));
      const highlighted = actorFor(current.highlight);
      if (highlighted) highlighted.classList.add('active');
      if (current.packet && current.from && current.to) animatePacket(current.from, current.to);
      const description = current.label || `Step ${step + 1}`;
      if (label) label.textContent = description;
      const historyItem = document.createElement('li');
      historyItem.textContent = description;
      history.appendChild(historyItem);
      step += 1;
      updateFlowState();
    }

    function reset(shouldFocus) {
      step = 0;
      history.replaceChildren();
      $$('.flow-actor', container).forEach(actor => actor.classList.remove('active'));
      if (label) label.textContent = 'Choose Next step to trace the request through the codebase.';
      if (packet) packet.style.display = 'none';
      if (packetTimer) window.clearTimeout(packetTimer);
      updateFlowState();
      if (shouldFocus && nextButton) nextButton.focus();
    }

    if (nextButton) nextButton.addEventListener('click', next);
    if (resetButton) resetButton.addEventListener('click', () => reset(true));
    reset(false);
  }

  $$('.flow-animation').forEach(container => initFlow(container));

  /* ── ARCHITECTURE DIAGRAM ────────────────────────────────── */
  $$('.arch-diagram').forEach((diagram, diagramIndex) => {
    const description = $('.arch-description', diagram);
    if (description) {
      if (!description.id) description.id = `architecture-description-${diagramIndex + 1}`;
      makeStatus(description);
    }
    $$('.arch-component', diagram).forEach(component => {
      makeLegacyControl(component, `Explain ${component.textContent.trim()}`);
      component.setAttribute('aria-pressed', 'false');
      if (description) component.setAttribute('aria-describedby', description.id);
      const activate = () => {
        $$('.arch-component', diagram).forEach(item => {
          item.classList.remove('active');
          item.setAttribute('aria-pressed', 'false');
        });
        component.classList.add('active');
        component.setAttribute('aria-pressed', 'true');
        if (description) description.textContent = component.dataset.desc || 'No description was provided for this component.';
      };
      component.addEventListener('click', activate);
      activateOnKeyboard(component, activate);
    });
  });

  /* ── BUG CHALLENGE ───────────────────────────────────────── */
  $$('.bug-challenge').forEach(challenge => {
    makeStatus($('.bug-feedback', challenge));
    $$('.bug-line', challenge).forEach(line => {
      makeLegacyControl(line, `Inspect code line ${line.dataset.line || ''}`.trim());
      line.setAttribute('aria-pressed', 'false');
      if (!line.hasAttribute('onclick')) {
        const activate = () => window.checkBugLine(line, line.dataset.correct === 'true');
        line.addEventListener('click', activate);
        activateOnKeyboard(line, activate);
      }
    });
  });

  window.checkBugLine = function (element, isCorrect) {
    const challenge = element && element.closest('.bug-challenge');
    const feedback = challenge && $('.bug-feedback', challenge);
    if (!challenge || !feedback) return;
    if (isCorrect) {
      element.classList.add('correct');
      element.setAttribute('aria-pressed', 'true');
      setFeedback(feedback, 'Found it.', element.dataset.explanation || 'This line creates the behavior described in the challenge.', 'success');
      $$('.bug-line', challenge).forEach(line => {
        if (line.tagName === 'BUTTON') line.disabled = true;
        else line.setAttribute('aria-disabled', 'true');
      });
    } else {
      element.classList.add('incorrect');
      setFeedback(feedback, 'Not this line.', element.dataset.hint || 'Keep looking for the line that changes timing, data, or control flow.', 'error');
      window.setTimeout(() => {
        element.classList.remove('incorrect');
        feedback.className = 'bug-feedback';
        feedback.textContent = '';
      }, motionIsReduced() ? 100 : 1800);
    }
  };

  /* ── LAYER TOGGLE ────────────────────────────────────────── */
  $$('.layer-demo').forEach((demo, demoIndex) => {
    const tabList = $('.layer-tabs', demo);
    const tabs = $$('.layer-tab', demo);
    if (tabList) tabList.setAttribute('role', 'tablist');
    tabs.forEach((tab, tabIndex) => {
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      const rawTarget = tab.getAttribute('onclick') && tab.getAttribute('onclick').match(/showLayer\(['"]([^'"]+)/);
      const targetId = tab.dataset.layer || (rawTarget && rawTarget[1]) || `layer-${tabIndex + 1}`;
      const panel = findById(targetId, demo) || findById('layer-' + targetId, demo);
      if (panel) {
        if (!panel.id) panel.id = `layer-panel-${demoIndex + 1}-${tabIndex + 1}`;
        tab.setAttribute('aria-controls', panel.id);
        panel.setAttribute('role', 'tabpanel');
      }
      tab.setAttribute('aria-selected', String(tab.classList.contains('active')));
      tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
      if (!tab.hasAttribute('onclick')) tab.addEventListener('click', () => window.showLayer(targetId, tab));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextTab = tabs[(tabIndex + direction + tabs.length) % tabs.length];
        nextTab.focus();
        nextTab.click();
      });
    });
  });

  window.showLayer = function (layerId, button) {
    const demo = button && button.closest('.layer-demo');
    if (!demo) return;
    const layer = findById(layerId, demo) || findById('layer-' + layerId, demo);
    if (!layer) return;
    $$('.layer', demo).forEach(item => { item.hidden = true; item.style.display = ''; });
    $$('.layer-tab', demo).forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
      tab.tabIndex = -1;
    });
    layer.hidden = false;
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    button.tabIndex = 0;
    const description = $('.layer-description', demo);
    if (description) {
      makeStatus(description);
      description.textContent = button.dataset.description || description.textContent;
    }
  };

  /* ── COMPLETION ACTIONS ──────────────────────────────────── */
  const copyPromptButton = $('#copy-next-prompt');
  const nextPrompt = $('#next-prompt');
  const copyStatus = $('#copy-status');
  if (copyPromptButton && nextPrompt) {
    copyPromptButton.addEventListener('click', async () => {
      const prompt = nextPrompt.textContent.trim();
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(prompt);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = prompt;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          const copied = document.execCommand('copy');
          textarea.remove();
          if (!copied) throw new Error('Copy command was unavailable.');
        }
        if (copyStatus) copyStatus.textContent = 'Prompt copied. Paste it into your AI coding tool when you are ready.';
        copyPromptButton.textContent = 'Copied';
      } catch (_) {
        if (copyStatus) copyStatus.textContent = 'Copy was blocked by the browser. Select the prompt text above and copy it manually.';
      }
    });
  }
})();
