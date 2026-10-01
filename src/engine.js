// Animation engine for the icons. Pure (no DOM, no wwLib) so it runs under `npm test`.
//
// It follows Motion's model, so lucide-animated icons port almost line for line:
// - every animated SVG node has two variants, `normal` and `animate`;
// - a value is a number (x, y, rotate, scale, opacity, pathLength, an attribute…), a
//   string with numbers (`d`, `points`: interpolated number by number) or a discrete value
//   (`fill`: set when its animation starts);
// - a target is a value or an array of keyframes;
// - transitions are Motion's: `{ type: 'spring', stiffness, damping, mass }` or a tween
//   `{ duration, ease, times }`, plus `delay`, per-value overrides (`opacity: { … }`) and
//   Motion's defaults when nothing is said.
// Springs keep their velocity when retargeted, so a hover-out halfway never jumps.

export const DEFAULTS = { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, rotate: 0, opacity: 1, pathLength: 1 };
export const TRANSFORM_KEYS = ['x', 'y', 'scale', 'scaleX', 'scaleY', 'rotate'];
const ALIASES = { translateX: 'x', translateY: 'y' };
const DISCRETE_KEYS = new Set(['fill', 'stroke', 'visibility']);
const NOT_A_TRANSITION = new Set([
    'when',
    'delay',
    'delayChildren',
    'staggerChildren',
    'staggerDirection',
    'repeat',
    'repeatType',
    'repeatDelay',
    'from',
    'elapsed',
]);
const SUBSTEP = 1 / 500;
const MAX_FRAME = 0.1;
const REST_DISTANCE = 0.001;
const REST_VELOCITY = 0.01;

const isNumber = v => typeof v === 'number' && Number.isFinite(v);
const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);

// ---- Easing (Motion's named curves) --------------------------------------------------

function cubicBezier(x1, y1, x2, y2) {
    const ax = 3 * x1 - 3 * x2 + 1;
    const bx = 3 * x2 - 6 * x1;
    const cx = 3 * x1;
    const ay = 3 * y1 - 3 * y2 + 1;
    const by = 3 * y2 - 6 * y1;
    const cy = 3 * y1;
    const sampleX = t => ((ax * t + bx) * t + cx) * t;
    const sampleY = t => ((ay * t + by) * t + cy) * t;
    return x => {
        if (x <= 0) return 0;
        if (x >= 1) return 1;
        let lo = 0;
        let hi = 1;
        let t = x;
        for (let i = 0; i < 30; i++) {
            const dx = sampleX(t) - x;
            if (Math.abs(dx) < 1e-6) break;
            if (dx > 0) hi = t;
            else lo = t;
            t = (lo + hi) / 2;
        }
        return sampleY(t);
    };
}

const backOut = cubicBezier(0.33, 1.53, 0.69, 0.99);
const EASINGS = {
    linear: t => t,
    easeIn: cubicBezier(0.42, 0, 1, 1),
    easeOut: cubicBezier(0, 0, 0.58, 1),
    easeInOut: cubicBezier(0.42, 0, 0.58, 1),
    circIn: t => 1 - Math.sin(Math.acos(clamp01(t))),
    circOut: t => Math.sin(Math.acos(1 - clamp01(t))),
    backOut,
    backIn: t => 1 - backOut(1 - t),
    anticipate: t => ((t *= 2) < 1 ? 0.5 * (1 - backOut(1 - t)) : 0.5 * (2 - Math.pow(2, -10 * (t - 1)))),
};

export function toEasing(ease) {
    if (typeof ease === 'function') return ease;
    if (Array.isArray(ease) && ease.length === 4 && ease.every(isNumber)) return cubicBezier(...ease);
    return EASINGS[ease] || EASINGS.easeInOut;
}

// ---- Values ---------------------------------------------------------------------------

const NUMBER_RE = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

// "M4 8v11" → { parts: ['M', ' ', 'v', ''], nums: [4, 8, 11] }
export function parseNumericString(str) {
    const nums = [];
    const parts = String(str).split(NUMBER_RE);
    for (const m of String(str).matchAll(NUMBER_RE)) nums.push(parseFloat(m[0]));
    return { parts, nums };
}

const round = v => Math.round(v * 10000) / 10000;

function formatNumericString({ parts, nums }) {
    let out = parts[0];
    for (let i = 0; i < nums.length; i++) out += round(nums[i]) + parts[i + 1];
    return out;
}

