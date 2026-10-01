// Engine + every icon. Run: npm test (plain node, no dependency)
import assert from 'node:assert/strict';
import { createAnimator, collectNodes, nodeOutput, parseNumericString, toEasing } from '../src/engine.js';
import { ICONS, ICON_OPTIONS, DEFAULT_ICON, resolveIcon } from '../src/icons/index.js';

const near = (a, b, eps = 1e-3) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);
const FRAME = 1 / 60;
const valueOf = (animator, id, key) => animator.frame().find(n => n.id === id).values[key];

function settle(animator, maxSeconds = 6) {
    const frames = [];
    for (let t = 0; t < maxSeconds; t += FRAME) {
        const done = animator.step(FRAME);
        frames.push(animator.frame());
        if (done) return [t + FRAME, frames];
    }
    throw new Error('did not settle');
}

// Easing
near(toEasing('linear')(0.3), 0.3);
near(toEasing('easeInOut')(0.5), 0.5);
near(toEasing([0.25, 0.1, 0.35, 1])(1), 1);
near(toEasing('unknown')(0.5), 0.5, 1e-2); // falls back to easeInOut
assert.ok(toEasing('easeOut')(0.2) > 0.2);

// Numeric strings
assert.deepEqual(parseNumericString('M4 8v11').nums, [4, 8, 11]);
assert.deepEqual(parseNumericString('a.5.5 0 0 1').nums, [0.5, 0.5, 0, 0, 1]);
assert.deepEqual(parseNumericString('m12 5 7 7-7 7').nums, [12, 5, 7, 7, -7, 7]);

// Trash: spring, overshoot, clickHold kept
const trash = createAnimator(ICONS['trash-2']);
assert.ok(trash.isAtRest());
trash.setTarget('animate');
const [trashTime, trashFrames] = settle(trash);
near(valueOf(trash, '0', 'y'), -1.1);
near(valueOf(trash, '1', 'y'), 1);
near(valueOf(trash, '2', 'y'), 0.5);
assert.ok(Math.min(...trashFrames.map(f => f[0].values.y)) < -1.1, 'lid overshoots');
assert.ok(trashTime < 1, `trash settles in under 1 s (${trashTime.toFixed(2)})`);
assert.equal(ICONS['trash-2'].clickHold, 200);

// Retarget mid-flight: continuous
trash.setTarget('normal');
for (let i = 0; i < 5; i++) trash.step(FRAME);
const before = valueOf(trash, '0', 'y');
trash.setTarget('animate');
trash.step(FRAME);
assert.ok(Math.abs(valueOf(trash, '0', 'y') - before) < 0.2, 'no jump on retarget');

// Path morph (archive): `d` interpolated number by number
const archive = createAnimator(ICONS.archive);
archive.setTarget('animate');
archive.step(0.15);
const midD = nodeOutput(['d'], { d: valueOf(archive, '1', 'd') }).attrs.d;
assert.match(midD, /^M4 (9|10)\.\d+v/, `mid-morph d: ${midD}`);
settle(archive);
assert.equal(nodeOutput(['d'], { d: valueOf(archive, '1', 'd') }).attrs.d, 'M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V11');

// Delay: the X's 2nd stroke holds its first keyframe (hidden) during its delay
const x = createAnimator(ICONS.x);
x.setTarget('animate');
x.step(0.1);
assert.equal(valueOf(x, '1', 'pathLength'), 0);
assert.equal(valueOf(x, '1', 'opacity'), 0);
assert.ok(valueOf(x, '0', 'pathLength') > 0);
settle(x);
assert.equal(valueOf(x, '1', 'pathLength'), 1);

// Discrete value (sparkles fill) switches when its animation starts
const sparkles = createAnimator(ICONS.sparkles);
sparkles.setTarget('animate');
sparkles.step(FRAME);
assert.equal(valueOf(sparkles, '0', 'fill'), 'currentColor');
settle(sparkles);
sparkles.setTarget('normal');
settle(sparkles);
assert.equal(valueOf(sparkles, '0', 'fill'), 'none');

