// Spring engine + icon data. Run: npm test (plain node, no dependency)
import assert from 'node:assert/strict';
import { createAnimator, poseOf, poseToStyle, DEFAULT_POSE } from '../src/spring.js';
import { ICONS, ICON_OPTIONS, DEFAULT_ICON } from '../src/icons/index.js';

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);
const FRAME = 1 / 60;
const pose = (animator, id) => animator.poses().find(p => p.id === id).pose;

// Run until rest; returns [seconds, every frame's poses].
function settle(animator, maxSeconds = 3) {
    const frames = [];
    for (let t = 0; t < maxSeconds; t += FRAME) {
        const done = animator.step(FRAME);
        frames.push(animator.poses());
        if (done) return [t + FRAME, frames];
    }
    throw new Error('did not settle');
}

// Poses
assert.deepEqual(poseOf({}, 'normal'), DEFAULT_POSE);
assert.deepEqual(poseOf({ animate: { y: -1.1 } }, 'animate'), { ...DEFAULT_POSE, y: -1.1 });
assert.deepEqual(poseOf({ animate: { y: 'x', rotate: NaN } }, 'animate'), DEFAULT_POSE, 'non-numbers ignored');
assert.equal(poseToStyle({ y: -1.10000004 }).transform, 'translate(0px, -1.1px) rotate(0deg) scale(1)');
assert.equal(poseToStyle({ opacity: 3 }).opacity, '1');

// Trash: starts at rest on normal
const trash = createAnimator(ICONS.trash);
assert.ok(trash.isAtRest());
assert.equal(pose(trash, 'lid').y, 0);

// To `animate`: settles on the target, with the slight overshoot of a 500 / 30 spring
trash.setTarget('animate');
const [inTime, inFrames] = settle(trash);
near(pose(trash, 'lid').y, -1.1);
near(pose(trash, 'can').y, 1);
near(pose(trash, 'lines').y, 0.5);
const lowestLid = Math.min(...inFrames.map(f => f.find(p => p.id === 'lid').pose.y));
assert.ok(lowestLid < -1.1, 'lid overshoots');
assert.ok(inTime < 1, `settles in under 1 s (${inTime.toFixed(2)} s)`);

// Back to normal
trash.setTarget('normal');
settle(trash);
near(pose(trash, 'lid').y, 0);

// Retarget mid-flight: no jump between two frames
trash.setTarget('animate');
for (let i = 0; i < 5; i++) trash.step(FRAME);
const before = pose(trash, 'lid').y;
trash.setTarget('normal');
trash.step(FRAME);
assert.ok(Math.abs(pose(trash, 'lid').y - before) < 0.2, 'continuous after retarget');
settle(trash);

// Snap (reduced motion / initial state)
trash.setTarget('animate');
trash.snap();
near(pose(trash, 'lid').y, -1.1);
assert.ok(trash.isAtRest());

// A huge frame (tab in background) stays stable
const big = createAnimator(ICONS.trash);
big.setTarget('animate');
big.step(10);
assert.ok(Number.isFinite(pose(big, 'lid').y));
assert.ok(Math.abs(pose(big, 'lid').y) < 3, 'no blow-up');

// Bad input never throws
createAnimator(undefined).step(FRAME);
createAnimator({ parts: [{ id: 'a' }], transition: { mass: 0 } }).step(FRAME);

// Registry
assert.ok(ICONS[DEFAULT_ICON]);
assert.deepEqual(ICON_OPTIONS, [{ value: 'trash', label: 'Trash' }]);
for (const [name, icon] of Object.entries(ICONS)) {
    assert.ok(Array.isArray(icon.parts) && icon.parts.length, `${name}: parts`);
    for (const part of icon.parts) {
        assert.ok(part.id, `${name}: part id`);
        for (const [tag, attrs] of part.elements) {
            assert.ok(['path', 'line', 'circle', 'rect', 'polyline', 'polygon', 'ellipse'].includes(tag), `${name}: ${tag}`);
            assert.equal(typeof attrs, 'object');
        }
    }
}

console.log('spring + icons: all tests passed');
