export class WebGLContextLostError extends Error {
	public readonly canvas: HTMLCanvasElement;

	public constructor(canvas: HTMLCanvasElement) {
		super('WebGL context was lost while rendering effects');
		this.name = 'WebGLContextLostError';
		this.canvas = canvas;
	}
}
