/** @jsxImportSource ./Timeline/scene-jsx */
import {
	forEachWaveformBar,
	getDevicePixelAlignedCanvasLayout,
	subscribeToWaveformPeaks,
	WAVEFORM_CLIPPING_COLOR,
	type WaveformDrawRange,
} from '@remotion/timeline-utils';
import React, {useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {LoopDisplay} from 'remotion';
import {Internals} from 'remotion';
import {BLACK_ALPHA_60, WHITE_ALPHA_60} from '../helpers/colors';
import {TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM} from '../helpers/get-timeline-max-zoom';
import {getStudioPixelRatio} from '../helpers/studio-pixel-ratio';
import type {TimelineVolume} from './Timeline/get-timeline-volume';
import type {TimelineCanvasDraw} from './Timeline/pixi-timeline-renderer';
import {useTimelineCanvasDrawing} from './Timeline/TimelineCanvas';

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

	const waveformContainer = useRef<HTMLDivElement>(null);
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
	const waveformDrawing = useMemo((): TimelineCanvasDraw | null => {
		if (!peaks || error) {
			return null;
		}

		return {
			onScroll: false,
			revision: {
				peaks,
				peakRange,
				waveformVolume,
				visualizationWidth,
				height,
				visibleVolume,
				visualizationMaxVolume,
			},
			draw: (graphics, cssWidth, cssHeight, resolveColor) => {
				const pixelRatio = getStudioPixelRatio();
				const {devicePixelRatio} = window;
				const layout = getDevicePixelAlignedCanvasLayout({
					containerLeft:
						waveformContainer.current?.getBoundingClientRect().left ?? 0,
					cssWidth,
					cssHeight,
					devicePixelRatio,
				});
				const resolutionScale = pixelRatio / devicePixelRatio;
				const horizontalOffset = layout.horizontalOffset * resolutionScale;
				const drawingWidth = visualizationWidth * pixelRatio;
				const drawingHeight = Math.ceil(layout.height * resolutionScale);

				const clippingBars: {x: number; y: number; height: number}[] = [];
				forEachWaveformBar({
					peaks,
					range: peakRange,
					volume: waveformVolume,
					width: drawingWidth,
					height: drawingHeight,
					horizontalOffset,
					canvasWidth: Math.ceil(layout.width * resolutionScale),
					onBar: ({x, barY, barEnd, clipTopEnd, clipBotStart}) => {
						const left = (x - horizontalOffset) / pixelRatio;
						if (clipBotStart > clipTopEnd) {
							graphics.rect(
								left,
								clipTopEnd / pixelRatio,
								1 / pixelRatio,
								(clipBotStart - clipTopEnd) / pixelRatio,
							);
						}

						if (clipTopEnd > barY) {
							clippingBars.push({
								x: left,
								y: barY / pixelRatio,
								height: (clipTopEnd - barY) / pixelRatio,
							});
						}

						if (barEnd > clipBotStart) {
							clippingBars.push({
								x: left,
								y: clipBotStart / pixelRatio,
								height: (barEnd - clipBotStart) / pixelRatio,
							});
						}
					},
				});
				// Batch each color into one fill instead of writing every bitmap pixel.
				graphics.fill({color: resolveColor(WHITE_ALPHA_60), alpha: 1});
				if (clippingBars.length > 0) {
					for (const bar of clippingBars) {
						graphics.rect(bar.x, bar.y, 1 / pixelRatio, bar.height);
					}

					graphics.fill({color: WAVEFORM_CLIPPING_COLOR, alpha: 1});
				}

				// Paint the volume shade over the waveform as well as its background.
				if (
					visibleVolume.type !== 'constant' &&
					drawingWidth > 0 &&
					drawingHeight > 0
				) {
					graphics.beginPath();
					graphics.moveTo(0, 0);
					if (visibleVolume.type === 'linear') {
						for (const point of visibleVolume.points) {
							graphics.lineTo(
								(((point.frame - displayOffsetInFrames) /
									displayDurationInFrames) *
									drawingWidth) /
									pixelRatio,
								Math.max(
									0,
									Math.min(
										drawingHeight,
										(1 - point.value / visualizationMaxVolume) * drawingHeight,
									),
								) / pixelRatio,
							);
						}
					} else {
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
								drawingHeight;
							const y = Math.max(0, Math.min(drawingHeight, unclampedY));
							// Hold each sampled volume until the next frame boundary.
							graphics.lineTo(x / pixelRatio, y / pixelRatio);
							graphics.lineTo(nextX / pixelRatio, y / pixelRatio);
						}
					}

					graphics.lineTo(drawingWidth / pixelRatio, 0);
					graphics.closePath();
					graphics.fill({color: resolveColor(BLACK_ALPHA_60), alpha: 1});
				}
			},
		};
	}, [
		displayDurationInFrames,
		displayOffsetInFrames,
		error,
		height,
		peakRange,
		peaks,
		visualizationMaxVolume,
		visibleVolume,
		visualizationWidth,
		waveformVolume,
	]);
	useTimelineCanvasDrawing(waveformContainer, waveformDrawing);

	if (error) {
		return null;
	}

	if (!peaks) {
		return null;
	}

	return <div ref={waveformContainer} style={getContainerStyle(height)} />;
};

export const AudioWaveform = React.memo(AudioWaveformInner);
