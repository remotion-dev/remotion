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

	let waitForReadyTime = 0;
	let addSampleTime = 0;
	let createFrameTime = 0;

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
		[Symbol.dispose]: () => {
			if (helperCanvasState.current) {
				helperCanvasState.current.cleanup();
			}
		},
		getWaitForReadyTime: () => waitForReadyTime,
		addWaitForReadyTime: (time: number) => {
			waitForReadyTime += time;
		},
		getAddSampleTime: () => addSampleTime,
		addAddSampleTime: (time: number) => {
			addSampleTime += time;
		},
		getCreateFrameTime: () => createFrameTime,
		addCreateFrameTime: (time: number) => {
			createFrameTime += time;
		},
	};
};

export type InternalState = ReturnType<typeof makeInternalState>;
