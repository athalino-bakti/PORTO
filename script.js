(() => {
    'use strict';

    const root = document.documentElement;
    const header = document.querySelector('.site-header');
    const menuButton = document.querySelector('.menu-toggle');
    const mobileNavigation = document.querySelector('#mobile-navigation');
    const navigationLinks = [...document.querySelectorAll('[data-section]')];
    const sections = [...document.querySelectorAll('main section[id]')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const motionButton = document.querySelector('#motion-toggle');
    let manuallyPaused = false;
    try { manuallyPaused = localStorage.getItem('portfolio-motion') === 'paused'; } catch { /* Storage is optional. */ }
    const motionAllowed = () => !reducedMotion.matches && !manuallyPaused;
    const revealElements = [...document.querySelectorAll('[data-reveal]')];
    let revealObserver;
    let counterObserver;
    const counters = [];
    const activeCounters = new Set();
    let counterFrame = 0;

    function setMenuOpen(open) {
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        mobileNavigation.hidden = !open;
        header.classList.toggle('menu-open', open);
    }
    menuButton.hidden = false;
    setMenuOpen(false);
    menuButton.addEventListener('click', () => setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
            setMenuOpen(false);
            menuButton.focus();
        }
    });
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.site-header')) setMenuOpen(false);
    });
    window.matchMedia('(min-width: 1280px)').addEventListener('change', () => {
        const focusWasInMenu = mobileNavigation.contains(document.activeElement);
        setMenuOpen(false);
        if (focusWasInMenu) document.querySelector('.site-brand').focus({ preventScroll: true });
    });
    // Let native anchors update the hash/history and respect CSS reduced motion.
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', () => {
            const target = document.getElementById(link.hash.slice(1));
            if (!target) return;
            setMenuOpen(false);
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        });
    });

    function showElement(element) {
        element.classList.remove('reveal-pending');
        element.classList.add('is-revealed');
        revealObserver?.unobserve(element);
    }
    // A screen-reader copy preserves each complete heading, including punctuation.
    function prepareWords(heading) {
        const text = heading.textContent.trim().replace(/\s+/g, ' ');
        const accessible = document.createElement('span');
        accessible.className = 'sr-only';
        accessible.textContent = text;
        const visual = document.createElement('span');
        visual.setAttribute('aria-hidden', 'true');
        while (heading.firstChild) visual.append(heading.firstChild);
        const walker = document.createTreeWalker(visual, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        let index = 0;
        nodes.forEach((node) => {
            const fragment = document.createDocumentFragment();
            node.textContent.split(/(\s+)/).forEach((part) => {
                if (!part || /^\s+$/.test(part)) { fragment.append(document.createTextNode(part)); return; }
                const clip = document.createElement('span');
                clip.className = 'word-clip';
                const word = document.createElement('span');
                word.className = 'word-inner';
                word.style.setProperty('--word-delay', Math.min(index++ * 30, 210) + 'ms');
                word.textContent = part;
                clip.append(word);
                fragment.append(clip);
            });
            node.replaceWith(fragment);
        });
        // Keep punctuation in an accent span attached to the preceding word.
        visual.querySelectorAll('.text-primary').forEach((accent) => {
            if (!/^[.,!?]+$/.test(accent.textContent.trim())) return;
            const previous = accent.previousElementSibling?.querySelector('.word-inner');
            if (!previous) return;
            const punctuation = document.createElement('span');
            punctuation.className = accent.className;
            punctuation.textContent = accent.textContent.trim();
            previous.append(punctuation);
            accent.remove();
        });
        heading.replaceChildren(accessible, visual);
        heading.classList.add('text-reveal');
    }
    revealElements.forEach((element) => {
        element.style.setProperty('--reveal-delay', (Number(element.dataset.delay) || 0) + 'ms');
        if (element.dataset.reveal === 'words') prepareWords(element);
    });
    if ('IntersectionObserver' in window && motionAllowed()) {
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => { if (entry.isIntersecting) showElement(entry.target); });
        }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });
        revealElements.forEach((element) => {
            // Don't hide content above a deep-linked section on initial load.
            if (element.getBoundingClientRect().bottom <= 0) return;
            element.classList.add('reveal-ready', 'reveal-pending');
            revealObserver.observe(element);
        });
    }
    document.addEventListener('focusin', (event) => {
        let element = event.target;
        while (element && element !== document.body) {
            if (element.hasAttribute('data-reveal')) showElement(element);
            element = element.parentElement;
        }
    });

    // Values and suffixes are parsed from existing text, never re-authored.
    document.querySelectorAll('[data-count]').forEach((element) => {
        const finalText = element.textContent.trim();
        const parts = finalText.match(/^(\D*)([\d,]+)(.*)$/);
        if (!parts) return;
        const accessible = document.createElement('span');
        accessible.className = 'sr-only';
        accessible.textContent = finalText;
        const visible = document.createElement('span');
        visible.setAttribute('aria-hidden', 'true');
        visible.textContent = finalText;
        element.replaceChildren(accessible, visible);
        counters.push({ element, visible, finalText, prefix: parts[1], value: Number(parts[2].replaceAll(',', '')), suffix: parts[3], started: false, start: 0 });
    });
    function finishCounters() {
        cancelAnimationFrame(counterFrame);
        counterFrame = 0;
        activeCounters.clear();
        counters.forEach((counter) => {
            counter.visible.textContent = counter.finalText;
            counter.started = true;
        });
        counterObserver?.disconnect();
    }
    function tickCounters(now) {
        activeCounters.forEach((counter) => {
            const progress = Math.min((now - counter.start) / 1150, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.visible.textContent = counter.prefix + Math.round(counter.value * eased).toLocaleString('en-US') + counter.suffix;
            if (progress === 1) { counter.visible.textContent = counter.finalText; activeCounters.delete(counter); }
        });
        counterFrame = activeCounters.size ? requestAnimationFrame(tickCounters) : 0;
    }
    if ('IntersectionObserver' in window && motionAllowed()) {
        counterObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const counter = counters.find((item) => item.element === entry.target);
                if (counter.started) return;
                counter.started = true;
                counter.start = performance.now();
                counter.visible.textContent = counter.prefix + '0' + counter.suffix;
                activeCounters.add(counter);
                counterObserver.unobserve(entry.target);
                if (!counterFrame) counterFrame = requestAnimationFrame(tickCounters);
            });
        }, { threshold: .4 });
        counters.forEach((counter) => counterObserver.observe(counter.element));
    }

    const timeline = document.querySelector('.experience-timeline');
    const timelineItems = [...document.querySelectorAll('.timeline-item')];
    let timelineVisible = true;
    let currentSection = '';
    function updateScrollState() {
        header.classList.toggle('is-scrolled', window.scrollY > 16);
        let current = sections[0];
        for (const section of sections) {
            if (section.getBoundingClientRect().top <= 145) current = section;
        }
        if (window.scrollY + window.innerHeight >= root.scrollHeight - 4) current = sections[sections.length - 1];
        // Tools has no navigation item; keep Competencies active through this band.
        const currentId = current.id === 'tools' ? 'competencies' : current.id;
        if (currentId !== currentSection) {
            navigationLinks.forEach((link) => {
                if (link.dataset.section === currentId) link.setAttribute('aria-current', 'page');
                else link.removeAttribute('aria-current');
            });
            currentSection = currentId;
        }
        if (timelineVisible && timeline) {
            const bounds = timeline.getBoundingClientRect();
            const readingLine = innerHeight * .72;
            const progress = Math.max(0, Math.min(1, (readingLine - bounds.top - 32) / Math.max(bounds.height - 64, 1)));
            timeline.style.setProperty('--timeline-progress', motionAllowed() ? progress : 1);
            timelineItems.forEach((item) => {
                if (item.getBoundingClientRect().top + 32 <= readingLine) item.classList.add('is-active');
            });
        }
    }
    let scrollFrame = 0;
    function scheduleScrollUpdate() {
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; updateScrollState(); });
    }
    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
    window.addEventListener('resize', scheduleScrollUpdate);
    window.addEventListener('load', scheduleScrollUpdate);
    window.addEventListener('hashchange', scheduleScrollUpdate);
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                entry.target.classList.toggle('is-in-view', entry.isIntersecting);
                if (entry.target.id === 'experience') timelineVisible = entry.isIntersecting;
            });
            scheduleScrollUpdate();
        });
        sections.forEach((section) => sectionObserver.observe(section));
    }

    // One frame per pointer event; no perpetual animation loop or custom cursor.
    const hero = document.querySelector('#overview');
    const portrait = document.querySelector('.portrait-shell');
    let parallaxFrame = 0;
    function resetParallax() {
        cancelAnimationFrame(parallaxFrame);
        parallaxFrame = 0;
        portrait?.style.removeProperty('--parallax-x');
        portrait?.style.removeProperty('--parallax-y');
    }
    hero?.addEventListener('pointermove', (event) => {
        if (!motionAllowed() || !finePointer.matches || event.pointerType === 'touch' || document.hidden) return;
        if (parallaxFrame) cancelAnimationFrame(parallaxFrame);
        const x = event.clientX;
        const y = event.clientY;
        parallaxFrame = requestAnimationFrame(() => {
            parallaxFrame = 0;
            const bounds = hero.getBoundingClientRect();
            portrait.style.setProperty('--parallax-x', ((x - bounds.left) / bounds.width - .5) * 10 + 'px');
            portrait.style.setProperty('--parallax-y', ((y - bounds.top) / bounds.height - .5) * 8 + 'px');
        });
    }, { passive: true });
    hero?.addEventListener('pointerleave', resetParallax);
    finePointer.addEventListener('change', resetParallax);

    function syncMotionPreference() {
        root.classList.toggle('motion-paused', manuallyPaused);
        motionButton.hidden = false;
        motionButton.disabled = reducedMotion.matches;
        const paused = !motionAllowed();
        motionButton.setAttribute('aria-pressed', String(paused));
        motionButton.setAttribute('aria-label', reducedMotion.matches ? 'Reduced motion enabled by your device' : paused ? 'Resume animations' : 'Pause animations');
        motionButton.querySelector('span').textContent = reducedMotion.matches ? 'Reduced motion' : paused ? 'Motion paused' : 'Motion on';
        if (paused) {
            revealObserver?.disconnect();
            revealElements.forEach(showElement);
            finishCounters();
            resetParallax();
        }
        updateScrollState();
        document.dispatchEvent(new Event('motionpreferencechange'));
    }
    motionButton.addEventListener('click', () => {
        manuallyPaused = !manuallyPaused;
        try { localStorage.setItem('portfolio-motion', manuallyPaused ? 'paused' : 'running'); } catch { /* Storage is optional. */ }
        syncMotionPreference();
    });
    reducedMotion.addEventListener('change', syncMotionPreference);
    document.addEventListener('visibilitychange', () => {
        root.classList.toggle('page-hidden', document.hidden);
        if (document.hidden) {
            resetParallax();
            if (activeCounters.size) finishCounters();
        }
    });

    // Existing case studies stay in place; these buttons open a focused reader.
    const dialog = document.querySelector('#case-study-dialog');
    const dialogContent = dialog.querySelector('.dialog-content');
    let dialogTrigger;
    let closeTimer;
    function finishClose() {
        clearTimeout(closeTimer);
        dialog.close();
        dialog.classList.remove('is-closing');
    }
    function closeDialog() {
        if (!dialog.open || dialog.classList.contains('is-closing')) return;
        if (!motionAllowed()) { finishClose(); return; }
        dialog.classList.add('is-closing');
        closeTimer = setTimeout(finishClose, 180);
    }
    if (typeof dialog.showModal === 'function') {
        document.querySelectorAll('[data-case-study]').forEach((button) => {
            button.hidden = false;
            button.addEventListener('click', () => {
                const original = document.getElementById(button.dataset.caseStudy);
                const copy = original.cloneNode(true);
                copy.querySelectorAll('[data-case-study]').forEach((element) => element.remove());
                [copy, ...copy.querySelectorAll('*')].forEach((element) => {
                    element.removeAttribute('id');
                    element.removeAttribute('data-reveal');
                    element.removeAttribute('data-delay');
                    element.classList.remove('project-card', 'reveal-ready', 'reveal-pending');
                });
                copy.querySelector('h3, h4').id = 'case-dialog-title';
                dialogContent.replaceChildren(copy);
                dialogTrigger = button;
                root.classList.add('dialog-open');
                dialog.showModal();
                dialog.scrollTop = 0;
            });
        });
    }
    dialog.querySelector('.dialog-close').addEventListener('click', closeDialog);
    dialog.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') { event.preventDefault(); closeDialog(); }
        if (event.key === 'Tab') {
            const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')];
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeDialog(); });
    dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const box = dialog.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDialog();
    });
    dialog.addEventListener('close', () => {
        root.classList.remove('dialog-open');
        dialogContent.replaceChildren();
        dialogTrigger?.focus({ preventScroll: true });
    });
    syncMotionPreference();
})();
