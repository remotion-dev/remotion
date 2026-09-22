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
import {WHITE_ALPHA_70, WHITE_ALPHA_60} from '../helpers/colors';
import {TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM} from '../helpers/get-timeline-max-zoom';
import {TIMELINE_BORDER} from '../helpers/timeline-layout';

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
};

const volumeCanvasStyle: React.CSSProperties = {
	position: 'absolute',
};

const parseVolume = (volume: string | number): WaveformVolume => {
	if (typeof volume === 'number') {
		return volume;
	}

	return volume.split(',').map((v) => Number(v));
};

const AudioWaveformInner: React.FC<{
	readonly src: string;
	readonly height: number;
	readonly visualizationWidth: number;
	readonly startFrom: number;
	readonly durationInFrames: number;
	readonly displayOffsetInFrames: number;
	readonly displayDurationInFrames: number;
	readonly volume: string | number;
	readonly doesVolumeChange: boolean;
	readonly muted: boolean;
	readonly playbackRate: number;
	readonly loopDisplay: LoopDisplay | undefined;
}> = ({
	src,
	height,
	startFrom,
	durationInFrames,
	displayOffsetInFrames,
	displayDurationInFrames,
	visualizationWidth,
	volume,
	doesVolumeChange,
	muted,
	playbackRate,
	loopDisplay,
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
	const shouldRenderVolumeOverlay =
		doesVolumeChange && typeof volume === 'string';
	const parsedVolume = useMemo(() => parseVolume(volume), [volume]);
	const visibleVolume = useMemo((): WaveformVolume => {
		if (muted) {
			return 0;
		}

		return getVisibleWaveformVolume({
			displayDurationInFrames,
			displayOffsetInFrames,
			loopDisplay,
			volume: parsedVolume,
		});
	}, [
		displayDurationInFrames,
		displayOffsetInFrames,
		loopDisplay,
		muted,
		parsedVolume,
	]);

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
			displayOffsetInFrames,
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

		const pixelRatio = window.devicePixelRatio;
		const h = Math.ceil(height * pixelRatio);
		const w = Math.ceil(visualizationWidth * pixelRatio);
		const drawingWidth = visualizationWidth * pixelRatio;

		canvasElement.width = w;
		canvasElement.height = h;
		canvasElement.style.width = w / pixelRatio + 'px';
		canvasElement.style.height = h / pixelRatio + 'px';

		drawBars({
			canvas: canvasElement,
			peaks: portionPeaks ?? EMPTY_PEAKS,
			color: WHITE_ALPHA_60,
			volume: visibleVolume,
			width: drawingWidth,
		});
	}, [height, portionPeaks, visibleVolume, visualizationWidth]);

	useLayoutEffect(() => {
		if (!shouldRenderVolumeOverlay) {
			return;
		}

		const {current: volumeCanvasElement} = volumeCanvas;
		if (!volumeCanvasElement) {
			return;
		}

		const pixelRatio = window.devicePixelRatio;
		const h = Math.ceil(height * pixelRatio);
		const w = Math.ceil(visualizationWidth * pixelRatio);
		const drawingWidth = visualizationWidth * pixelRatio;
		const context = volumeCanvasElement.getContext('2d');
		if (!context) {
			return;
		}

		volumeCanvasElement.width = w;
		volumeCanvasElement.height = h;
		volumeCanvasElement.style.width = w / pixelRatio + 'px';
		volumeCanvasElement.style.height = h / pixelRatio + 'px';

		context.clearRect(0, 0, w, h);
		if (!Array.isArray(visibleVolume)) {
			return;
		}

		context.beginPath();
		context.moveTo(0, h);
		visibleVolume.forEach((v, index) => {
			const x =
				visibleVolume.length <= 1
					? 0
					: (index / (visibleVolume.length - 1)) * drawingWidth;
			const y = (1 - v) * (h - TIMELINE_BORDER * 2 * pixelRatio) + pixelRatio;
			if (index === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		});
		context.strokeStyle = WHITE_ALPHA_70;
		context.lineWidth = pixelRatio;
		context.stroke();
	}, [height, shouldRenderVolumeOverlay, visibleVolume, visualizationWidth]);

	if (error) {
		return null;
	}

	if (!peaks) {
		return null;
	}

	return (
		<div style={getContainerStyle(height)}>
			<canvas ref={waveformCanvas} style={waveformCanvasStyle} />
			{shouldRenderVolumeOverlay ? (
				<canvas ref={volumeCanvas} style={volumeCanvasStyle} />
			) : null}
		</div>
	);
};

export const AudioWaveform = React.memo(AudioWaveformInner);
