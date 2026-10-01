# jpui-animated-icon

Animated line icons for WeWeb. Lucide shapes, animations ported from
[lucide-animated](https://lucide-animated.com/) (React + Motion) to a small engine with no
dependency, so it runs in a WeWeb coded component.

The icon plays **by itself** when the button around it is clicked or hovered: no workflow.

## Icons

44 Lucide icons, named as in Lucide (`lucide/trash-2` and the old `trash` are accepted; `funnel` = `filter`).
19 come from lucide-animated (`src/icons/ported.js`, same paths, variants and transitions); the 25 it
does not have are animated here in the same style (`src/icons/custom.js`).

| Icon | Label in WeWeb | Animation | Source |
|---|---|---|---|
| `a-large-small` | Text size | The big A grows, the small a shrinks, from their baseline | designed here |
| `archive` | Archive | The lid lifts, the box drops slightly and its slot moves down | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `archive-restore` | Unarchive | The lid lifts, the arrow bounces up | designed here |
| `arrow-right` | Arrow right | The shaft shortens while the head pulls back, then both return | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `check` | Check | The check draws itself while growing in | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `chevron-up` | Chevron up | The chevron bounces up | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `circle-alert` | Alert | The exclamation mark wobbles on its dot | designed here |
| `circle-check` | Circle check | The check draws itself inside the circle | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `circle-minus` | Circle minus | The minus draws itself inside the circle | designed here |
| `circle-x` | Circle X | The two strokes of the X draw one after the other | designed here |
| `copy` | Copy | The two sheets slide over each other (spring) | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `crop` | Crop | The two corners move apart, then back | designed here |
| `ellipsis` | More | The three dots bounce one after the other | designed here |
| `eye` | Eye | The eye blinks | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `filter` | Filter | The funnel squeezes and springs back | designed here |
| `folder` | Folder | The folder hops | designed here |
| `folder-input` | Folder input | The arrow pushes into the folder | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `gallery-horizontal-end` | Gallery | The stacked edges slide in one after the other | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `grid-2x2` | Grid | The inner cross turns a quarter (spring) | designed here |
| `image` | Image | The sun rises and glows | designed here |
| `images` | Images | The two pictures spread apart, then back | designed here |
| `list-plus` | Add to list | The plus turns a quarter (spring) | designed here |
| `mouse-pointer-2` | Pointer | The pointer presses toward its tip | designed here |
| `panel-left` | Panel left | The divider nudges right | designed here |
| `panel-left-close` | Panel left close | The arrow nudges left | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `panel-left-open` | Panel left open | The arrow nudges right | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `panel-right` | Panel right | The divider nudges left | designed here |
| `panel-right-close` | Panel right close | The arrow nudges right | designed here |
| `panel-right-open` | Panel right open | The arrow nudges left | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `pencil` | Edit | The pencil wiggles on its tip | designed here |
| `plus` | Plus | The plus turns half a turn (spring) | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `ratio` | Ratio | The portrait frame shrinks, the landscape one grows | designed here |
| `refresh-cw` | Refresh | The arrows turn (spring) | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `search` | Search | The magnifier hops up, then sideways | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `share` | Share | The arrow rises (spring) | designed here |
| `sparkles` | Sparkles | The big star hops and fills, the small ones blink | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `square` | Square | The square pulses | designed here |
| `square-check` | Square check | The check draws itself inside the square | designed here |
| `square-minus` | Square minus | The minus draws itself inside the square | designed here |
| `tag` | Tag | The tag swings on its hole | designed here |
| `tags` | Tags | The tags swing on their hole | designed here |
| `trash-2` | Trash | The lid lifts, the can drops (spring) — alias `trash` | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `upload` | Upload | The arrow rises (spring) | [lucide-animated](https://github.com/pqoqubbw/icons) |
| `x` | X | The two strokes draw one after the other | [lucide-animated](https://github.com/pqoqubbw/icons) |

See them all: `npm run harness`, then http://localhost:4173/harness/ (hover or click mode).

## Properties

| Property | |
|---|---|
| Icon | One of the names above |
| Play on | **Click on parent button** (default) · **Hover on parent button** · **State** (follows *Active*) · **Manual** (actions only) |
| Host selector | Ancestor that plays the icon. Empty = nearest `button`, `a[href]`, `[role=button]`, `[role=menuitem]`, `[role=link]`, `[role=tab]`; if none, the parent element |
| Active | State mode: `true` = animated state |
| Play on mount | Plays once each time the element appears (mount: page load, popup, conditional rendering, new list item), whatever *Play on* is. Not on a `display: none` → shown toggle |
| Speed | Multiplier, 1 = original timing |
| Aria label | Empty = decorative (`aria-hidden`), the right choice inside a named button |
| Size · Color · Stroke width | Style panel. Size defaults to `1em`, color to `currentColor` (the button's text color) |

Events: *On animation start*, *On animation end* (`event.state`). Actions: *Play*, *Start*, *Stop*.

Behaviour: hover = `animate` while hovered, `normal` on leave (as in lucide-animated). Click =
`animate`, then back to `normal` once it is visually done (or after the icon's `clickHold` ms).
Listeners sit on the host itself (none in State / Manual), so a page full of icons costs
nothing when nothing happens to their buttons. A disabled host (`disabled` / `aria-disabled="true"`) does not play; Enter / Space on the host
play it, keyboard focus plays the hover animation; `prefers-reduced-motion` = no motion.

Toggle buttons whose icon changes on click (panel open ↔ close): if the icon changes within
700 ms of a click, or while the host is hovered, the new icon plays instead of starting at rest.

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
3. Add the name to the `icon` options in `AI.json` and a row to the table above.
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
