<template>
    <span
        ref="rootEl"
        class="jp-animated-icon"
        :role="label ? 'img' : undefined"
        :aria-label="label || undefined"
        :aria-hidden="label ? undefined : 'true'"
    >
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            stroke-linejoin="round"
            focusable="false"
            aria-hidden="true"
        >
            <g
                v-for="part in icon.parts"
                :key="iconName + ':' + part.id"
                class="jp-animated-icon__part"
                :data-part="part.id"
                :style="{ transformOrigin: part.origin || 'center' }"
            >
                <component :is="element[0]" v-for="(element, index) in part.elements" :key="index" v-bind="element[1]" />
            </g>
        </svg>
    </span>
</template>

<script>
// Animated SVG icon. Icons are data (src/icons), moved by a spring (src/spring.js).
// Frames are written straight to the parts' style (no Vue re-render per frame).
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ICONS, DEFAULT_ICON } from './icons/index.js';
import { createAnimator, poseToStyle } from './spring.js';

const TRIGGERS = ['click', 'hover', 'state', 'manual'];
const DEFAULT_HOST = 'button, a[href], [role="button"], [role="menuitem"], [role="link"], [role="tab"]';
const DEFAULT_CLICK_HOLD = 200;
const FIRST_FRAME = 1 / 60;

const frontWindow = () => (typeof wwLib !== 'undefined' ? wwLib.getFrontWindow() : null);
const frontDocument = () => (typeof wwLib !== 'undefined' ? wwLib.getFrontDocument() : null);
// Duck-typed: `instanceof Element` is always false in the editor (other realm).
const canContain = node => typeof node?.contains === 'function';
const isDisabled = host =>
    host?.disabled === true || (typeof host?.getAttribute === 'function' && host.getAttribute('aria-disabled') === 'true');

