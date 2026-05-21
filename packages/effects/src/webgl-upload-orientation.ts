// WebGL effects sample sources with `texImage2D`. DOM media (video, initial 2D
// frame canvases) use a top-left origin and need `UNPACK_FLIP_Y_WEBGL` so rows
// match clip-space UVs. Prior effect outputs are already in display/GL space:
// - `createImageBitmap` after a 2D run (backend bridge in `runEffectChain`)
// - WebGL ping-pong canvases from an earlier effect in the same `webgl2` run

const isBridgedImageBitmap = (source: CanvasImageSource): boolean => {
	if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) {
		return true;
	}

	// `createImageBitmap` output from `runEffectChain` backend bridges.
	return (
		typeof source === 'object' &&
		source !== null &&
		'close' in source &&
		typeof (source as ImageBitmap).close === 'function'
	);
};

export const shouldFlipYOnWebGLUpload = (
	source: CanvasImageSource,
): boolean => {
	if (isBridgedImageBitmap(source)) {
		return false;
	}

	if (
		(typeof HTMLVideoElement !== 'undefined' &&
			source instanceof HTMLVideoElement) ||
		(typeof HTMLImageElement !== 'undefined' &&
			source instanceof HTMLImageElement)
	) {
		return true;
	}

	if (
		typeof HTMLCanvasElement !== 'undefined' &&
		source instanceof HTMLCanvasElement
	) {
		// Pool targets for a prior WebGL effect in the same backend run.
		return source.getContext('webgl2') === null;
	}

	return true;
};
