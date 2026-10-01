# jpui-animated-icon

Animated line icons for WeWeb. Lucide shapes, animations ported from
[lucide-animated](https://lucide-animated.com/) (React + Motion) to a small spring engine
with no dependency, so it runs in a WeWeb coded component.

The icon plays **by itself** when the button around it is clicked or hovered: no workflow.

## Properties

| Property | |
|---|---|
| Icon | `trash` (more to come) |
| Play on | **Click on parent button** (default) · **Hover on parent button** · **State** (follows *Active*) · **Manual** (actions only) |
| Host selector | Ancestor that plays the icon. Empty = nearest `button`, `a[href]`, `[role=button]`, `[role=menuitem]`, `[role=link]`, `[role=tab]`; if none, the parent element |
| Active | State mode: `true` = animated pose |
| Speed | Multiplier, 1 = original timing |
| Aria label | Empty = decorative (`aria-hidden`), the right choice inside a named button |
| Size · Color · Stroke width | Style panel. Size defaults to `1em`, color to `currentColor` (the button's text color) |

Events: *On animation start*, *On animation end* (`event.state`). Actions: *Play*, *Start*, *Stop*.

Behaviour: a disabled host (`disabled` / `aria-disabled="true"`) does not play; Enter / Space
on the host play it (they click it), keyboard focus plays the hover animation;
`prefers-reduced-motion` = no motion (click does nothing, other modes jump to the pose).

⚠️ A host that disappears on click (a menu item that closes its menu) hides the animation:
use **Hover** there.

## Adding an icon

1. Open the icon's source in [pqoqubbw/icons](https://github.com/pqoqubbw/icons/tree/main/icons).
2. Create `src/icons/<name>.js` (see `trash.js`): one part per group of elements that move
   together, their Lucide `elements`, the `animate` pose (x, y, rotate, scale, opacity) and the
   spring (`transition`). A path whose `d` only shifts in the original is a `y` / `x` translation.
3. Add it to `src/icons/index.js` and to the `icon` options in `AI.json`.
4. `npm test`, push, re-sync in WeWeb.

Not supported yet: keyframe sequences (`[0, -10, 10, 0]`), tween transitions with a duration,
path morphing and `pathLength` drawing. Add them to `src/spring.js` when an icon needs them.

## Development

```bash
npm i
npm test
npm run build -- --name=jpui-animated-icon --type=wwobject
npm run serve --port=8080
```

Licenses: MIT. Third-party notices (Lucide, Feather, lucide-animated) in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
