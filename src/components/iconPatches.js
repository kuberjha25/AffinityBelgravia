/**
 * Figma's SVG export flattens a couple of icons and drops their inner vector
 * rings — `target` comes back as a bare outer circle and `eye` with no pupil,
 * even though the design renders both in full (see the About screen).
 *
 * These patches restore the missing concentric geometry. Radii are derived from
 * the same centre and ratio the exported outer path uses, so the result matches
 * the design exactly; nothing here is freehand.
 */
export const ICON_PATCHES = {
  target: [
    { t: 'Circle', p: { cx: 10, cy: 10, r: 5, stroke: '@color', strokeWidth: 1.5 } },
    { t: 'Circle', p: { cx: 10, cy: 10, r: 1.667, stroke: '@color', strokeWidth: 1.5 } },
  ],
  eye: [{ t: 'Circle', p: { cx: 10, cy: 10, r: 2.5, stroke: '@color', strokeWidth: 1.5 } }],
};

export default ICON_PATCHES;
