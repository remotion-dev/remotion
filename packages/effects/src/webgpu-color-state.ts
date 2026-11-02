import {parseColorRgba} from './color-utils.js';
import {
	setupWebGpuSinglePass,
	type WebGpuSinglePassState,
} from './webgpu-single-pass-runtime.js';

export type WebGpuColorState = WebGpuSinglePassState & {
	readonly colorContext: CanvasRenderingContext2D;
	colors: {key: string; data: Uint8Array<ArrayBuffer>} | null;
};

export const setupWebGpuColors = (
	target: HTMLCanvasElement,
	label: string,
): WebGpuColorState => {
	const canvas = document.createElement('canvas');
	canvas.width = 1;
	canvas.height = 1;
	const colorContext = canvas.getContext('2d', {willReadFrequently: true});
	if (!colorContext)
		throw new Error('Failed to acquire 2D context for color parsing');
	return {...setupWebGpuSinglePass(target, label), colorContext, colors: null};
};

export const getWebGpuColors = (
	state: WebGpuColorState,
	colors: readonly string[],
): Uint8Array<ArrayBuffer> => {
	const key = JSON.stringify(colors);
	if (state.colors?.key === key) return state.colors.data;
	const data = new Uint8Array(colors.length * 4);
	for (let i = 0; i < colors.length; i++)
		data.set(parseColorRgba(state.colorContext, colors[i]), i * 4);
	state.colors = {key, data};
	return data;
};