const sameShape = (a, b) => a.nums.length === b.nums.length && a.parts.join('|') === b.parts.join('|');

function lerpValue(a, b, t) {
    if (isNumber(a) && isNumber(b)) return a + (b - a) * t;
    if (a && b && typeof a === 'object' && typeof b === 'object' && sameShape(a, b)) {
        return { parts: a.parts, nums: a.nums.map((n, i) => n + (b.nums[i] - n) * t) };
    }
    return t < 1 ? a : b;
}

function normalizeValue(key, value) {
    if (DISCRETE_KEYS.has(key)) return value;
    if (isNumber(value)) return value;
    if (typeof value === 'string') {
        const n = Number(value.replace(/deg$/, ''));
        if (value.trim() !== '' && Number.isFinite(n)) return n;
        return parseNumericString(value);
    }
    return value;
}

export function formatValue(value) {
    if (isNumber(value)) return round(value);
    if (value && typeof value === 'object' && Array.isArray(value.nums)) return formatNumericString(value);
    return value;
}

function valuesEqual(a, b) {
    if (isNumber(a) && isNumber(b)) return Math.abs(a - b) < REST_DISTANCE;
    if (a && b && typeof a === 'object' && typeof b === 'object') {
        return sameShape(a, b) && a.nums.every((n, i) => Math.abs(n - b.nums[i]) < REST_DISTANCE);
    }
    return a === b;
}

// ---- Nodes ----------------------------------------------------------------------------

function variantValues(variant) {
    const out = {};
    for (const [rawKey, value] of Object.entries(variant || {})) {
        if (rawKey === 'transition') continue;
        out[ALIASES[rawKey] || rawKey] = value;
    }
    return out;
}

// Flattens the icon's element tree. The optional `root` animates a <g> around everything
// (lucide-animated's `motion.svg`); it is node 'root'.
export function collectNodes(icon) {
    const nodes = [];
    const walk = (elements, prefix) =>
        (elements || []).forEach((el, index) => {
            const id = prefix ? `${prefix}.${index}` : String(index);
            nodes.push({ id, def: el });
            walk(el.children, id);
        });
    if (icon?.root) nodes.push({ id: 'root', def: { ...icon.root, tag: 'g', origin: icon.root.origin || 'view-box' } });
    walk(icon?.elements, '');
    return nodes
        .map(({ id, def }) => {
            const normal = variantValues(def.normal);
            const animate = variantValues(def.animate);
            const keys = [...new Set([...Object.keys(normal), ...Object.keys(animate)])];
            return { id, def, normal, animate, keys };
        })
        .filter(n => n.keys.length);
}

function baseValue(node, key) {
    const fromNormal = node.normal[key];
    if (fromNormal !== undefined) return normalizeValue(key, Array.isArray(fromNormal) ? fromNormal.at(-1) : fromNormal);
    if (key in DEFAULTS) return DEFAULTS[key];
    const attr = node.def.attrs?.[key];
    return attr === undefined ? undefined : normalizeValue(key, attr);
}

// ---- Transitions ----------------------------------------------------------------------

function transitionFor(icon, node, state, key) {
    const variant = state === 'animate' ? node.def.animate : node.def.normal;
    const t = variant?.transition || node.def.transition || icon?.transition || {};
    const own = t[key] && typeof t[key] === 'object' && !Array.isArray(t[key]) ? t[key] : null;
    return own || t.default || t;
}

// Motion's isTransitionDefined: anything beyond timing / orchestration keys.
const isDefined = t => Object.keys(t).some(k => !NOT_A_TRANSITION.has(k));

// Motion's getDefaultTransition, for a value whose transition says nothing.
function defaultTransition(key, keyframes) {
    if (keyframes.length > 2) return { type: 'tween', duration: 0.8 };
    if (TRANSFORM_KEYS.includes(key)) {
        if (key.startsWith('scale')) {
            return { type: 'spring', stiffness: 550, damping: keyframes.at(-1) === 0 ? 2 * Math.sqrt(550) : 30 };
        }
        return { type: 'spring', stiffness: 500, damping: 25 };
    }
    return { type: 'tween', duration: 0.3, ease: [0.25, 0.1, 0.35, 1] };
}

