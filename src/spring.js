// Spring engine for the icon parts. Pure (no DOM, no wwLib) so it runs under `npm test`.
//
// Each icon part has two poses, `normal` and `animate`, made of the channels below.
// A part follows its target pose with a damped spring (same model as Motion's
// `type: 'spring'`: stiffness, damping, mass), so an animation can be retargeted
// mid-flight — hover out halfway, click again — without any jump.

export const DEFAULT_POSE = { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };
export const DEFAULT_SPRING = { stiffness: 500, damping: 30, mass: 1 };

const CHANNELS = Object.keys(DEFAULT_POSE);
const SUBSTEP = 1 / 500; // seconds — small enough to stay stable for stiff springs
const MAX_FRAME = 0.1; // a frame longer than this (tab in background) is clamped
const REST_DISTANCE = 0.001;
const REST_VELOCITY = 0.01;

const isNumber = value => typeof value === 'number' && Number.isFinite(value);

export function poseOf(part, state) {
    const overrides = (state === 'animate' ? part?.animate : part?.normal) || {};
    const pose = { ...DEFAULT_POSE };
    for (const channel of CHANNELS) {
        if (isNumber(overrides[channel])) pose[channel] = overrides[channel];
    }
    return pose;
}

export function createAnimator(icon) {
    const transition = icon?.transition || {};
    const spring = {
        stiffness: isNumber(transition.stiffness) ? transition.stiffness : DEFAULT_SPRING.stiffness,
        damping: isNumber(transition.damping) ? transition.damping : DEFAULT_SPRING.damping,
        mass: isNumber(transition.mass) && transition.mass > 0 ? transition.mass : DEFAULT_SPRING.mass,
    };
    const parts = (icon?.parts || []).map(def => ({
        id: def.id,
        def,
        pos: poseOf(def, 'normal'),
        vel: Object.fromEntries(CHANNELS.map(c => [c, 0])),
        goal: poseOf(def, 'normal'),
    }));
    let target = 'normal';

    const isAtRest = () =>
        parts.every(p =>
            CHANNELS.every(
                c => Math.abs(p.pos[c] - p.goal[c]) < REST_DISTANCE && Math.abs(p.vel[c]) < REST_VELOCITY
            )
        );

    return {
        get target() {
            return target;
        },
        setTarget(state) {
            target = state === 'animate' ? 'animate' : 'normal';
            for (const p of parts) p.goal = poseOf(p.def, target);
        },
        // Jump to the target pose, no motion (initial render, reduced motion).
        snap() {
            for (const p of parts) {
                p.pos = { ...p.goal };
                for (const c of CHANNELS) p.vel[c] = 0;
            }
        },
        // Advance by `dt` seconds. Returns true once every part rests on its goal.
        step(dt) {
            let remaining = Math.min(Math.max(dt, 0), MAX_FRAME);
            while (remaining > 0) {
                const h = Math.min(SUBSTEP, remaining);
                remaining -= h;
                for (const p of parts) {
                    for (const c of CHANNELS) {
                        const force = -spring.stiffness * (p.pos[c] - p.goal[c]) - spring.damping * p.vel[c];
                        p.vel[c] += (force / spring.mass) * h;
                        p.pos[c] += p.vel[c] * h;
                    }
                }
            }
            if (isAtRest()) {
                this.snap();
                return true;
            }
            return false;
        },
        isAtRest,
        poses() {
            return parts.map(p => ({ id: p.id, pose: { ...p.pos } }));
        },
    };
}

const round = value => Math.round(value * 10000) / 10000;

// CSS for one part. Units are SVG user units: 1px = 1 unit of the 24×24 viewBox.
export function poseToStyle(pose) {
    const { x, y, rotate, scale, opacity } = { ...DEFAULT_POSE, ...pose };
    return {
        transform: `translate(${round(x)}px, ${round(y)}px) rotate(${round(rotate)}deg) scale(${round(scale)})`,
        opacity: String(round(Math.min(Math.max(opacity, 0), 1))),
    };
}
