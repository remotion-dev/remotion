import {makeMaskImageLoaderState} from './drawing/mask-image-loader';

type HelperCanvas = {
	canvas: OffscreenCanvas;
	gl: WebGLRenderingContext;
	program: WebGLProgram; // Cache the program
	locations: {
		aPosition: number;
		aTexCoord: number;
		uTransform: WebGLUniformLocation | null;
		uResolution: WebGLUniformLocation | null;
		uOffset: WebGLUniformLocation | null;
		uTexture: WebGLUniformLocation | null;
	};
	cleanup: () => void;
};

export type HelperCanvasState = {
	current: HelperCanvas | null;
};

export const makeInternalState = ({
	signal = null,
	maskImageTimeoutInMilliseconds = 30_000,
}: {
	signal?: AbortSignal | null;
	maskImageTimeoutInMilliseconds?: number;
} = {}) => {
	let drawnPrecomposedPixels = 0;
	let precomposedTextures = 0;

	let waitForReadyTime = 0;
	let addSampleTime = 0;
	let createFrameTime = 0;
	let audioMixingTime = 0;

	const helperCanvasState: HelperCanvasState = {
		current: null,
	};
	const maskImageLoaderState = makeMaskImageLoaderState({
		signal,
		timeoutInMilliseconds: maskImageTimeoutInMilliseconds,
	});

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
		maskImageLoaderState,
		[Symbol.dispose]: () => {
			if (helperCanvasState.current) {
				helperCanvasState.current.cleanup();
			}

			maskImageLoaderState[Symbol.dispose]();
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
		getAudioMixingTime: () => audioMixingTime,
		addAudioMixingTime: (time: number) => {
			audioMixingTime += time;
		},
	};
};

export type InternalState = ReturnType<typeof makeInternalState>;
