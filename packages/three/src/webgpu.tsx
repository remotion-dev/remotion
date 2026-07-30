import {useThree} from '@react-three/fiber';
import {useEffect, useLayoutEffect, useRef} from 'react';
import {useCurrentFrame, useDelayRender} from 'remotion';
import {WebGPURenderer} from 'three/webgpu';
import type {
	ThreeCanvasFrameRendererProps,
	ThreeCanvasProps,
} from './ThreeCanvas';
import {ThreeCanvasInternals} from './ThreeCanvas';

type WebGPURendererWithDevice = WebGPURenderer & {
	readonly backend?: {
		readonly device?: {
			readonly queue?: {
				onSubmittedWorkDone: () => Promise<void>;
			};
		};
	};
};

const waitForGpu = async (renderer: WebGPURendererWithDevice) => {
	await renderer.backend?.device?.queue?.onSubmittedWorkDone();
};

const WebGPUFrameRenderer = ({onRendered}: ThreeCanvasFrameRendererProps) => {
	const {advance, camera, gl, scene} = useThree();
	const frame = useCurrentFrame();
	const {cancelRender, continueRender, delayRender} = useDelayRender();
	const initializationPromise = useRef<Promise<void> | null>(null);
	const frameDelayHandle = useRef<number | null>(null);

	useLayoutEffect(() => {
		frameDelayHandle.current = delayRender(
			`Waiting for WebGPU to render frame ${frame}`,
		);

		return () => {
			if (frameDelayHandle.current !== null) {
				continueRender(frameDelayHandle.current);
				frameDelayHandle.current = null;
			}
		};
	}, [continueRender, delayRender, frame]);

	useEffect(() => {
		let cancelled = false;

		const renderFrame = async () => {
			const renderer = gl as unknown as WebGPURendererWithDevice;
			if (!renderer.isWebGPURenderer) {
				throw new Error(
					'<ThreeWebGPUCanvas> expected a Three.js WebGPURenderer.',
				);
			}

			initializationPromise.current ??= (async () => {
				await renderer.compileAsync(scene, camera);
				// The first WebGPU render initializes material and lighting node bindings
				// which compileAsync() alone does not make ready for frame capture.
				await renderer.renderAsync(scene, camera);
				await waitForGpu(renderer);
			})();
			await initializationPromise.current;
			if (cancelled) {
				return;
			}

			advance(performance.now());
			await waitForGpu(renderer);
			if (cancelled) {
				return;
			}

			if (frameDelayHandle.current !== null) {
				continueRender(frameDelayHandle.current);
				frameDelayHandle.current = null;
			}

			onRendered();
		};

		renderFrame().catch((error) => {
			if (!cancelled) {
				cancelRender(error);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [
		advance,
		camera,
		cancelRender,
		continueRender,
		frame,
		gl,
		onRendered,
		scene,
	]);

	return null;
};

type RendererFactoryProps = Parameters<
	Extract<NonNullable<ThreeCanvasProps['gl']>, (...args: never[]) => unknown>
>[0];

const createWebGPURenderer = async (props: RendererFactoryProps) => {
	const renderer = new WebGPURenderer({
		alpha: props.alpha,
		antialias: props.antialias,
		canvas: props.canvas as HTMLCanvasElement,
		depth: props.depth,
		logarithmicDepthBuffer: props.logarithmicDepthBuffer,
		powerPreference:
			props.powerPreference === 'default' ? undefined : props.powerPreference,
		stencil: props.stencil,
	});
	await renderer.init();
	return renderer;
};

export type ThreeWebGPUCanvasProps = Omit<ThreeCanvasProps, 'gl'>;

/*
 * @description A wrapper for React Three Fiber's <Canvas /> which uses Three.js's WebGPURenderer and synchronizes with Remotion's useCurrentFrame().
 * @see [Documentation](https://www.remotion.dev/docs/three-webgpu-canvas)
 */
export const ThreeWebGPUCanvas = (props: ThreeWebGPUCanvasProps) => {
	return (
		<ThreeCanvasInternals
			{...props}
			gl={createWebGPURenderer}
			FrameRenderer={WebGPUFrameRenderer}
			advanceOnCreated={false}
		/>
	);
};
