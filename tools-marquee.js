/* Progressive enhancement: the original tools stay readable without JavaScript. */
(() => {
    'use strict';

    const section = document.getElementById('tools');
    const group = section?.querySelector(':scope > div > .flex.flex-wrap');
    if (!section || !group || section.classList.contains('tools-enhanced')) return;

    // Small monochrome marks inherit the portfolio palette. Labels remain the
    // accessible names; decorative SVGs are never announced a second time.
    const marks = {
        'SAP Concepts': '<path d="M2 5h21L15 20H2Z" fill="currentColor"/><text x="4" y="15.4" font-size="7.7" font-family="Arial,sans-serif" font-weight="bold" fill="white">SAP</text>',
        'JIRA': '<path d="m12 2 10 10-10 10L2 12Zm0 6-4 4 4 4 4-4Z" fill="currentColor" fill-rule="evenodd"/>',
        'Confluence': '<path d="M3 6c5-6 9 9 18 3M3 15c9-6 13 9 18 3" fill="none" stroke="currentColor" stroke-width="5"/>',
        'Visual Paradigm': '<g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="7" height="6" rx="1"/><rect x="15" y="16" width="7" height="6" rx="1"/><rect x="2" y="16" width="7" height="6" rx="1"/><path d="M5.5 8v8m0-4h13v4"/></g>',
        'Figma': '<g fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2H8a4 4 0 0 0 0 8h4zm0 8H8a4 4 0 0 0 0 8h4zm0 8H8a4 4 0 1 0 4 4V2h4a4 4 0 0 1 0 8h-4"/><circle cx="16" cy="14" r="4"/></g>',
        'Advanced Excel': '<g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="7" y="3" width="15" height="18" rx="1.5"/><path d="M15 3v18M7 9h15M7 15h15"/></g><rect x="1" y="7" width="12" height="11" rx="1" fill="currentColor"/><path d="m5 10 4 5m0-5-4 5" stroke="white" stroke-width="1.5"/>',
        'Python (Pandas)': '<path d="M12 2C7 2 6 3 6 6v3h7v1H4c-4 0-4 10 0 10h2v-4c0-3 2-4 5-4h6c3 0 3-2 3-5s-1-5-8-5Z" fill="currentColor"/><path d="M12 23c5 0 6-1 6-4v-3h-7v-1h9c4 0 4-10 0-10h-2v4c0 3-2 4-5 4H7c-3 0-3 2-3 5s1 5 8 5Z" fill="currentColor" opacity=".5"/><g fill="white"><circle cx="9" cy="5" r="1"/><circle cx="15" cy="20" r="1"/></g>',
        'Power BI': '<rect x="3" y="13" width="5" height="9" rx="1" fill="currentColor" opacity=".5"/><rect x="10" y="7" width="5" height="15" rx="1" fill="currentColor" opacity=".75"/><rect x="17" y="2" width="5" height="20" rx="1" fill="currentColor"/>',
        'Tableau': '<g stroke="currentColor" stroke-width="1.7"><path d="M12 6v12M6 12h12M4 2v6M1 5h6m13-3v6m-3-3h6M4 16v6m-3-3h6m13-3v6m-3-3h6M12 0v4m-2-2h4m-2 18v4m-2-2h4M0 12h4m-2-2v4m18-2h4m-2-2v4"/></g>',
        'Postman': '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m6 18 6-9 5-2-2 5Zm6-9 3 3m-9 6 1-4 3 3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
        'MySQL / PostgreSQL': '<g fill="none" stroke="currentColor" stroke-width="1.7"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/></g>',
        'Git & GitHub': '<path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.18-3.37-1.18-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 7c.85 0 1.71.11 2.51.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.33 4.68-4.56 4.93.36.31.68.92.68 1.85v2.58c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>',
        'Lovable': '<path d="M12 21S2 15 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 7-10 13-10 13Z" fill="currentColor"/>'
    };

    if (![...group.children].some((badge) => badge.textContent.trim() === 'Lovable')) {
        const badge = group.firstElementChild.cloneNode(true);
        badge.querySelector('span').textContent = 'Lovable';
        group.append(badge);
    }

    group.classList.add('tools-group');
    group.setAttribute('role', 'list');
    group.setAttribute('aria-label', 'Tools and platforms');
    [...group.children].forEach((badge) => {
        badge.classList.add('tool-badge');
        badge.setAttribute('role', 'listitem');
        const mark = marks[badge.textContent.trim()];
        if (!mark) return;
        const icon = document.createElement('span');
        icon.className = 'tool-mark';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = `<svg viewBox="0 0 24 26" width="24" height="26" focusable="false" aria-hidden="true">${mark}</svg>`;
        badge.prepend(icon);
    });

    const viewport = document.createElement('div');
    viewport.className = 'tools-viewport';
    viewport.id = 'tools-marquee';
    const track = document.createElement('div');
    track.className = 'tools-track';
    group.before(viewport);
    viewport.append(track);
    track.append(group);

    const copy = group.cloneNode(true);
    copy.classList.add('tools-copy');
    copy.removeAttribute('aria-label');
    copy.setAttribute('aria-hidden', 'true');
    copy.setAttribute('inert', '');
    track.append(copy);

    const controls = document.createElement('div');
    controls.className = 'tools-controls';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tools-motion-toggle';
    button.setAttribute('aria-controls', viewport.id);
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M5 3v10m6-10v10" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Pause tool motion</span>';
    controls.append(button);
    viewport.after(controls);
    section.classList.add('tools-enhanced');

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => {
        const staticMode = media.matches || document.documentElement.classList.contains('motion-paused');
        section.classList.toggle('tools-static', staticMode);
        button.hidden = staticMode;
    };
    button.addEventListener('click', () => {
        const paused = section.classList.toggle('tools-manually-paused');
        button.setAttribute('aria-pressed', String(paused));
        button.querySelector('span').textContent = paused ? 'Resume tool motion' : 'Pause tool motion';
        button.querySelector('path').setAttribute('d', paused ? 'm6 3 6 5-6 5Z' : 'M5 3v10m6-10v10');
    });
    media.addEventListener('change', syncPreference);
    document.addEventListener('motionpreferencechange', syncPreference);
    syncPreference();

    // Avoid running the transform while the tools are outside the viewport.
    if ('IntersectionObserver' in window) {
        section.classList.add('tools-outside');
        new IntersectionObserver(([entry]) => {
            section.classList.toggle('tools-outside', !entry.isIntersecting);
        }, { rootMargin: '100px' }).observe(section);
    }
})();
