// Icons ported from lucide-animated (MIT, pqoqubbw) — https://github.com/pqoqubbw/icons
// Same paths, same variants, same transitions. Keys are the Lucide names.
import { PX, circle, draw, el, g, line, nudge, path, rect } from './shared.js';

const panel = (dividerX, arrow, amount) => ({
    elements: [rect(3, 3, 18, 18, 2), path(`M${dividerX} 3v18`), path(arrow, nudge('x', amount))],
});

export default {
    archive: {
        elements: [
            rect(2, 3, 20, 5, 1, {
                normal: { y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } },
                animate: { y: -1.5, transition: { type: 'spring', stiffness: 200, damping: 25 } },
            }),
            path('M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8', {
                normal: { d: 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8' },
                animate: { d: 'M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V11' },
            }),
            path('M10 12h4', { normal: { d: 'M10 12h4' }, animate: { d: 'M10 15h4' } }),
        ],
    },
    'arrow-left': {
        elements: [
            path('m12 19-7-7 7-7', {
                normal: { x: 0 },
                animate: { x: [0, 3, 0], transition: { duration: 0.4 } },
            }),
            path('M19 12H5', {
                normal: { d: 'M19 12H5' },
                animate: { d: ['M19 12H5', 'M19 12H10', 'M19 12H5'], transition: { duration: 0.4 } },
            }),
        ],
    },
    'arrow-right': {
        elements: [
            path('M5 12h14', {
                normal: { d: 'M5 12h14' },
                animate: { d: ['M5 12h14', 'M5 12h9', 'M5 12h14'], transition: { duration: 0.4 } },
            }),
            path('m12 5 7 7-7 7', {
                normal: { x: 0 },
                animate: { x: [0, -3, 0], transition: { duration: 0.4 } },
            }),
        ],
    },
    check: {
        elements: [
            path('M4 12 9 17L20 6', {
                normal: { opacity: 1, pathLength: 1, scale: 1, transition: { duration: 0.3, opacity: { duration: 0.1 } } },
                animate: {
                    opacity: [0, 1],
                    pathLength: [0, 1],
                    scale: [0.5, 1],
                    transition: { duration: 0.4, opacity: { duration: 0.1 } },
                },
            }),
        ],
    },
    'chevron-up': {
        elements: [path('m18 15-6-6-6 6', nudge('y', -2))],
    },
    'circle-check': {
        elements: [circle(12, 12, 10), path('m9 12 2 2 4-4', draw())],
    },
    copy: {
        transition: { type: 'spring', stiffness: 160, damping: 17, mass: 1 },
        elements: [
            rect(8, 8, 14, 14, 2, { normal: { x: 0, y: 0 }, animate: { x: -3, y: -3 } }, { ry: 2 }),
            path('M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2', {
                normal: { x: 0, y: 0 },
                animate: { x: 3, y: 3 },
            }),
        ],
    },
    eye: {
        transition: { duration: 0.4, ease: 'easeInOut' },
        elements: [
            path('M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0', {
                normal: { scaleY: 1, opacity: 1 },
                animate: { scaleY: [1, 0.1, 1], opacity: [1, 0.3, 1] },
            }),
            circle(12, 12, 3, { normal: { scale: 1, opacity: 1 }, animate: { scale: [1, 0.3, 1], opacity: [1, 0.3, 1] } }),
        ],
    },
    'folder-input': {
        elements: [
            path('M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1'),
            g([path('M2 13h10'), path('m9 16 3-3-3-3')], nudge('x', 2)),
        ],
    },
    'gallery-horizontal-end': {
        // `custom` i = 2 then 1: translateX [2i, 0], delay 0.25 × (2 − i)
        elements: [
            path('M6 5v14', {
                normal: { x: 0, opacity: 1, transition: { type: 'tween' } },
                animate: { x: [4, 0], opacity: [0, 1], transition: { type: 'tween', delay: 0 } },
            }),
            path('M2 7v10', {
                normal: { x: 0, opacity: 1, transition: { type: 'tween' } },
                animate: { x: [2, 0], opacity: [0, 1], transition: { type: 'tween', delay: 0.25 } },
            }),
            rect(10, 3, 12, 18, 2),
        ],
    },
    lock: {
        root: {
            normal: { rotate: 0, scale: 1 },
            animate: { rotate: [-3, 1, -2, 0], scale: [0.95, 1.05, 0.98, 1] },
            transition: { duration: 1, ease: [0.4, 0, 0.2, 1] },
        },
        elements: [
            rect(3, 11, 18, 11, 2),
            path('M7 11V7a5 5 0 0 1 10 0v4', {
                normal: { pathLength: 1 },
                animate: { pathLength: 0.7 },
                transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
            }),
        ],
    },
    'lock-open': {
        root: {
            normal: { rotate: 0, scale: 1 },
            animate: { rotate: [2, 4, -2, 0], scale: [1.05, 0.95, 1.02, 1] },
            transition: { duration: 1, ease: [0.4, 0, 0.2, 1] },
        },
        elements: [
            rect(3, 11, 18, 11, 2),
            path('M7 11V7a5 5 0 0 1 10 0v4', {
                normal: { pathLength: 0.8 },
                animate: { pathLength: 1 },
                transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
            }),
        ],
    },
    'panel-left-close': { ...panel(9, 'm16 15-3-3 3-3', -1.5) },
    'panel-left-open': { ...panel(9, 'm14 9 3 3-3 3', 1.5) },
    'panel-right-open': { ...panel(15, 'm10 15-3-3 3-3', -1.5) },
    plus: {
        root: { normal: { rotate: 0 }, animate: { rotate: 180 }, transition: { type: 'spring', stiffness: 100, damping: 15 } },
        elements: [path('M5 12h14'), path('M12 5v14')],
    },
    'refresh-cw': {
        root: { normal: { rotate: 0 }, animate: { rotate: 50 }, transition: { type: 'spring', stiffness: 250, damping: 25 } },
        elements: [
            path('M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8'),
            path('M21 3v5h-5'),
            path('M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16'),
            path('M8 16H3v5'),
        ],
    },
    search: {
        root: {
            normal: { x: 0, y: 0 },
            animate: { x: [0, 0, -3 * PX, 0], y: [0, -4 * PX, 0, 0] },
            transition: { duration: 1 },
        },
        elements: [circle(11, 11, 8), path('m21 21-4.3-4.3')],
    },
    sparkles: {
        elements: [
            path(
                'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
                {
                    normal: { y: 0, fill: 'none' },
                    animate: { y: [0, -1, 0, 0], fill: 'currentColor', transition: { duration: 1 } },
                }
            ),
            ...['M20 3v4', 'M22 5h-4', 'M4 17v2', 'M5 18H3'].map(d =>
                path(d, {
                    normal: { opacity: 1 },
                    animate: { opacity: [0, 1, 0, 0, 0, 0, 1], transition: { duration: 2 } },
                })
            ),
        ],
    },
    // lucide-animated `delete`; `trash` is kept as an alias (see index.js).
    'trash-2': {
        transition: { type: 'spring', stiffness: 500, damping: 30 },
        clickHold: 200,
        elements: [
            g([path('M3 6h18'), path('M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2')], { normal: { y: 0 }, animate: { y: -1.1 } }),
            path('M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8', { normal: { y: 0 }, animate: { y: 1 } }),
            g([line(10, 11, 10, 17), line(14, 11, 14, 17)], { normal: { y: 0 }, animate: { y: 0.5 } }),
        ],
    },
    upload: {
        elements: [
            path('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'),
            g([el('polyline', { points: '17 8 12 3 7 8' }), line(12, 3, 12, 15)], {
                normal: { y: 0 },
                animate: { y: -2, transition: { type: 'spring', stiffness: 200, damping: 10, mass: 1 } },
            }),
        ],
    },
    x: {
        elements: [
            path('M18 6 6 18', { normal: { opacity: 1, pathLength: 1 }, animate: { opacity: [0, 1], pathLength: [0, 1] } }),
            path('m6 6 12 12', {
                normal: { opacity: 1, pathLength: 1 },
                animate: { opacity: [0, 1], pathLength: [0, 1] },
                transition: { delay: 0.2 },
            }),
        ],
    },
};