// Root node (whole-svg animation)
assert.ok(collectNodes(ICONS.plus).some(n => n.id === 'root'));
const plus = createAnimator(ICONS.plus);
plus.setTarget('animate');
settle(plus);
near(valueOf(plus, 'root', 'rotate'), 180);

// Output
const out = nodeOutput(['x', 'y', 'opacity', 'pathLength'], { x: 1, y: -2, opacity: 0.5, pathLength: 0.25 });
assert.equal(out.style.transform, 'translate(1px, -2px) scale(1, 1) rotate(0deg)');
assert.equal(out.style.opacity, '0.5');
assert.equal(out.style.strokeDasharray, '0.25 1');
assert.equal(out.attrs.pathLength, '1');

// Every icon: valid tree, animates, settles, comes back to rest, no NaN
const TAGS = ['path', 'line', 'circle', 'rect', 'polyline', 'polygon', 'ellipse', 'g'];
const walk = (elements, fn) => (elements || []).forEach(el => (fn(el), walk(el.children, fn)));
for (const [name, icon] of Object.entries(ICONS)) {
    assert.ok(icon.label, `${name}: label`);
    walk(icon.elements, el => assert.ok(TAGS.includes(el.tag), `${name}: tag ${el.tag}`));
    const nodes = collectNodes(icon);
    assert.ok(nodes.length > 0, `${name}: has animated nodes`);
    // string keyframes must share their shape, or they cannot be interpolated
    for (const node of nodes) {
        for (const variant of [node.normal, node.animate]) {
            for (const [key, value] of Object.entries(variant)) {
                const list = (Array.isArray(value) ? value : [value]).filter(v => typeof v === 'string' && /\d/.test(v));
                if (list.length < 2) continue;
                const shapes = list.map(v => parseNumericString(v).parts.join('|'));
                assert.ok(shapes.every(s => s === shapes[0]), `${name}: ${key} keyframes differ in shape`);
            }
        }
    }
    const animator = createAnimator(icon);
    const rest = JSON.stringify(animator.frame());
    animator.setTarget('animate');
    assert.ok(!animator.isAtRest(), `${name}: animate does something`);
    const [time, frames] = settle(animator);
    assert.ok(time < 3, `${name}: settles in ${time.toFixed(2)} s`);
    for (const frame of frames) {
        for (const node of frame) {
            const { style, attrs } = nodeOutput(node.keys, node.values);
            for (const v of [...Object.values(style), ...Object.values(attrs)]) {
                assert.ok(!String(v).includes('NaN') && !String(v).includes('undefined'), `${name}: bad output ${v}`);
            }
        }
    }
    animator.setTarget('normal');
    settle(animator);
    assert.equal(JSON.stringify(animator.frame()), rest, `${name}: back to rest`);
}

// Registry
assert.ok(ICONS[DEFAULT_ICON]);
assert.equal(resolveIcon('lucide/trash-2'), 'trash-2');
assert.equal(resolveIcon('trash'), 'trash-2');
assert.equal(resolveIcon('nope'), null);
assert.equal(resolveIcon(undefined), null);
assert.equal(ICON_OPTIONS.length, Object.keys(ICONS).length);

console.log(`engine + ${Object.keys(ICONS).length} icons: all tests passed`);

// isSettled: a click can come back long before a spring's last thousandths
const plusClick = createAnimator(ICONS.plus);
plusClick.setTarget('animate');
let settledAt = null;
for (let t = 0; t < 3; t += FRAME) {
    if (plusClick.step(FRAME)) break;
    if (settledAt === null && plusClick.isSettled()) settledAt = t;
}
assert.ok(settledAt !== null && settledAt < 1, `plus settled visually at ${settledAt}`);
const tween = createAnimator(ICONS['chevron-up']);
tween.setTarget('animate');
tween.step(0.2);
assert.equal(tween.isSettled(), false, 'a running tween is not settled');
console.log('isSettled: ok');
