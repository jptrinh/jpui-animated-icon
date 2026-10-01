// Icon registry. Keys are Lucide names, so a WeWeb icon `lucide/<name>` maps to `<name>`.
// - ported.js: animations from lucide-animated, unchanged;
// - custom.js: Lucide icons lucide-animated does not cover, animated here.
// Adding an icon: an entry in one of those files (format in engine.js / shared.js), then the
// value in AI.json's `icon` options (`npm test` checks they match).
import ported from './ported.js';
import custom from './custom.js';

export const ICONS = { ...ported, ...custom };

// Old names still accepted (instances saved with them keep working).
export const ALIASES = { trash: 'trash-2', funnel: 'filter' };

export const DEFAULT_ICON = 'trash-2';

// Accepts `trash-2`, `lucide/trash-2` or an alias; unknown → null.
export function resolveIcon(name) {
    if (typeof name !== 'string') return null;
    const bare = name.trim().replace(/^lucide\//, '');
    const key = ICONS[bare] ? bare : ALIASES[bare];
    return key && ICONS[key] ? key : null;
}

// The label is the Lucide name itself, so the select shows what the icon is called in Lucide.
export const ICON_OPTIONS = Object.keys(ICONS)
    .sort()
    .map(value => ({ value, label: value }));
