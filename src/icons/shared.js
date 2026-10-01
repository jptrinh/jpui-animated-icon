// Small builders for icon definitions. An element is `{ tag, attrs, children?, normal?,
// animate?, transition?, origin? }` on Lucide's 24×24 grid (see engine.js for the values).

export const el = (tag, attrs = {}, motion = {}) => ({ tag, attrs, ...motion });
export const path = (d, motion) => el('path', { d }, motion);
export const circle = (cx, cy, r, motion, extra = {}) => el('circle', { cx, cy, r, ...extra }, motion);
export const line = (x1, y1, x2, y2, motion) => el('line', { x1, y1, x2, y2 }, motion);
export const rect = (x, y, width, height, rx, motion, extra = {}) =>
    el('rect', { x, y, width, height, ...(rx === undefined ? {} : { rx }), ...extra }, motion);
export const g = (children, motion = {}) => ({ tag: 'g', attrs: {}, children, ...motion });

// lucide-animated sizes its icons 28px: a px move on the whole <svg> = 24/28 of a grid unit.
export const PX = 24 / 28;

// Go and come back along one axis (lucide-animated's panel / chevron pattern).
export const nudge = (axis, amount, duration = 0.5) => ({
    normal: { [axis]: 0 },
    animate: { [axis]: [0, amount, 0] },
    transition: { times: [0, 0.4, 1], duration },
});

// Draw a stroke (lucide-animated's check / x pattern).
export const draw = (delay = 0) => ({
    normal: { opacity: 1, pathLength: 1, transition: { duration: 0.3, opacity: { duration: 0.1 } } },
    animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.4, delay, opacity: { duration: 0.1, delay } },
    },
});

// Wobble around an origin (a tag on its hole, a pencil on its tip).
export const swing = (angles, origin, duration = 0.6) => ({
    origin,
    normal: { rotate: 0 },
    animate: { rotate: angles },
    transition: { duration, ease: 'easeInOut' },
});
