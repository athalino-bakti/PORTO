(() => {
    'use strict';

    const card = document.querySelector('#procurement-improvement');
    if (!card) return;
    const stages = [...card.querySelectorAll('.proc-mini-stages li')];
    const status = card.querySelector('[data-preview-status]');
    const replay = card.querySelector('.proc-preview-replay');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const labels = ['Justification review', 'PR recorded', 'PO / Contract', 'Goods received', 'Complete'];
    let timers = [];
    let running = false;

    function motionAllowed() {
        return !reducedMotion.matches && !document.documentElement.classList.contains('motion-paused') && !document.hidden;
    }
    function clearTimers() {
        timers.forEach(clearTimeout);
        timers = [];
    }
    function showStage(index) {
        stages.forEach((stage, i) => {
            stage.classList.toggle('is-current', index === i);
            stage.classList.toggle('is-complete', i < index);
        });
        card.style.setProperty('--proc-progress', Math.min(index / 3, 1));
        status.textContent = labels[index];
    }
    function settle() {
        clearTimers();
        running = false;
        card.classList.remove('proc-preview-running', 'proc-preview-finished');
        showStage(4);
    }
    function play() {
        if (!motionAllowed() || running) return;
        clearTimers();
        running = true;
        card.classList.remove('proc-preview-finished');
        card.style.setProperty('--proc-rail-width', card.querySelector('.proc-mini-rail').getBoundingClientRect().width + 'px');
        card.classList.add('proc-preview-running');
        showStage(0);
        [1, 2, 3, 4].forEach((step) => {
            timers.push(setTimeout(() => {
                showStage(step);
                if (step === 4) {
                    running = false;
                    card.classList.remove('proc-preview-running');
                    card.classList.add('proc-preview-finished');
                }
            }, step * 800));
        });
    }
    function syncPreference() {
        replay.hidden = !motionAllowed();
        if (!motionAllowed()) settle();
    }
    replay.addEventListener('click', () => { settle(); play(); });
    card.addEventListener('pointerenter', (event) => {
        if (finePointer.matches && event.pointerType !== 'touch') play();
    });
    card.addEventListener('focusin', (event) => {
        if (!card.contains(event.relatedTarget)) play();
    });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) settle(); }).observe(card);
    }
    window.addEventListener('resize', () => { if (running) settle(); });
    reducedMotion.addEventListener('change', syncPreference);
    document.addEventListener('motionpreferencechange', syncPreference);
    document.addEventListener('visibilitychange', syncPreference);
    syncPreference();
})();
