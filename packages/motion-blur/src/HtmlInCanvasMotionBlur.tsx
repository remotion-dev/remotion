import React, {useCallback, useContext, useRef} from 'react';
import {
	Freeze,
	HtmlInCanvas,
	type HtmlInCanvasOnInit,
	type HtmlInCanvasOnPaint,
	Interactive,
	type InteractiveBaseProps,
	type InteractivePremountProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	Internals,
	type SequenceControls,
	useCurrentFrame,
	useRemotionEnvironment,
	useVideoConfig,
} from 'remotion';
import {
	createMotionBlurCompositor,
	getMotionBlurGpuDevice,
} from './motion-blur-compositor';
import {
	MotionBlurSampleProvider,
	useMotionBlurRegistry,
	type MotionBlurRegistry,
} from './motion-blur-context';

export type HtmlInCanvasMotionBlurProps = InteractiveBaseProps &
	InteractivePremountProps &
	InteractiveTransformProps & {
		readonly children: React.ReactNode;
		readonly width: number;
		readonly height: number;
		readonly shutterAngle?: number;
		readonly samples?: number;
		readonly disabled?: boolean;
		readonly disabledInPreview?: boolean;
	};

const htmlInCanvasMotionBlurSchema = {
	...Interactive.baseSchema,
	...Interactive.transformSchema,
	shutterAngle: {
		type: 'number',
		min: 0,
		max: 360,
		step: 1,
		default: 180,
		description: 'Shutter angle',
		hiddenFromList: false,
	},
	samples: {
		type: 'number',
		min: 1,
		max: 64,
		step: 1,
		integer: true,
		default: 8,
		description: 'Samples',
		hiddenFromList: false,
		keyframable: false,
	},
	disabled: {
		type: 'boolean',
		default: false,
		description: 'Disabled',
	},
	disabledInPreview: {
		type: 'boolean',
		default: false,
		description: 'Disabled in preview',
		keyframable: false,
	},
} as const satisfies InteractivitySchema;

type MotionBlurSampleProps = {
	readonly children: React.ReactNode;
	readonly width: number;
	readonly height: number;
	readonly index: number;
	readonly count: number;
	readonly shutterInFrames: number;
	readonly firstFrame: number;
	readonly lastFrame: number;
	readonly registry: MotionBlurRegistry;
};

const MotionBlurSample: React.FC<MotionBlurSampleProps> = ({
	children,
	width,
	height,
	index,
	count,
	shutterInFrames,
	firstFrame,
	lastFrame,
	registry,
}) => {
	const frame = useCurrentFrame();
	const isRepresentativeSample = index === 0;
	const sampleFrame = isRepresentativeSample
		? frame
		: Math.max(
				firstFrame,
				Math.min(
					lastFrame,
					frame + ((index - 0.5) / count - 0.5) * shutterInFrames,
				),
			);

	return (
		<div
			aria-hidden={!isRepresentativeSample}
			// The first sample is captured through HtmlInCanvas's drawable root.
			// Only its canvas siblings need separate drawable paint records.
			{...(index === 0 ? {} : {drawable: ''})}
			style={{
				position: 'absolute',
				inset: 0,
				width,
				height,
				isolation: 'isolate',
				// Copied-mode HtmlInCanvas hides the layout canvas, so each drawable
				// sample must remain visible to retain its capture paint record.
				// Issue: https://github.com/remotion-dev/remotion/issues/12656
				// Test: https://github.com/remotion-dev/remotion/blob/5d2ff05db91c1e5a02fc3d01f359638e98807882/packages/it-tests/src/ssr/render-frames.test.ts#L77
				visibility: 'visible',
				pointerEvents: isRepresentativeSample ? 'auto' : 'none',
			}}
		>
			<Freeze frame={sampleFrame} active={!isRepresentativeSample}>
				<MotionBlurSampleProvider sampleIndex={index} registry={registry}>
					{children}
				</MotionBlurSampleProvider>
			</Freeze>
		</div>
	);
};

