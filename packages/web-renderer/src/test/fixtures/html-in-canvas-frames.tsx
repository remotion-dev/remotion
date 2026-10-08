import {invert} from '@remotion/effects/invert';
import {useCallback, useRef} from 'react';
import {
	AbsoluteFill,
	HtmlInCanvas,
	type HtmlInCanvasOnInit,
	type HtmlInCanvasOnPaint,
	Sequence,
	useCurrentFrame,
} from 'remotion';

type GpuDevice = {
	createCommandEncoder(): {
		beginRenderPass(descriptor: unknown): {end(): void};
		finish(): unknown;
	};
	queue: {submit(commands: unknown[]): void};
	destroy(): void;
};
type GpuContext = {
	configure(descriptor: unknown): void;
	getCurrentTexture(): {createView(): unknown};
	unconfigure(): void;
};

export type HtmlInCanvasFramesProps = {
	readonly backend:
		| '2d'
		| 'init-only'
		| 'incremental'
		| 'webgl'
		| 'webgl2'
		| 'webgpu';
	readonly preserveDrawingBuffer: boolean;
	readonly mountAt: number;
	readonly pixelDensity: number;
};

const Paint: React.FC<HtmlInCanvasFramesProps & {readonly frame: number}> = ({
	backend,
	preserveDrawingBuffer,
	frame,
	pixelDensity,
}) => {
	const glRef = useRef<WebGLRenderingContext | WebGL2RenderingContext | null>(
		null,
	);
	const gpuRef = useRef<{device: GpuDevice; context: GpuContext} | null>(null);
	const onInit: HtmlInCanvasOnInit = useCallback(
		async ({canvas}) => {
			// Exercise asynchronous initialization, including the first mounted frame.
			await Promise.resolve();
			if (backend === 'webgpu') {
				const {gpu} = navigator as unknown as {
					gpu: {
						requestAdapter(): Promise<{
							requestDevice(): Promise<GpuDevice>;
						} | null>;
						getPreferredCanvasFormat(): string;
					};
				};
				const adapter = await gpu.requestAdapter();
				if (!adapter) {
					throw new Error('WebGPU adapter unavailable');
				}

				const device = await adapter.requestDevice();
				const context = (
					canvas as unknown as {getContext(id: 'webgpu'): GpuContext}
				).getContext('webgpu');
				context.configure({
					device,
					format: gpu.getPreferredCanvasFormat(),
					alphaMode: 'opaque',
				});
				gpuRef.current = {device, context};
				return () => {
					context.unconfigure();
					device.destroy();
					gpuRef.current = null;
				};
			}

			if (backend === 'incremental') {
				const ctx = canvas.getContext('2d')!;
				ctx.fillStyle = 'blue';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}

			if (backend === 'webgl' || backend === 'webgl2') {
				const attributes = {preserveDrawingBuffer, antialias: false};
				const gl =
					backend === 'webgl'
						? canvas.getContext('webgl', attributes)
						: canvas.getContext('webgl2', attributes);
				if (!gl) {
					throw new Error(`${backend} unavailable`);
				}

				glRef.current = gl;
			}

			return () => {
				glRef.current = null;
			};
		},
		[backend, preserveDrawingBuffer],
	);
	const red = (frame * 37 + 17) % 255;
	const onPaint: HtmlInCanvasOnPaint = useCallback(
		async ({canvas, elementImage}) => {
			if (backend === '2d') {
				const ctx = canvas.getContext('2d')!;
				ctx.reset();
				ctx.drawElementImage(elementImage, 0, 0);
			} else if (backend === 'incremental') {
				const ctx = canvas.getContext('2d')!;
				ctx.fillStyle = `rgb(${red}, 0, 0)`;
				ctx.fillRect(0, 0, 32 * pixelDensity, canvas.height);
			} else if (backend === 'webgpu') {
				const {device, context} = gpuRef.current!;
				const encoder = device.createCommandEncoder();
				const pass = encoder.beginRenderPass({
					colorAttachments: [
						{
							view: context.getCurrentTexture().createView(),
							clearValue: {r: red / 255, g: 0, b: 0, a: 1},
							loadOp: 'clear',
							storeOp: 'store',
						},
					],
				});
				pass.end();
				device.queue.submit([encoder.finish()]);
			} else {
				const gl = glRef.current!;
				gl.clearColor(red / 255, 0, 0, 1);
				gl.clear(gl.COLOR_BUFFER_BIT);
			}

			await Promise.resolve();
		},
		[backend, red, pixelDensity],
	);
	return (
		<HtmlInCanvas
			width={frame === 1 || frame === 51 ? 80 : 64}
			height={64}
			pixelDensity={pixelDensity}
			onInit={onInit}
			onPaint={backend === 'init-only' ? undefined : onPaint}
		>
			<AbsoluteFill style={{backgroundColor: `rgb(${red}, 0, 0)`}} />
		</HtmlInCanvas>
	);
};

const Component: React.FC<HtmlInCanvasFramesProps> = (props) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: 'white'}}>
			<Sequence from={props.mountAt} layout="none">
				<Paint {...props} frame={frame} />
			</Sequence>
		</AbsoluteFill>
	);
};

export const htmlInCanvasFrames = {
	component: Component,
	id: 'html-in-canvas-frames',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 60,
	defaultProps: {
		backend: '2d',
		preserveDrawingBuffer: false,
		mountAt: 0,
		pixelDensity: 2,
	},
} as const;

const paint: HtmlInCanvasOnPaint = ({canvas, elementImage}) => {
	const ctx = canvas.getContext('2d')!;
	ctx.reset();
	ctx.drawElementImage(elementImage, 0, 0);
};

const Nested: React.FC<HtmlInCanvasFramesProps> = (props) => {
	return (
		<HtmlInCanvas width={100} height={100} onPaint={paint} effects={[invert()]}>
			<Component {...props} />
		</HtmlInCanvas>
	);
};

export const htmlInCanvasNestedFrames = {
	...htmlInCanvasFrames,
	id: 'html-in-canvas-nested-frames',
	component: Nested,
} as const;