export default {
    props: {
        uid: { type: String, required: true },
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: ['trigger-event'],
    setup(props, { emit }) {
        const rootEl = ref(null);

        const iconName = computed(() => (ICONS[props.content?.icon] ? props.content.icon : DEFAULT_ICON));
        const icon = computed(() => ICONS[iconName.value]);
        const trigger = computed(() => (TRIGGERS.includes(props.content?.trigger) ? props.content.trigger : 'click'));
        const isActive = computed(() => trigger.value === 'state' && !!props.content?.active);
        const speed = computed(() => {
            const value = Number(props.content?.speed);
            return Number.isFinite(value) && value > 0 ? Math.min(value, 10) : 1;
        });
        const strokeWidth = computed(() => {
            const value = Number(props.content?.strokeWidth);
            return Number.isFinite(value) && value > 0 ? Math.min(value, 6) : 2;
        });
        const label = computed(() => {
            const value = props.content?.ariaLabel;
            return typeof value === 'string' ? value.trim() : '';
        });

        let animator = createAnimator(icon.value);
        let frame = null;
        let lastTime = null;
        let holdTimer = null;
        let running = false;

        // ---- Rendering --------------------------------------------------------------

        function apply() {
            const root = rootEl.value;
            if (typeof root?.querySelectorAll !== 'function') return;
            const elements = root.querySelectorAll('.jp-animated-icon__part');
            const poses = new Map(animator.poses().map(p => [p.id, p.pose]));
            elements.forEach(el => {
                const pose = poses.get(el.getAttribute('data-part'));
                if (!pose || !el.style) return;
                const style = poseToStyle(pose);
                el.style.transform = style.transform;
                el.style.opacity = style.opacity;
            });
        }

        function reducedMotion() {
            try {
                return !!frontWindow()?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
            } catch (e) {
                return false;
            }
        }

        function cancelFrame() {
            if (frame !== null) frontWindow()?.cancelAnimationFrame?.(frame);
            frame = null;
            lastTime = null;
        }

        function finish() {
            if (!running) return;
            running = false;
            emit('trigger-event', { name: 'animationEnd', event: { state: animator.target } });
        }

        function tick(time) {
            frame = null;
            const dt = lastTime === null ? FIRST_FRAME : (time - lastTime) / 1000;
            lastTime = time;
            const done = animator.step(dt * speed.value);
            apply();
            if (done) {
                lastTime = null;
                finish();
                return;
            }
            frame = frontWindow()?.requestAnimationFrame?.(tick) ?? null;
        }

        // Move every part toward a pose ('normal' | 'animate'), from wherever it is now.
        function goTo(state) {
            animator.setTarget(state);
            if (reducedMotion() || !frontWindow()?.requestAnimationFrame) {
                cancelFrame();
                animator.snap();
                apply();
                finish();
                return;
            }
            if (animator.isAtRest()) return;
            if (!running) {
                running = true;
                emit('trigger-event', { name: 'animationStart', event: { state: animator.target } });
            }
            if (frame === null) {
                lastTime = null;
                frame = frontWindow().requestAnimationFrame(tick);
            }
        }

        function clearHold() {
            if (holdTimer !== null) frontWindow()?.clearTimeout?.(holdTimer);
            holdTimer = null;
        }

        // ---- Actions ----------------------------------------------------------------

        // Go to the animated pose, hold, come back (to the Active pose in State mode).
        function play() {
            clearHold();
            if (reducedMotion()) return;
            goTo('animate');
            const hold = Number(icon.value?.clickHold);
            const delay = (Number.isFinite(hold) && hold >= 0 ? hold : DEFAULT_CLICK_HOLD) / speed.value;
            holdTimer = frontWindow()?.setTimeout?.(() => {
                holdTimer = null;
                goTo(isActive.value ? 'animate' : 'normal');
            }, delay);
        }

        function start() {
            clearHold();
            goTo('animate');
        }

        function stop() {
            clearHold();
            goTo('normal');
        }

        // ---- Host (the button around the icon) ---------------------------------------

        function findHost() {
            const parent = rootEl.value?.parentElement;
            if (typeof parent?.closest !== 'function') return null;
            const custom = typeof props.content?.hostSelector === 'string' ? props.content.hostSelector.trim() : '';
            let host = null;
            try {
                host = parent.closest(custom || DEFAULT_HOST);
            } catch (e) {
                host = null; // invalid selector
            }
            return host || parent;
        }

        // Event inside the host, coming from outside it (pointerover / focusin) or
        // leaving it (pointerout / focusout).
        function crossesHost(event) {
            const host = findHost();
            if (!canContain(host) || !host.contains(event.target)) return null;
            if (event.relatedTarget && host.contains(event.relatedTarget)) return null;
            return host;
        }

        function onClick(event) {
            if (trigger.value !== 'click') return;
            const host = findHost();
            if (!canContain(host) || !host.contains(event.target) || isDisabled(host)) return;
            play();
        }

        function onPointerOver(event) {
            if (trigger.value !== 'hover' || event.pointerType === 'touch') return;
            const host = crossesHost(event);
            if (host && !isDisabled(host)) start();
        }

        function onPointerOut(event) {
            if (trigger.value !== 'hover' || event.pointerType === 'touch') return;
            if (crossesHost(event)) stop();
        }

        // Keyboard users get the hover animation on focus.
        function onFocusIn(event) {
            if (trigger.value !== 'hover') return;
            let visible = true;
            try {
                visible = event.target?.matches?.(':focus-visible') ?? true;
            } catch (e) {
                visible = true;
            }
            const host = crossesHost(event);
            if (host && visible && !isDisabled(host)) start();
        }

        function onFocusOut(event) {
            if (trigger.value !== 'hover') return;
            if (crossesHost(event)) stop();
        }

        const LISTENERS = [
            ['click', onClick],
            ['pointerover', onPointerOver],
            ['pointerout', onPointerOut],
            ['focusin', onFocusIn],
            ['focusout', onFocusOut],
        ];
        let listenedDocument = null;

        onMounted(() => {
            animator.setTarget(isActive.value ? 'animate' : 'normal');
            animator.snap();
            apply();
            // Capture phase on the document: works whatever the host does with the event.
            listenedDocument = frontDocument();
            LISTENERS.forEach(([type, handler]) => listenedDocument?.addEventListener?.(type, handler, true));
        });

        onBeforeUnmount(() => {
            LISTENERS.forEach(([type, handler]) => listenedDocument?.removeEventListener?.(type, handler, true));
            listenedDocument = null;
            cancelFrame();
            clearHold();
        });

        // ---- Reactivity -----------------------------------------------------------------

        watch(isActive, active => {
            clearHold();
            goTo(active ? 'animate' : 'normal');
        });

        watch(iconName, () => {
            cancelFrame();
            clearHold();
            running = false;
            animator = createAnimator(icon.value);
            animator.setTarget(isActive.value ? 'animate' : 'normal');
            animator.snap();
            nextTick(() => {
                apply();
                /* wwEditor:start */
                play(); // preview the new icon on the canvas
                /* wwEditor:end */
            });
        });

        return { rootEl, icon, iconName, strokeWidth, label, play, start, stop };
    },
};
</script>

<style>
/* Root defaults: not scoped and zero specificity, so the style panel (width, height,
   color, a design-system class…) always wins. */
:where(.jp-animated-icon) {
    display: inline-flex;
    flex-shrink: 0;
    width: var(--jai-size, 1em);
    height: var(--jai-size, 1em);
    color: var(--jai-color, inherit);
    line-height: 0;
}
</style>

<style lang="scss" scoped>
.jp-animated-icon svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible; // the lid rises above the 24×24 box
}

.jp-animated-icon__part {
    transform-box: fill-box;
}
</style>
