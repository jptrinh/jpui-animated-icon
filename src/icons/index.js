// Icon registry. To add an icon: one file in this folder (see trash.js for the format),
// one line here, and the value in AI.json's `icon` options.
//
// Format of an icon:
// - `parts`: groups of SVG elements that move together. `elements` = [tag, attributes]
//   on Lucide's 24×24 grid; `normal` / `animate` = poses (x, y in grid units, rotate in
//   degrees, scale, opacity — omitted channels keep their default). `origin` = CSS
//   transform-origin, relative to the part's own box (default `center`).
// - `transition`: spring (stiffness, damping, mass), as in Motion.
// - `clickHold`: ms spent on `animate` before coming back, for a click.
import trash from './trash.js';

export const ICONS = {
    trash,
};

export const DEFAULT_ICON = 'trash';

export const ICON_OPTIONS = Object.entries(ICONS).map(([value, icon]) => ({ value, label: icon.label }));