function buildAnimation(icon, node, state, key, current, velocity) {
    const raw = state === 'animate' ? node.animate[key] : node.normal[key];
    const target = raw === undefined ? baseValue(node, key) : raw;
    if (target === undefined) return null;

    let keyframes = (Array.isArray(target) ? target : [target]).map(v =>
        v === null ? current : normalizeValue(key, v)
    );
    if (!Array.isArray(target)) keyframes = [current, keyframes[0]];
    if (keyframes[0] === undefined) keyframes[0] = keyframes[1];

    const declared = transitionFor(icon, node, state, key);
    const delay = isNumber(declared.delay) ? Math.max(declared.delay, 0) : 0;
    const transition = isDefined(declared) ? declared : { ...defaultTransition(key, keyframes), delay };

    if (DISCRETE_KEYS.has(key)) return { kind: 'discrete', value: keyframes.at(-1), delay, elapsed: 0 };

    const numeric = keyframes.every(isNumber);
    if (transition.type === 'spring' && numeric && keyframes.length <= 2) {
        return {
            kind: 'spring',
            from: keyframes[0],
            to: keyframes.at(-1),
            pos: keyframes[0],
            vel: Array.isArray(target) ? 0 : velocity || 0,
            stiffness: isNumber(transition.stiffness) ? transition.stiffness : 100,
            damping: isNumber(transition.damping) ? transition.damping : 10,
            mass: isNumber(transition.mass) && transition.mass > 0 ? transition.mass : 1,
            delay,
            elapsed: 0,
        };
    }

    const duration = isNumber(transition.duration) && transition.duration > 0 ? transition.duration : 0.3;
    const count = keyframes.length;
    const times =
        Array.isArray(transition.times) && transition.times.length === count
            ? transition.times
            : keyframes.map((_, i) => (count === 1 ? 1 : i / (count - 1)));
    const ease = transition.ease;
    const eases =
        Array.isArray(ease) && !(ease.length === 4 && ease.every(isNumber))
            ? keyframes.slice(1).map((_, i) => toEasing(ease[i]))
            : keyframes.slice(1).map(() => toEasing(ease));
    return { kind: 'tween', keyframes, times, eases, duration, delay, elapsed: 0 };
}

function sampleTween(anim) {
    const t = clamp01((anim.elapsed - anim.delay) / anim.duration);
    const { keyframes, times, eases } = anim;
    if (keyframes.length === 1) return keyframes[0];
    let i = 0;
    while (i < times.length - 2 && t > times[i + 1]) i++;
    const span = times[i + 1] - times[i];
    const local = span > 0 ? clamp01((t - times[i]) / span) : 1;
    return lerpValue(keyframes[i], keyframes[i + 1], eases[i](local));
}

// ---- Animator -------------------------------------------------------------------------

