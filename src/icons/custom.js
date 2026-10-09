// Icons with no lucide-animated version: Lucide paths, animations designed here in the same
// spirit (small moves, ~0.5 s, the shape comes back to rest). Keys are the Lucide names.
import { circle, draw, g, line, nudge, path, rect, swing } from './shared.js';

const SPRING_HOLD = { type: 'spring', stiffness: 200, damping: 10, mass: 1 }; // upload's
const pulse = (amount, origin = '50% 50%', duration = 0.5) => ({
    origin,
    normal: { scale: 1 },
    animate: { scale: [1, amount, 1] },
    transition: { times: [0, 0.4, 1], duration },
});
const shift = (x, y, duration = 0.5) => ({
    normal: { x: 0, y: 0 },
    animate: { x: [0, x, 0], y: [0, y, 0] },
    transition: { times: [0, 0.4, 1], duration },
});
const SQUARE = () => rect(3, 3, 18, 18, 2);

export default {
    'a-large-small': {
        elements: [
            g([path('m15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16'), path('M15.697 14h5.606')], pulse(0.85, '50% 100%')),
            g([path('m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16'), path('M3.304 13h6.392')], pulse(1.12, '50% 100%')),
        ],
    },
    'archive-restore': {
        elements: [
            rect(2, 3, 20, 5, 1, {
                normal: { y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } },
                animate: { y: -1.5, transition: { type: 'spring', stiffness: 200, damping: 25 } },
            }),
            path('M4 8v11a2 2 0 0 0 2 2h2'),
            path('M20 8v11a2 2 0 0 1-2 2h-2'),
            g([path('m9 15 3-3 3 3'), path('M12 12v9')], nudge('y', -2)),
        ],
    },
    'arrow-right-left': {
        elements: [
            g([path('m16 3 4 4-4 4'), path('M20 7H4')], nudge('x', 2)),
            g([path('m8 21-4-4 4-4'), path('M4 17h16')], nudge('x', -2)),
        ],
    },
    'circle-alert': {
        elements: [
            circle(12, 12, 10),
            g([line(12, 8, 12, 12), line(12, 16, 12.01, 16)], swing([0, -14, 10, -6, 0], '50% 100%')),
        ],
    },
    'circle-minus': { elements: [circle(12, 12, 10), path('M8 12h8', draw())] },
    'circle-x': {
        elements: [circle(12, 12, 10), path('m15 9-6 6', draw()), path('m9 9 6 6', draw(0.2))],
    },
    crop: {
        elements: [path('M6 2v14a2 2 0 0 0 2 2h14', shift(-1.5, 1.5)), path('M18 22V8a2 2 0 0 0-2-2H2', shift(1.5, -1.5))],
    },
    ellipsis: {
        elements: [5, 12, 19].map((cx, i) =>
            circle(cx, 12, 1, {
                normal: { y: 0 },
                animate: { y: [0, -2, 0] },
                transition: { times: [0, 0.4, 1], duration: 0.4, delay: i * 0.1 },
            })
        ),
    },
    // Lucide renamed it `funnel`; WeWeb's set still calls it `filter`.
    filter: {
        elements: [
            path(
                'M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z',
                {
                    origin: '50% 0%',
                    normal: { scaleY: 1 },
                    animate: { scaleY: [1, 0.85, 1.05, 1] },
                    transition: { times: [0, 0.35, 0.7, 1], duration: 0.5 },
                }
            ),
        ],
    },
    folder: {
        elements: [
            path(
                'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
                nudge('y', -1.5)
            ),
        ],
    },
    fullscreen: {
        elements: [
            path('M3 7V5a2 2 0 0 1 2-2h2', shift(-1.5, -1.5)),
            path('M17 3h2a2 2 0 0 1 2 2v2', shift(1.5, -1.5)),
            path('M21 17v2a2 2 0 0 1-2 2h-2', shift(1.5, 1.5)),
            path('M7 21H5a2 2 0 0 1-2-2v-2', shift(-1.5, 1.5)),
            rect(7, 8, 10, 8, 1, pulse(1.15)),
        ],
    },
    'grid-2x2': {
        elements: [
            g([path('M12 3v18'), path('M3 12h18')], {
                normal: { rotate: 0 },
                animate: { rotate: 90 },
                transition: { type: 'spring', stiffness: 150, damping: 15 },
            }),
            rect(3, 3, 18, 18, 2),
        ],
    },
    image: {
        elements: [
            rect(3, 3, 18, 18, 2, undefined, { ry: 2 }),
            circle(9, 9, 2, {
                normal: { y: 0, scale: 1 },
                animate: { y: [0, -1.5, 0], scale: [1, 1.2, 1] },
                transition: { times: [0, 0.4, 1], duration: 0.6 },
            }),
            path('m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'),
        ],
    },
    images: {
        elements: [
            g(
                [
                    path('m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16'),
                    circle(13, 7, 1, undefined, { fill: 'currentColor' }),
                    rect(8, 2, 14, 14, 2),
                ],
                shift(1, -1)
            ),
            path('M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2', shift(-1, 1)),
        ],
    },
    'list-plus': {
        elements: [
            path('M16 5H3'),
            path('M11 12H3'),
            path('M16 19H3'),
            g([path('M18 9v6'), path('M21 12h-6')], {
                normal: { rotate: 0 },
                animate: { rotate: 90 },
                transition: { type: 'spring', stiffness: 100, damping: 15 },
            }),
        ],
    },
    'mouse-pointer-2': {
        elements: [
            path(
                'M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z',
                {
                    origin: '0% 0%',
                    normal: { x: 0, y: 0, scale: 1 },
                    animate: { x: [0, -1, 0], y: [0, -1, 0], scale: [1, 0.88, 1] },
                    transition: { times: [0, 0.4, 1], duration: 0.4 },
                }
            ),
        ],
    },
    'panel-left': { elements: [SQUARE(), path('M9 3v18', nudge('x', 1.5))] },
    'panel-right': { elements: [SQUARE(), path('M15 3v18', nudge('x', -1.5))] },
    'panel-bottom-close': {
        elements: [SQUARE(), path('M3 15h18'), path('m15 8-3 3-3-3', nudge('y', 1.5))],
    },
    'panel-bottom-open': {
        elements: [SQUARE(), path('M3 15h18'), path('m9 10 3-3 3 3', nudge('y', -1.5))],
    },
    'panel-right-close': {
        elements: [SQUARE(), path('M15 3v18'), path('m8 9 3 3-3 3', nudge('x', 1.5))],
    },
    pencil: {
        elements: [
            g(
                [
                    path(
                        'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'
                    ),
                    path('m15 5 4 4'),
                ],
                swing([0, -10, 8, -4, 0], '0% 100%')
            ),
        ],
    },
    ratio: {
        elements: [rect(6, 2, 12, 20, 2, pulse(0.9)), rect(2, 6, 20, 12, 2, pulse(1.08))],
    },
    share: {
        elements: [
            g([path('M12 2v13'), path('m16 6-4-4-4 4')], {
                normal: { y: 0 },
                animate: { y: -2, transition: SPRING_HOLD },
            }),
            path('M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8'),
        ],
    },
    square: { elements: [rect(3, 3, 18, 18, 2, pulse(0.88, '50% 50%', 0.4))] },
    'square-check': { elements: [SQUARE(), path('m16 9-5.5 5.5L8 12', draw())] },
    'square-minus': { elements: [SQUARE(), path('M8 12h8', draw())] },
    tag: {
        elements: [
            g(
                [
                    path(
                        'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z'
                    ),
                    circle(7.5, 7.5, 0.5, undefined, { fill: 'currentColor' }),
                ],
                swing([0, -12, 8, -4, 0], '27.5% 27.5%', 0.7)
            ),
        ],
    },
    tags: {
        elements: [
            g(
                [
                    path(
                        'M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z'
                    ),
                    path('M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193'),
                    circle(10.5, 6.5, 0.5, undefined, { fill: 'currentColor' }),
                ],
                swing([0, -10, 7, -3, 0], '43% 23%', 0.7)
            ),
        ],
    },
};
