# jpui-animated-icon

Animated line icons for WeWeb. Lucide shapes, animations ported from
[lucide-animated](https://lucide-animated.com/) (React + Motion) to a small engine with no
dependency, so it runs in a WeWeb coded component.

The icon plays **by itself** when the button around it is clicked or hovered: no workflow.

## Icons

44 Lucide icons, named as in Lucide (`trash-2`; `lucide/trash-2` and the old `trash` are accepted):

- **Ported from lucide-animated** (`src/icons/ported.js`, same paths, variants and transitions):
  archive, arrow-right, check, chevron-up, circle-check, copy, eye, folder-input,
  gallery-horizontal-end, panel-left-close, panel-left-open, panel-right-open, plus,
  refresh-cw, search, sparkles, trash-2, upload, x.
- **Designed here** for the icons lucide-animated does not have (`src/icons/custom.js`):
  a-large-small, archive-restore, circle-alert, circle-minus, circle-x, crop, ellipsis,
  filter, folder, grid-2x2, image, images, list-plus, mouse-pointer-2, panel-left,
  panel-right, panel-right-close, pencil, ratio, share, square, square-check,
  square-minus, tag, tags.

See them all: `npm run harness`, then http://localhost:4173/harness/ (hover or click mode).

## Properties

| Property | |
|---|---|
| Icon | One of the names above |
| Play on | **Click on parent button** (default) · **Hover on parent button** · **State** (follows *Active*) · **Manual** (actions only) |
| Host selector | Ancestor that plays the icon. Empty = nearest `button`, `a[href]`, `[role=button]`, `[role=menuitem]`, `[role=link]`, `[role=tab]`; if none, the parent element |
| Active | State mode: `true` = animated state |
| Speed | Multiplier, 1 = original timing |
| Aria label | Empty = decorative (`aria-hidden`), the right choice inside a named button |
| Size · Color · Stroke width | Style panel. Size defaults to `1em`, color to `currentColor` (the button's text color) |

Events: *On animation start*, *On animation end* (`event.state`). Actions: *Play*, *Start*, *Stop*.

Behaviour: hover = `animate` while hovered, `normal` on leave (as in lucide-animated). Click =
`animate`, then back to `normal` once it is visually done (or after the icon's `clickHold` ms).
Listeners sit on the host itself (none in State / Manual), so a page full of icons costs
nothing when nothing happens to their buttons. A disabled host (`disabled` / `aria-disabled="true"`) does not play; Enter / Space on the host
play it, keyboard focus plays the hover animation; `prefers-reduced-motion` = no motion.

⚠️ A host that disappears on click (a menu item that closes its menu) hides the animation:
use **Hover** there.

## How it works

`src/engine.js` reproduces Motion's model without Motion: each animated SVG node has a
`normal` and an `animate` variant; values are numbers (x, y, rotate, scale, scaleX, scaleY,
opacity, pathLength, attributes), strings with numbers (`d`, `points`, interpolated number by
number) or discrete (`fill`); targets can be keyframe arrays; transitions are springs
(stiffness / damping / mass, velocity kept on retarget) or tweens (duration, ease, times),
with `delay`, per-value overrides and Motion's defaults. An icon's optional `root` animates the
whole drawing (lucide-animated's `motion.svg`; px there = 24/28 grid unit, see `PX`).

## Adding an icon

1. lucide-animated has it: copy its paths and variants into `ported.js` (the format maps 1:1;
   `translateX` → `x`, a `custom` index → explicit values).
2. It does not: add it to `custom.js`, with the Lucide paths and the helpers of `shared.js`
   (`nudge`, `draw`, `swing`…).
3. Add the name to the `icon` options in `AI.json`.
4. `npm test` (every icon must animate, settle and come back to rest), check it in the
   harness, push, re-sync in WeWeb.

## Development

```bash
npm i
npm test
npm run build -- --name=jpui-animated-icon --type=wwobject
npm run serve --port=8080
```

Licenses: MIT. Third-party notices (Lucide, Feather, lucide-animated) in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
