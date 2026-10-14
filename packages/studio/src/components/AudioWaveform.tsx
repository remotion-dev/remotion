import {
	drawBars,
	subscribeToWaveformPeaks,
	type WaveformDrawRange,
} from '@remotion/timeline-utils';
import React, {useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {LoopDisplay} from 'remotion';
import {Internals} from 'remotion';
import {alignCanvasToDevicePixels} from '../helpers/align-canvas-to-device-pixels';
import {BLACK_ALPHA_60, WHITE_ALPHA_60} from '../helpers/colors';
import {TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM} from '../helpers/get-timeline-max-zoom';
import {resolveStudioColor} from '../helpers/resolve-studio-color';
import {getStudioPixelRatio} from '../helpers/studio-pixel-ratio';
import type {TimelineVolume} from './Timeline/get-timeline-volume';

const EMPTY_PEAKS = new Float32Array(0);

const getContainerStyle = (height: number): React.CSSProperties => {
	return {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		position: 'relative',
		width: '100%',
		height,
		overflow: 'hidden',
	};
};

const waveformCanvasStyle: React.CSSProperties = {
	pointerEvents: 'none',
	flexShrink: 0,
	position: 'relative',
};

const volumeCanvasStyle: React.CSSProperties = {
	pointerEvents: 'none',
	position: 'absolute',
};

const AudioWaveformInner: React.FC<{
	readonly src: string;
	readonly height: number;
	readonly visualizationWidth: number;
	readonly startFrom: number;
	readonly durationInFrames: number;
	readonly displayOffsetInFrames: number;
	readonly displayDurationInFrames: number;
	readonly volume: TimelineVolume;
	readonly muted: boolean;
	readonly playbackRate: number;
	readonly loopDisplay: LoopDisplay | undefined;
	readonly loopDisplayOffsetInFrames: number;
}> = ({
	src,
	height,
	startFrom,
	durationInFrames,
	displayOffsetInFrames,
	displayDurationInFrames,
	visualizationWidth,
	volume,
	muted,
	playbackRate,
	loopDisplay,
	loopDisplayOffsetInFrames,
}) => {
	const [peaks, setPeaks] = useState<Float32Array | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const vidConf = Internals.useUnsafeVideoConfig();
	if (vidConf === null) {
		throw new Error('Expected video config');
	}

	const waveformSampleRate = Math.ceil(
		vidConf.fps * TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM,
	);

	const waveformCanvas = useRef<HTMLCanvasElement>(null);
	const volumeCanvas = useRef<HTMLCanvasElement>(null);
	const shouldRenderVolumeOverlay = volume.type !== 'constant';
	const visualizationMaxVolume = useMemo(() => {
		if (volume.type === 'constant') {
			return Math.max(1, volume.value);
		}

		if (volume.type === 'linear') {
			return volume.points.reduce(
				(highest, point) => Math.max(highest, point.value),
				1,
			);
		}

		return volume.samples.reduce((highest, value) => {
			return Number.isFinite(value) ? Math.max(highest, value) : highest;
		}, 1);
	}, [volume]);
	const visibleVolume = useMemo((): TimelineVolume => {
		if (muted) {
			return {type: 'constant', value: 0};
		}

		if (volume.type !== 'sampled') {
			return volume;
		}

		if (
			!Number.isFinite(displayDurationInFrames) ||
			displayDurationInFrames <= 0
		) {
			return {type: 'sampled', samples: []};
		}

		// Samples already cover the composition timeline, including media loops.
		return {
			type: 'sampled',
			samples: volume.samples.slice(
				Math.max(0, Math.floor(displayOffsetInFrames)),
				Math.min(
					volume.samples.length,
					Math.ceil(displayOffsetInFrames + displayDurationInFrames),
				),
			),
		};
	}, [displayDurationInFrames, displayOffsetInFrames, muted, volume]);
	const waveformVolume =
		visibleVolume.type === 'constant' ? visibleVolume.value : 1;

	// Layout effect so that a cache hit sets the peaks synchronously and the
	// waveform is painted on the very first frame after mounting.
	useLayoutEffect(() => {
		setPeaks(null);
		setError(null);

		return subscribeToWaveformPeaks({
			src,
			waveformSampleRate,
			onPeaks: (p) => setPeaks(p),
			onError: (err) => setError(err),
		});
	}, [src, waveformSampleRate]);

	const peakRange = useMemo((): WaveformDrawRange => {
		const peaksPerFrame = (waveformSampleRate * playbackRate) / vidConf.fps;
		const loop = loopDisplay !== undefined && loopDisplay.durationInFrames > 0;
		return {
			sourceStart: (startFrom / vidConf.fps) * waveformSampleRate,
			sourceDuration:
				(loop ? loopDisplay.durationInFrames : durationInFrames) *
				peaksPerFrame,
			displayStart:
				(displayOffsetInFrames + loopDisplayOffsetInFrames) * peaksPerFrame,
			displayDuration: displayDurationInFrames * peaksPerFrame,
			loop,
		};
	}, [
		displayDurationInFrames,
		displayOffsetInFrames,
		durationInFrames,
		loopDisplay,
		loopDisplayOffsetInFrames,
		playbackRate,
		startFrom,
		vidConf.fps,
		waveformSampleRate,
	]);

	// Drawing must happen in a layout effect: when the timeline zooms, the
	// canvas CSS box resizes in the same commit, and painting the bitmap
	// before the browser paints avoids showing a stretched stale waveform.
	useLayoutEffect(() => {
		const {current: canvasElement} = waveformCanvas;
		if (!canvasElement) {
			return;
		}

		const pixelRatio = getStudioPixelRatio();
		const {horizontalOffset} = alignCanvasToDevicePixels({
			canvas: canvasElement,
			cssHeight: height,
			cssWidth: visualizationWidth,
			pixelRatio,
		});
		const drawingWidth = visualizationWidth * pixelRatio;

		drawBars({
			canvas: canvasElement,
			peaks: peaks ?? EMPTY_PEAKS,
			range: peakRange,
			color: resolveStudioColor(
				WHITE_ALPHA_60,
				getComputedStyle(canvasElement),
			),
			volume: waveformVolume,
			width: drawingWidth,
			horizontalOffset,
		});
	}, [height, peakRange, peaks, visualizationWidth, waveformVolume]);

	useLayoutEffect(() => {
		if (!shouldRenderVolumeOverlay || !peaks) {
			return;
		}

		const {current: volumeCanvasElement} = volumeCanvas;
		if (!volumeCanvasElement) {
			return;
		}

		const pixelRatio = getStudioPixelRatio();
		const {
			height: h,
			horizontalOffset,
			width: w,
		} = alignCanvasToDevicePixels({
			canvas: volumeCanvasElement,
			cssHeight: height,
			cssWidth: visualizationWidth,
			pixelRatio,
		});
		const drawingWidth = visualizationWidth * pixelRatio;
		const context = volumeCanvasElement.getContext('2d');
		if (!context) {
			return;
		}

		context.clearRect(0, 0, w, h);
		if (visibleVolume.type === 'constant' || drawingWidth <= 0 || h <= 0) {
			return;
		}

		context.setTransform(1, 0, 0, 1, horizontalOffset, 0);
		context.beginPath();
		context.moveTo(0, 0);
		if (visibleVolume.type === 'linear') {
			for (const point of visibleVolume.points) {
				context.lineTo(
					((point.frame - displayOffsetInFrames) / displayDurationInFrames) *
						drawingWidth,
					Math.max(
						0,
						Math.min(h, (1 - point.value / visualizationMaxVolume) * h),
					),
				);
			}
		} else {
			// The canvas only spans the virtualized range. Sampling by its physical
			// width keeps drawing work bounded to the visible part of the timeline.
			const numberOfPoints = Math.min(
				visibleVolume.samples.length,
				Math.max(1, Math.ceil(drawingWidth)),
			);
			for (let point = 0; point < numberOfPoints; point++) {
				const volumeIndex = Math.floor(
					(point / numberOfPoints) * visibleVolume.samples.length,
				);
				const nextVolumeIndex = Math.floor(
					((point + 1) / numberOfPoints) * visibleVolume.samples.length,
				);
				const firstFrame = Math.max(0, Math.floor(displayOffsetInFrames));
				const x = Math.max(
					0,
					((firstFrame + volumeIndex - displayOffsetInFrames) /
						displayDurationInFrames) *
						drawingWidth,
				);
				const nextX =
					point === numberOfPoints - 1
						? drawingWidth
						: Math.min(
								drawingWidth,
								((firstFrame + nextVolumeIndex - displayOffsetInFrames) /
									displayDurationInFrames) *
									drawingWidth,
							);
				const unclampedY =
					(1 -
						(visibleVolume.samples[volumeIndex] ?? 1) /
							visualizationMaxVolume) *
					h;
				const y = Math.max(0, Math.min(h, unclampedY));
				// Volume samples apply for one frame. Keep each value until the next
				// frame boundary instead of blending a hold into a diagonal ramp.
				context.lineTo(x, y);
				context.lineTo(nextX, y);
			}
		}

		context.lineTo(drawingWidth, 0);
		context.closePath();
		context.fillStyle = resolveStudioColor(
			BLACK_ALPHA_60,
			getComputedStyle(volumeCanvasElement),
		);
		context.fill();
	}, [
		displayDurationInFrames,
		displayOffsetInFrames,
		height,
		peaks,
		shouldRenderVolumeOverlay,
		visualizationMaxVolume,
		visibleVolume,
		visualizationWidth,
	]);

	if (error) {
		return null;
	}

	if (!peaks) {
		return null;
	}

	return (
		<div style={getContainerStyle(height)}>
			<canvas ref={waveformCanvas} style={waveformCanvasStyle} />
			{/* Paint the volume shade over the waveform as well as its background. */}
			{shouldRenderVolumeOverlay ? (
				<canvas ref={volumeCanvas} style={volumeCanvasStyle} />
			) : null}
		</div>
	);
};

export const AudioWaveform = React.memo(AudioWaveformInner);
