import {
	drawBars,
	getVisibleWaveformVolume,
	sliceVisibleWaveformPeaks,
	subscribeToWaveformPeaks,
	type WaveformVolume,
} from '@remotion/timeline-utils';
import React, {useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {LoopDisplay} from 'remotion';
import {Internals} from 'remotion';
import {alignCanvasToDevicePixels} from '../helpers/align-canvas-to-device-pixels';
import {BLACK_ALPHA_60, WHITE_ALPHA_60} from '../helpers/colors';
import {TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM} from '../helpers/get-timeline-max-zoom';
import {resolveStudioColor} from '../helpers/resolve-studio-color';
import {getStudioPixelRatio} from '../helpers/studio-pixel-ratio';

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
	zIndex: 1,
};

const volumeCanvasStyle: React.CSSProperties = {
	pointerEvents: 'none',
	position: 'absolute',
	zIndex: 0,
};

const AudioWaveformInner: React.FC<{
	readonly src: string;
	readonly height: number;
	readonly visualizationWidth: number;
	readonly startFrom: number;
	readonly durationInFrames: number;
	readonly displayOffsetInFrames: number;
	readonly displayDurationInFrames: number;
	readonly volume: WaveformVolume;
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
	const shouldRenderVolumeOverlay = typeof volume !== 'number';
	const visualizationMaxVolume = useMemo(() => {
		if (typeof volume === 'number') {
			return Math.max(1, volume);
		}

		return volume.reduce((highest, value) => {
			return Number.isFinite(value) ? Math.max(highest, value) : highest;
		}, 1);
	}, [volume]);
	const visibleVolume = useMemo((): WaveformVolume => {
		if (muted) {
			return 0;
		}

		return getVisibleWaveformVolume({
			displayDurationInFrames,
			displayOffsetInFrames,
			volume,
		});
	}, [displayDurationInFrames, displayOffsetInFrames, muted, volume]);

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

	const portionPeaks = useMemo(() => {
		if (!peaks) {
			return null;
		}

		return sliceVisibleWaveformPeaks({
			displayDurationInFrames,
			displayOffsetInFrames: displayOffsetInFrames + loopDisplayOffsetInFrames,
			durationInFrames,
			fps: vidConf.fps,
			loopDisplay,
			peaks,
			playbackRate,
			startFrom,
			waveformSampleRate,
		});
	}, [
		displayDurationInFrames,
		displayOffsetInFrames,
		durationInFrames,
		loopDisplay,
		loopDisplayOffsetInFrames,
		peaks,
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
			peaks: portionPeaks ?? EMPTY_PEAKS,
			color: resolveStudioColor(
				WHITE_ALPHA_60,
				getComputedStyle(canvasElement),
			),
			volume: visibleVolume,
			width: drawingWidth,
			horizontalOffset,
		});
	}, [height, portionPeaks, visibleVolume, visualizationWidth]);

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
		if (
			!Array.isArray(visibleVolume) ||
			visibleVolume.length === 0 ||
			drawingWidth <= 0 ||
			h <= 0
		) {
			return;
		}

		context.setTransform(1, 0, 0, 1, horizontalOffset, 0);
		context.beginPath();
		context.moveTo(0, 0);
		// The canvas only spans the virtualized range. Sampling by its physical
		// width keeps drawing work bounded to the visible part of the timeline.
		const numberOfPoints = Math.min(
			visibleVolume.length,
			Math.max(1, Math.ceil(drawingWidth)),
		);
		for (let point = 0; point < numberOfPoints; point++) {
			const volumeIndex = Math.floor(
				(point / numberOfPoints) * visibleVolume.length,
			);
			const nextVolumeIndex = Math.floor(
				((point + 1) / numberOfPoints) * visibleVolume.length,
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
				(1 - (visibleVolume[volumeIndex] ?? 1) / visualizationMaxVolume) * h;
			const y = Math.max(0, Math.min(h, unclampedY));
			// Volume samples apply for one frame. Keep each value until the next
			// frame boundary instead of blending a hold into a diagonal ramp.
			context.lineTo(x, y);
			context.lineTo(nextX, y);
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
			{shouldRenderVolumeOverlay ? (
				<canvas ref={volumeCanvas} style={volumeCanvasStyle} />
			) : null}
			<canvas ref={waveformCanvas} style={waveformCanvasStyle} />
		</div>
	);
};

export const AudioWaveform = React.memo(AudioWaveformInner);
