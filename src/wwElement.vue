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
            <IconNodes :key="iconName" :icon="icon" />
        </svg>
    </span>
</template>

<script>
// Animated SVG icon. Icons are data (src/icons), animated by src/engine.js (Motion's model).
// Frames are written straight to the nodes' style / attributes (no Vue re-render per frame).
import { computed, h, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue';
import { ICONS, DEFAULT_ICON, resolveIcon } from './icons/index.js';
import { createAnimator, nodeOutput } from './engine.js';

// Renders the icon's element tree. `data-node` ids match engine.collectNodes().
const isAnimated = el => !!(el.normal || el.animate);
const nodeStyle = (el, box = 'fill-box') =>
    isAnimated(el) ? { transformBox: box, transformOrigin: el.origin || '50% 50%' } : undefined;
function renderElements(elements, prefix) {
    return (elements || []).map((el, index) => {
        const id = prefix ? `${prefix}.${index}` : String(index);
        return h(el.tag, { ...el.attrs, 'data-node': id, style: nodeStyle(el) }, renderElements(el.children, id));
    });
}
const IconNodes = props => {
    const icon = props.icon || {};
    const content = renderElements(icon.elements, '');
    if (!icon.root) return content;
    return [h('g', { 'data-node': 'root', style: nodeStyle(icon.root, 'view-box') }, content)];
};
IconNodes.props = ['icon'];

const TRIGGERS = ['click', 'hover', 'state', 'manual'];
const DEFAULT_HOST = 'button, a[href], [role="button"], [role="menuitem"], [role="link"], [role="tab"]';
const FIRST_FRAME = 1 / 60;

const frontWindow = () => (typeof wwLib !== 'undefined' ? wwLib.getFrontWindow() : null);
// Duck-typed: `instanceof Element` is always false in the editor (other realm).
const canContain = node => typeof node?.contains === 'function';
const isDisabled = host =>
    host?.disabled === true || (typeof host?.getAttribute === 'function' && host.getAttribute('aria-disabled') === 'true');

export default {
    components: { IconNodes },
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

        const iconName = computed(() => resolveIcon(props.content?.icon) || DEFAULT_ICON);
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
        let returnWhenSettled = false; // click without `clickHold`: come back once `animate` ends

        // ---- Rendering --------------------------------------------------------------

        function apply() {
            const root = rootEl.value;
            if (typeof root?.querySelector !== 'function') return;
            for (const node of animator.frame()) {
                const el = root.querySelector(`[data-node="${node.id}"]`);
                if (!el?.style || typeof el.setAttribute !== 'function') continue;
                const { style, attrs } = nodeOutput(node.keys, node.values);
                Object.assign(el.style, style);
                for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
            }
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
            if (!done && returnWhenSettled && animator.target === 'animate' && animator.isSettled()) {
                returnWhenSettled = false;
                animator.setTarget(restState()); // keeps running: no end / start events in between
            }
            if (done) {
                lastTime = null;
                finish();
                if (returnWhenSettled && animator.target === 'animate') {
                    returnWhenSettled = false;
                    goTo(restState());
                }
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
            returnWhenSettled = false;
        }

        const restState = () => (isActive.value ? 'animate' : 'normal');

        // ---- Actions ----------------------------------------------------------------

        // Play `animate`, then come back to rest (to the Active pose in State mode): after the
        // icon's `clickHold` ms if it has one, else as soon as `animate` has finished.
        function play() {
            clearHold();
            if (reducedMotion()) return;
            goTo('animate');
            const hold = Number(icon.value?.clickHold);
            if (Number.isFinite(hold) && hold >= 0) {
                holdTimer = frontWindow()?.setTimeout?.(() => {
                    holdTimer = null;
                    goTo(restState());
                }, hold / speed.value);
            } else if (animator.isAtRest()) {
                goTo(restState());
            } else {
                returnWhenSettled = true;
            }
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

        // Listeners live on the host itself (not on the document): an event elsewhere in
        // the page costs nothing, whatever the number of icons. State / Manual: none.
        function onClick() {
            if (!isDisabled(boundHost)) play();
        }

        function onPointerEnter(event) {
            if (event.pointerType !== 'touch' && !isDisabled(boundHost)) start();
        }

        function onPointerLeave(event) {
            if (event.pointerType !== 'touch') stop();
        }

        // Keyboard users get the hover animation on focus (focusin / focusout bubble from
        // the host's children: ignore moves inside the host).
        function onFocusIn(event) {
            if (event.relatedTarget && canContain(boundHost) && boundHost.contains(event.relatedTarget)) return;
            let visible = true;
            try {
                visible = event.target?.matches?.(':focus-visible') ?? true;
            } catch (e) {
                visible = true;
            }
            if (visible && !isDisabled(boundHost)) start();
        }

        function onFocusOut(event) {
            if (event.relatedTarget && canContain(boundHost) && boundHost.contains(event.relatedTarget)) return;
            stop();
        }

        const LISTENERS = {
            // capture: a child stopping the click's propagation cannot hide it from the icon
            click: [['click', onClick, true]],
            hover: [
                ['pointerenter', onPointerEnter, false],
                ['pointerleave', onPointerLeave, false],
                ['focusin', onFocusIn, false],
                ['focusout', onFocusOut, false],
            ],
        };
        let boundHost = null;
        let boundTrigger = null;
        let bindRetry = null;
        let bindAttempts = 0;

        function unbindHost() {
            (LISTENERS[boundTrigger] || []).forEach(([type, handler, capture]) =>
                boundHost?.removeEventListener?.(type, handler, capture)
            );
            boundHost = null;
            boundTrigger = null;
        }

        // Find the host and (re)attach the listeners if the host or the mode changed. Cheap
        // when nothing changed, so it runs on mount, on every update and when settings change.
        function bindHost() {
            const wanted = LISTENERS[trigger.value] ? trigger.value : null;
            // detached (not in the page yet): `closest` would stop short and pick the parent
            const host = wanted && rootEl.value?.isConnected ? findHost() : null;
            if (host === boundHost && wanted === boundTrigger) return;
            unbindHost();
            if (!host || typeof host.addEventListener !== 'function') {
                // not attached to the page yet: try again on the next frames
                if (wanted && bindAttempts++ < 20 && bindRetry === null) {
                    bindRetry = frontWindow()?.requestAnimationFrame?.(() => {
                        bindRetry = null;
                        bindHost();
                    }) ?? null;
                }
                return;
            }
            bindAttempts = 0;
            LISTENERS[wanted].forEach(([type, handler, capture]) => host.addEventListener(type, handler, capture));
            boundHost = host;
            boundTrigger = wanted;
        }

        onMounted(() => {
            animator.setTarget(isActive.value ? 'animate' : 'normal');
            animator.snap();
            apply();
            bindHost();
        });

        onUpdated(bindHost);

        onBeforeUnmount(() => {
            if (bindRetry !== null) frontWindow()?.cancelAnimationFrame?.(bindRetry);
            bindRetry = null;
            unbindHost();
            cancelFrame();
            clearHold();
        });

        // ---- Reactivity -----------------------------------------------------------------

        watch(
            () => [trigger.value, props.content?.hostSelector],
            () => {
                bindAttempts = 0;
                bindHost();
            }
        );

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
    overflow: visible; // some icons move a little outside the 24×24 box
}
</style>
