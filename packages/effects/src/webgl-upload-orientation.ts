// WebGL effects sample sources with `texImage2D`. Remotion's `runEffectChain`
// passes only:
// - A 2D frame canvas (Gif `putImageData`, `WrappedCanvas.canvas` from
//   `@remotion/media`, animated-image, Rive, HtmlInCanvas) — top-left origin,
//   needs `UNPACK_FLIP_Y_WEBGL`.
// - An `ImageBitmap` after a 2D run (backend bridge) — display orientation,
//   do not flip.
// - A `webgl2` ping-pong canvas from a prior effect in the same `webgl2` run —
//   already in GL space, do not flip.

const is2dCanvas = (source: CanvasImageSource): boolean => {
	if (
		typeof HTMLCanvasElement !== 'undefined' &&
		source instanceof HTMLCanvasElement
	) {
		return source.getContext('webgl2') === null;
	}

	if (
		typeof OffscreenCanvas !== 'undefined' &&
		source instanceof OffscreenCanvas
	) {
		return source.getContext('webgl2') === null;
	}

	return false;
};

export const shouldFlipYOnWebGLUpload = (
	source: CanvasImageSource,
): boolean => {
	if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) {
		return false;
	}

	return is2dCanvas(source);
};
