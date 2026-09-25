import React, {useCallback} from 'react';
import {
	Freeze,
	HtmlInCanvas,
	Internals,
	type HtmlInCanvasProps,
	type HtmlInCanvasOnPaint,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export type HtmlInCanvasMotionBlurProps = Pick<
	HtmlInCanvasProps,
	| 'from'
	| 'durationInFrames'
	| 'trimBefore'
	| 'trimAfter'
	| 'playbackRate'
	| 'loop'
> & {
	readonly children: React.ReactNode;
	readonly width: number;
	readonly height: number;
	readonly shutterAngle?: number;
	readonly samples?: number;
};

type MotionBlurSampleProps = {
	readonly children: React.ReactNode;
	readonly width: number;
	readonly height: number;
	readonly index: number;
	readonly count: number;
	readonly shutterInFrames: number;
	readonly firstFrame: number;
	readonly lastFrame: number;
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
}) => {
	const frame = useCurrentFrame();
	const sampleFrame = Math.max(
		firstFrame,
		Math.min(
			lastFrame,
			frame + ((index + 0.5) / count - 0.5) * shutterInFrames,
		),
	);

	return (
		<div
			aria-hidden={index !== Math.floor(count / 2)}
			// Each sample has its own paint record so it can be captured separately.
			{...{drawable: ''}}
			style={{
				position: 'absolute',
				inset: 0,
				width,
				height,
				isolation: 'isolate',
				pointerEvents: index === Math.floor(count / 2) ? 'auto' : 'none',
			}}
		>
			<Freeze frame={sampleFrame}>{children}</Freeze>
		</div>
	);
};

/**
 * Experimental motion blur that averages separately captured HTML-in-canvas
 * snapshots of the children at fractional frames. Preview requires Chrome with
 * the experimental HTML-in-canvas flag enabled. Nested HtmlInCanvas components
 * are currently unsupported.
 */
export const HtmlInCanvasMotionBlur: React.FC<HtmlInCanvasMotionBlurProps> = ({
	children,
	width,
	height,
	shutterAngle = 180,
	samples = 8,
	from,
	durationInFrames,
	trimBefore,
	trimAfter,
	playbackRate,
	loop,
}) => {
	const {durationInFrames: compositionDurationInFrames} = useVideoConfig();

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

	const actualSamples = shutterAngle === 0 ? 1 : samples;
	const shutterInFrames = (shutterAngle / 360) * (playbackRate ?? 1);
	const firstFrame = trimBefore ?? 0;
	const visibleDuration = Math.max(
		0,
		Math.min(
			Internals.resolveSequenceDuration({
				durationInFrames,
				trimBefore,
				trimAfter,
				playbackRate,
				loop,
			}),
			compositionDurationInFrames - (from ?? 0),
		),
	);
	const lastFrame =
		firstFrame + Math.max(0, visibleDuration - 1) * (playbackRate ?? 1);

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
				captureElements.length !== actualSamples ||
				captureElements[0] !== element
			) {
				throw new Error('Motion blur samples are not ready to paint');
			}

			context.reset();
			context.globalCompositeOperation = 'lighter';
			context.globalAlpha = 1 / actualSamples;

			for (const [index, sampleElement] of captureElements.entries()) {
				const image =
					index === 0
						? elementImage
						: layoutCanvas.captureElementImage(sampleElement);
				try {
					const sampleTransform = context.drawElementImage(image, 0, 0);
					if (index === Math.floor(actualSamples / 2)) {
						(sampleElement as HTMLElement).style.transform =
							sampleTransform.toString();
					}
				} finally {
					if (index !== 0) {
						image.close();
					}
				}
			}
		},
		[actualSamples],
	);

	const sampleElements = Array.from({length: actualSamples}, (_, index) => {
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
			>
				{children}
			</MotionBlurSample>
		);
	});

	// The root wrapper holds the first sample. The rest must be canvas children.
	return (
		<HtmlInCanvas
			width={width}
			height={height}
			from={from}
			durationInFrames={durationInFrames}
			trimBefore={trimBefore}
			trimAfter={trimAfter}
			playbackRate={playbackRate}
			loop={loop}
			name="<HtmlInCanvasMotionBlur>"
			onPaint={onPaint}
			_remotionInternalCanvasSiblings={sampleElements.slice(1)}
		>
			{sampleElements[0]}
		</HtmlInCanvas>
	);
};
