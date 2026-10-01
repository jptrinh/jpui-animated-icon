// Trash — ported from lucide-animated `delete` (MIT, pqoqubbw), Lucide paths.
// Original motion: the lid rises 1.1, the can drops 1 (its path moves down by a whole
// unit) and the inner lines drop 0.5, all on a 500 / 30 spring.
export default {
    label: 'Trash',
    source: 'https://github.com/pqoqubbw/icons/blob/main/icons/delete.tsx',
    parts: [
        {
            id: 'lid',
            elements: [
                ['path', { d: 'M3 6h18' }],
                ['path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }],
            ],
            animate: { y: -1.1 },
        },
        {
            id: 'can',
            elements: [['path', { d: 'M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8' }]],
            animate: { y: 1 },
        },
        {
            id: 'lines',
            elements: [
                ['line', { x1: 10, x2: 10, y1: 11, y2: 17 }],
                ['line', { x1: 14, x2: 14, y1: 11, y2: 17 }],
            ],
            animate: { y: 0.5 },
        },
    ],
    transition: { stiffness: 500, damping: 30 },
    // Click = go to `animate`, stay this long, come back.
    clickHold: 200,
};
