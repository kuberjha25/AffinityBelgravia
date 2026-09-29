/**
 * Absolute-fill style for <Image>.
 *
 * StyleSheet.absoluteFill alone is not enough for images: without an explicit
 * width/height the image falls back to its intrinsic pixel size (very visible
 * on web, where the natural size wins over the inset values), which silently
 * blows up the crop. Always use this for a background image.
 */
export const imageFill = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
};

export default imageFill;