const HtmlInCanvasMotionBlurInner: React.FC<
	HtmlInCanvasMotionBlurProps & {
		readonly controls: SequenceControls | null | undefined;
	}
> = ({
	children,
	width,
	height,
	shutterAngle = 180,
	samples = 8,
	disabled = false,
	disabledInPreview = false,
	from,
	durationInFrames,
	trimBefore,
	playbackRate,
	loop,
	freeze,
	hidden,
	name,
	premountFor,
	postmountFor,
	showInTimeline,
	style,
	styleWhilePremounted,
	styleWhilePostmounted,
	controls,
}) => {
	const {durationInFrames: compositionDurationInFrames} = useVideoConfig();
	const parentTrimBefore =
		useContext(Internals.SequenceContext)?.trimBefore ?? 0;
	const {isRendering} = useRemotionEnvironment();
	const videoEnabled = Internals.useVideoEnabled();
	const preferredBackend = useContext(Internals.PreferredEffectBackendContext);
	const registry = useMotionBlurRegistry('HtmlInCanvasMotionBlur');
	const gpuDeviceRef = useRef<GPUDevice | null>(null);
	const compositorRef = useRef<{
		compositor: ReturnType<typeof createMotionBlurCompositor>;
		width: number;
		height: number;
		preferWebGl: boolean;
	} | null>(null);

	if (!Number.isInteger(samples) || samples < 1 || samples > 64) {
		throw new TypeError(
			`"samples" must be an integer between 1 and 64, but got ${String(samples)}`,
		);
	}

	if (
		typeof shutterAngle !== 'number' ||
		!Number.isFinite(shutterAngle) ||
		shutterAngle < 0 ||
		shutterAngle > 360
	) {
		throw new TypeError(
			`"shutterAngle" must be between 0 and 360, but got ${String(shutterAngle)}`,
		);
	}

	// Keep the first sample mounted when blur is disabled so the canvas stays visible.
	// Audio-only frames mount the children once so their audio is captured once.
	const actualSamples =
		disabled ||
		(disabledInPreview && !isRendering) ||
		shutterAngle === 0 ||
		!videoEnabled
			? 1
			: samples;
	const renderedSampleCount = actualSamples === 1 ? 1 : actualSamples + 1;
	const shutterInFrames = (shutterAngle / 360) * (playbackRate ?? 1);
	const firstFrame = trimBefore ?? 0;
	const visibleDuration = Math.max(
		0,
		Math.min(
			Internals.resolveSequenceDuration({
				durationInFrames,
				playbackRate,
				loop,
			}),
			compositionDurationInFrames + parentTrimBefore - (from ?? 0),
		),
	);
	const lastFrame =
		firstFrame + Math.max(0, visibleDuration - 1) * (playbackRate ?? 1);

	const onInit: HtmlInCanvasOnInit = useCallback(async () => {
		gpuDeviceRef.current = await getMotionBlurGpuDevice();
		return () => {
			gpuDeviceRef.current = null;
			compositorRef.current?.compositor.dispose();
			compositorRef.current = null;
		};
	}, []);

	const onPaint: HtmlInCanvasOnPaint = useCallback(
		({canvas, element, elementImage}) => {
			const context = canvas.getContext('2d');
			if (!context) {
				throw new Error('Failed to acquire 2D context for motion blur');
			}

			const layoutCanvas = element.parentElement;
			if (!(layoutCanvas instanceof HTMLCanvasElement)) {
				throw new Error('Failed to find the HTML-in-canvas layout canvas');
			}

			const captureElements = Array.from(layoutCanvas.children);
			if (
				captureElements.length !== renderedSampleCount ||
				captureElements[0] !== element
			) {
				throw new Error('Motion blur samples are not ready to paint');
			}

			if (actualSamples === 1) {
				compositorRef.current?.compositor.dispose();
				compositorRef.current = null;
				context.reset();
				context.drawElementImage(elementImage, 0, 0);
				return;
			}

			const preferWebGl =
				(preferredBackend ?? window.remotion_preferredEffectBackend) ===
					'webgl2' || Boolean(window.remotion_disableWebGpuEffects);
			if (compositorRef.current?.compositor.isLost()) {
				if (compositorRef.current.compositor.backend === 'webgpu') {
					gpuDeviceRef.current = null;
				}

				compositorRef.current.compositor.dispose();
				compositorRef.current = null;
			}

			if (
				compositorRef.current === null ||
				compositorRef.current.width !== canvas.width ||
				compositorRef.current.height !== canvas.height ||
				compositorRef.current.preferWebGl !== preferWebGl
			) {
				compositorRef.current?.compositor.dispose();
				compositorRef.current = null;
				const createdCompositor = createMotionBlurCompositor({
					width: canvas.width,
					height: canvas.height,
					device: preferWebGl ? null : gpuDeviceRef.current,
					requestPaint: () => layoutCanvas.requestPaint?.(),
				});
				compositorRef.current = {
					compositor: createdCompositor,
					width: canvas.width,
					height: canvas.height,
					preferWebGl,
				};
			}

			const {compositor} = compositorRef.current;
			const sampleWeight = 1 / actualSamples;
			for (const [index, sampleElement] of captureElements.slice(1).entries()) {
				const image = layoutCanvas.captureElementImage(sampleElement);
				try {
					// ElementImage can only be drawn back to its originating canvas.
					context.reset();
					context.drawElementImage(image, 0, 0);
					compositor.addSample(canvas, index, sampleWeight);
				} finally {
					image.close();
				}
			}

			context.reset();
			context.drawImage(compositor.finish(), 0, 0);
		},
		[actualSamples, preferredBackend, renderedSampleCount],
	);

	const passThrough = Internals.useHtmlInCanvasUnsupportedMessage() !== null;
	if (registry === null) return null;

	const sampleElements = Array.from(
		{length: passThrough ? 0 : renderedSampleCount},
		(_, index) => {
			return (
				<MotionBlurSample
					key={index}
					width={width}
					height={height}
					index={index}
					count={actualSamples}
					shutterInFrames={shutterInFrames}
					firstFrame={firstFrame}
					lastFrame={lastFrame}
					registry={registry}
				>
					{children}
				</MotionBlurSample>
			);
		},
	);

	// The root wrapper holds the first sample. The rest must be canvas children.
	// Reuse HtmlInCanvas's Sequence for the motion blur controls.
	return (
		<HtmlInCanvas
			width={width}
			height={height}
			from={from}
			durationInFrames={durationInFrames}
			trimBefore={trimBefore}
			playbackRate={playbackRate}
			loop={loop}
			freeze={freeze}
			hidden={hidden}
			name={name ?? '<HtmlInCanvasMotionBlur>'}
			premountFor={premountFor}
			postmountFor={postmountFor}
			showInTimeline={showInTimeline}
			style={style}
			styleWhilePremounted={styleWhilePremounted}
			styleWhilePostmounted={styleWhilePostmounted}
			{...{controls}}
			onPaint={onPaint}
			onInit={onInit}
			_remotionInternalCanvasSiblings={sampleElements.slice(1)}
			_remotionInternalFallbackLabel="Motion blur is not visible"
		>
			{passThrough ? children : sampleElements[0]}
		</HtmlInCanvas>
	);
};

/**
 * Experimental motion blur that averages separately captured HTML-in-canvas
 * snapshots of the children at fractional frames. Preview requires Chrome with
 * the experimental HTML-in-canvas flag enabled. Nested HtmlInCanvas components
 * require Chrome 157 or newer.
 */
export const HtmlInCanvasMotionBlur = Interactive.withSchema<
	typeof htmlInCanvasMotionBlurSchema,
	HtmlInCanvasMotionBlurProps
>({
	Component: HtmlInCanvasMotionBlurInner,
	componentName: '<HtmlInCanvasMotionBlur>',
	componentIdentity: 'dev.remotion.motionBlur.HtmlInCanvasMotionBlur',
	schema: htmlInCanvasMotionBlurSchema,
	supportsEffects: false,
});

HtmlInCanvasMotionBlur.displayName = 'HtmlInCanvasMotionBlur';
