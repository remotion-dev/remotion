import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TRANSPARENT} from '../helpers/colors';
import {
	getTimelineLayerHeight,
	TIMELINE_BORDER,
} from '../helpers/timeline-layout';
import {drawPeaks} from './draw-peaks';
import {loadWaveformPeaks, TARGET_SAMPLE_RATE} from './load-waveform-peaks';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'flex-end',
	position: 'absolute',
	height: getTimelineLayerHeight('other'),
};

const errorMessage: React.CSSProperties = {
	fontSize: 13,
	paddingTop: 6,
	paddingBottom: 6,
	paddingLeft: 12,
	paddingRight: 12,
	alignSelf: 'flex-start',
	maxWidth: 450,
	opacity: 0.75,
};

const waveformCanvasStyle: React.CSSProperties = {
	pointerEvents: 'none',
};

const volumeCanvasStyle: React.CSSProperties = {
	position: 'absolute',
};

export const AudioWaveform: React.FC<{
	readonly src: string;
	readonly visualizationWidth: number;
	readonly startFrom: number;
	readonly durationInFrames: number;
	readonly volume: string | number;
	readonly doesVolumeChange: boolean;
	readonly playbackRate: number;
}> = ({
	src,
	startFrom,
	durationInFrames,
	visualizationWidth,
	volume,
	doesVolumeChange,
	playbackRate,
}) => {
	const [peaks, setPeaks] = useState<Float32Array | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const vidConf = Internals.useUnsafeVideoConfig();
	if (vidConf === null) {
		throw new Error('Expected video config');
	}

	const waveformCanvas = useRef<HTMLCanvasElement>(null);
	const volumeCanvas = useRef<HTMLCanvasElement>(null);

	const height = getTimelineLayerHeight('other');

	useEffect(() => {
		const controller = new AbortController();

		setError(null);
		loadWaveformPeaks(src, controller.signal)
			.then((p) => {
				if (!controller.signal.aborted) {
					setPeaks(p);
				}
			})
			.catch((err) => {
				if (!controller.signal.aborted) {
					setError(err);
				}
			});

		return () => controller.abort();
	}, [src]);

	const portionPeaks = useMemo(() => {
		if (!peaks || peaks.length === 0) {
			return null;
		}

		const startTimeInSeconds = startFrom / vidConf.fps;
		const durationInSeconds = (durationInFrames / vidConf.fps) * playbackRate;

		const startPeakIndex = Math.floor(startTimeInSeconds * TARGET_SAMPLE_RATE);
		const endPeakIndex = Math.ceil(
			(startTimeInSeconds + durationInSeconds) * TARGET_SAMPLE_RATE,
		);

		return peaks.slice(
			Math.max(0, startPeakIndex),
			Math.min(peaks.length, endPeakIndex),
		);
	}, [peaks, startFrom, durationInFrames, vidConf.fps, playbackRate]);

	useEffect(() => {
		const {current: canvasElement} = waveformCanvas;
		if (!canvasElement || !portionPeaks || portionPeaks.length === 0) {
			return;
		}

		const w = Math.ceil(visualizationWidth);
		canvasElement.width = w;
		canvasElement.height = height;

		const vol = typeof volume === 'number' ? volume : 1;
		drawPeaks(canvasElement, portionPeaks, 'rgba(255, 255, 255, 0.6)', vol, w);
	}, [portionPeaks, visualizationWidth, volume, height]);

	useEffect(() => {
		if (!volumeCanvas.current) {
			return;
		}

		const context = volumeCanvas.current.getContext('2d');
		if (!context) {
			return;
		}

		context.clearRect(0, 0, visualizationWidth, height);
		if (!doesVolumeChange || typeof volume === 'number') {
			return;
		}

		const volumes = volume.split(',').map((v) => Number(v));
		context.beginPath();
		context.moveTo(0, height);
		volumes.forEach((v, index) => {
			const x = (index / (volumes.length - 1)) * visualizationWidth;
			const y = (1 - v) * (height - TIMELINE_BORDER * 2) + 1;
			if (index === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		});
		context.strokeStyle = LIGHT_TRANSPARENT;
		context.stroke();
	}, [visualizationWidth, volume, doesVolumeChange, height]);

	if (error) {
		return (
			<div style={container}>
				<div style={errorMessage}>
					No waveform available. Audio might not support CORS.
				</div>
			</div>
		);
	}

	if (!peaks) {
		return null;
	}

	return (
		<div style={container}>
			<canvas ref={waveformCanvas} style={waveformCanvasStyle} />
			<canvas
				ref={volumeCanvas}
				style={volumeCanvasStyle}
				width={visualizationWidth}
				height={height}
			/>
		</div>
	);
};
