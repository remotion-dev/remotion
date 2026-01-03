type HelperCanvas = {
	canvas: OffscreenCanvas;
	gl: WebGLRenderingContext;
	program: WebGLProgram; // Cache the program
	locations: {
		aPosition: number;
		aTexCoord: number;
		uTransform: WebGLUniformLocation | null;
		uProjection: WebGLUniformLocation | null;
		uTexture: WebGLUniformLocation | null;
	};
	cleanup: () => void;
};

export type HelperCanvasState = {
	current: HelperCanvas | null;
};

export const makeInternalState = () => {
	let drawnPrecomposedPixels = 0;
	let precomposedTextures = 0;

	const helperCanvasState: HelperCanvasState = {
		current: null,
	};

	return {
		getDrawn3dPixels: () => drawnPrecomposedPixels,
		getPrecomposedTiles: () => precomposedTextures,
		addPrecompose: ({
			canvasWidth,
			canvasHeight,
		}: {
			canvasWidth: number;
			canvasHeight: number;
		}) => {
			drawnPrecomposedPixels += canvasWidth * canvasHeight;
			precomposedTextures++;
		},
		helperCanvasState,
		cleanup: () => {
			drawnPrecomposedPixels = 0;
			precomposedTextures = 0;
			if (helperCanvasState.current) {
				helperCanvasState.current.cleanup();
			}
		},
	};
};

export type InternalState = ReturnType<typeof makeInternalState>;
