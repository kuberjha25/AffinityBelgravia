/**
 * Design tokens exported straight from the Figma file
 * "Affinity Belgravia — Light Luxury Foundations" (page 00 Foundations).
 * Colour values, type ramp and numeric scales are 1:1 with the Figma variables.
 */

export const colors = {
  surface: '#fbf9f5',
  onSurface: '#1c1b19',
  surfaceSecondary: '#ffffff',
  onSurfaceSecondary: '#2a2926',
  surfaceTertiary: '#f1ece3',
  onSurfaceTertiary: '#4a4741',
  surfaceInverse: '#1c1b19',
  onSurfaceInverse: '#ffffff',

  muted: '#8a857c',

  brand: '#b19777',
  brandPrimary: '#9c7e4e',
  brandSecondary: '#b19777',
  brandTertiary: '#c5a47e',
  onBrand: '#ffffff',
  onBrandPrimary: '#ffffff',
  onBrandSecondary: '#ffffff',
  onBrandTertiary: '#1c1b19',

  success: '#3e6b4f',
  onSuccess: '#ffffff',
  successSoft: 'rgba(62, 107, 79, 0.12)',
  onSuccessSoft: '#2f5a40',

  warning: '#b19777',
  onWarning: '#1c1b19',

  error: '#b4534a',
  onError: '#ffffff',
  errorSoft: 'rgba(180, 83, 74, 0.12)',
  onErrorSoft: '#9c3f37',

  info: '#8a857c',
  onInfo: '#ffffff',
  infoSoft: 'rgba(138, 133, 124, 0.12)',

  border: '#e8e2d6',
  borderStrong: '#cfc6b6',
  divider: '#efeae1',

  glassFill: 'rgba(251, 249, 245, 0.86)',
  glassTint: 'rgba(177, 151, 119, 0.10)',
  scrim: 'rgba(28, 27, 25, 0.72)',
  scrimTransparent: 'rgba(28, 27, 25, 0)',
  backdrop: 'rgba(28, 27, 25, 0.45)',
  overlaySoft: 'rgba(28, 27, 25, 0.05)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
};

export const borderWidth = {
  default: 1,
  selected: 1.5,
};

export const fonts = {
  thin: 'ElectroluxSans-Thin',
  light: 'ElectroluxSans-Light',
  regular: 'ElectroluxSans-Regular',
  semibold: 'ElectroluxSans-Semibold',
  bold: 'ElectroluxSans-Bold',
  italic: 'ElectroluxSans-Italic',
};

/** Figma text styles. ElectroluxSans replaces the Inter placeholder noted in the file. */
export const type = {
  display: { fontFamily: fonts.light, fontSize: 32, lineHeight: 40, letterSpacing: 0.2 },
  pageTitle: { fontFamily: fonts.light, fontSize: 28, lineHeight: 34 },
  title: { fontFamily: fonts.light, fontSize: 24, lineHeight: 32 },
  heading: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 28 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 16, letterSpacing: 2 },
  kvLabel: { fontFamily: fonts.regular, fontSize: 10, lineHeight: 14, letterSpacing: 1 },
  wordmark: { fontFamily: fonts.light, fontSize: 18, lineHeight: 24, letterSpacing: 6 },
  wordmarkSub: { fontFamily: fonts.regular, fontSize: 10, lineHeight: 14, letterSpacing: 4 },
  button: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, letterSpacing: 1.5 },
};

export const shadow = {
  // Figma: Shadow/blur 12, Shadow/y 4, Shadow/opacity 4%
  card: {
    shadowColor: '#1c1b19',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  raised: {
    shadowColor: '#1c1b19',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
};

export default { colors, spacing, radius, borderWidth, fonts, type, shadow };
