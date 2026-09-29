import React from 'react';
import Svg, { Path, Circle, Rect, Line, Ellipse, Polyline } from 'react-native-svg';
import { ICONS, TINT_TOKEN } from './icons';
import { ICON_PATCHES } from './iconPatches';
import { colors } from '../theme';

const ELEMENTS = { Path, Circle, Rect, Line, Ellipse, Polyline };

/**
 * Renders an icon from the Figma-exported registry.
 *
 * The registry stores each icon with its original Figma viewBox, so passing
 * `size` scales the artwork without distorting it.
 */
export default function Icon({ name, size = 20, color = colors.onSurface, style, strokeWidth }) {
  const icon = ICONS[name];
  if (!icon) {
    if (__DEV__) console.warn(`[Icon] unknown icon "${name}"`);
    return null;
  }

  return (
    <Svg width={size} height={size} viewBox={icon.vb} fill="none" style={[{ flexShrink: 0 }, style]}>
      {[...icon.e, ...(ICON_PATCHES[name] || [])].map((el, i) => {
        const Component = ELEMENTS[el.t];
        if (!Component) return null;
        const props = {};
        Object.keys(el.p).forEach((key) => {
          const value = el.p[key];
          props[key] = value === TINT_TOKEN ? color : value;
        });
        if (strokeWidth != null && props.stroke) props.strokeWidth = strokeWidth;
        return <Component key={i} {...props} />;
      })}
    </Svg>
  );
}