export function createAnimator(icon) {
    const nodes = collectNodes(icon);
    const values = {};
    const velocities = {};
    const running = {};
    let target = 'normal';

    for (const node of nodes) {
        values[node.id] = {};
        velocities[node.id] = {};
        running[node.id] = {};
        for (const key of node.keys) values[node.id][key] = baseValue(node, key);
    }

    function finalValue(node, key) {
        const raw = target === 'animate' ? node.animate[key] : node.normal[key];
        if (raw === undefined) return baseValue(node, key);
        return normalizeValue(key, Array.isArray(raw) ? raw.at(-1) : raw);
    }

    return {
        nodes,
        get target() {
            return target;
        },
        setTarget(state) {
            target = state === 'animate' ? 'animate' : 'normal';
            for (const node of nodes) {
                for (const key of node.keys) {
                    const anim = buildAnimation(
                        icon,
                        node,
                        target,
                        key,
                        values[node.id][key],
                        velocities[node.id][key]
                    );
                    const idle =
                        !anim ||
                        (anim.kind === 'spring' &&
                            valuesEqual(anim.pos, anim.to) &&
                            Math.abs(anim.vel) < REST_VELOCITY) ||
                        (anim.kind === 'tween' &&
                            anim.keyframes.every(k => valuesEqual(k, values[node.id][key]))) ||
                        (anim.kind === 'discrete' && anim.value === values[node.id][key]);
                    if (idle) delete running[node.id][key];
                    else running[node.id][key] = anim;
                }
            }
        },
        // Jump to the end of the current target, no motion.
        snap() {
            for (const node of nodes) {
                for (const key of node.keys) {
                    values[node.id][key] = finalValue(node, key);
                    velocities[node.id][key] = 0;
                }
                running[node.id] = {};
            }
        },
        // Advance by `dt` seconds. Returns true when nothing runs any more.
        step(dt) {
            const frame = Math.min(Math.max(dt, 0), MAX_FRAME);
            for (const node of nodes) {
                for (const [key, anim] of Object.entries(running[node.id])) {
                    anim.elapsed += frame;
                    const active = anim.elapsed - anim.delay;
                    if (active < 0) {
                        // Motion holds the first keyframe during the delay (the X's 2nd stroke stays hidden).
                        if (anim.kind === 'tween') values[node.id][key] = anim.keyframes[0];
                        if (anim.kind === 'spring') values[node.id][key] = anim.pos;
                        continue;
                    }
                    if (anim.kind === 'discrete') {
                        values[node.id][key] = anim.value;
                        delete running[node.id][key];
                    } else if (anim.kind === 'tween') {
                        const before = values[node.id][key];
                        values[node.id][key] = sampleTween(anim);
                        if (isNumber(before) && isNumber(values[node.id][key]) && frame > 0) {
                            velocities[node.id][key] = (values[node.id][key] - before) / frame;
                        }
                        if (active >= anim.duration) {
                            values[node.id][key] = anim.keyframes.at(-1);
                            velocities[node.id][key] = 0;
                            delete running[node.id][key];
                        }
                    } else {
                        let remaining = Math.min(active, frame);
                        while (remaining > 0) {
                            const h = Math.min(SUBSTEP, remaining);
                            remaining -= h;
                            const force = -anim.stiffness * (anim.pos - anim.to) - anim.damping * anim.vel;
                            anim.vel += (force / anim.mass) * h;
                            anim.pos += anim.vel * h;
                        }
                        values[node.id][key] = anim.pos;
                        velocities[node.id][key] = anim.vel;
                        if (Math.abs(anim.pos - anim.to) < REST_DISTANCE && Math.abs(anim.vel) < REST_VELOCITY) {
                            values[node.id][key] = anim.to;
                            velocities[node.id][key] = 0;
                            delete running[node.id][key];
                        }
                    }
                }
            }
            return this.isAtRest();
        },
        isAtRest() {
            return nodes.every(n => Object.keys(running[n.id]).length === 0);
        },
        // Visually done: tweens over, springs within 2 % of their travel and slow. A spring's
        // last thousandths take a long time; a click returns to rest without waiting for them.
        isSettled() {
            return nodes.every(n =>
                Object.values(running[n.id]).every(anim => {
                    if (anim.kind !== 'spring' || anim.elapsed < anim.delay) return false;
                    const span = Math.abs(anim.to - anim.from);
                    return (
                        Math.abs(anim.pos - anim.to) <= Math.max(0.02 * span, 0.01) &&
                        Math.abs(anim.vel) <= Math.max(0.5 * span, 0.05)
                    );
                })
            );
        },
        // Current values, for rendering: [{ id, keys, values }].
        frame() {
            return nodes.map(n => ({ id: n.id, keys: n.keys, values: { ...values[n.id] } }));
        },
    };
}

// What to write on a node's DOM element for its current values.
export function nodeOutput(keys, values) {
    const style = {};
    const attrs = {};
    const has = k => keys.includes(k);
    if (TRANSFORM_KEYS.some(has)) {
        const v = k => (isNumber(values[k]) ? round(values[k]) : DEFAULTS[k]);
        const scale = v('scale');
        style.transform =
            `translate(${v('x')}px, ${v('y')}px) ` +
            `scale(${round(scale * v('scaleX'))}, ${round(scale * v('scaleY'))}) rotate(${v('rotate')}deg)`;
    }
    if (has('opacity')) style.opacity = String(round(clamp01(isNumber(values.opacity) ? values.opacity : 1)));
    if (has('pathLength')) {
        attrs.pathLength = '1';
        style.strokeDasharray = `${round(clamp01(isNumber(values.pathLength) ? values.pathLength : 1))} 1`;
        style.strokeDashoffset = '0';
    }
    for (const key of keys) {
        if (TRANSFORM_KEYS.includes(key) || key === 'opacity' || key === 'pathLength') continue;
        const value = formatValue(values[key]);
        if (value !== undefined) attrs[key] = String(value);
    }
    return { style, attrs };
}
