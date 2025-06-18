import type {MediaUtilsAudioData} from '@remotion/media-utils';
import {getAudioData, getWaveformPortion} from '@remotion/media-utils';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TRANSPARENT} from '../helpers/colors';
import {
	getTimelineLayerHeight,
	TIMELINE_BORDER,
} from '../helpers/timeline-layout';
import {
	AudioWaveformBar,
	WAVEFORM_BAR_LENGTH,
	WAVEFORM_BAR_MARGIN,
} from './AudioWaveformBar';

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

const canvasStyle: React.CSSProperties = {
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
	const [metadata, setMetadata] = useState<MediaUtilsAudioData | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const mountState = useRef({isMounted: true});
	const vidConf = Internals.useUnsafeVideoConfig();
	if (vidConf === null) {
		throw new Error('Expected video config');
	}

	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const {current} = mountState;
		current.isMounted = true;
		return () => {
			current.isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		const context = canvas.current.getContext('2d');
		if (!context) {
			return;
		}

		context.clearRect(
			0,
			0,
			visualizationWidth,
			getTimelineLayerHeight('other'),
		);
		if (!doesVolumeChange || typeof volume === 'number') {
			// The volume is a number, meaning it could change on each frame-
			// User did not use the (f: number) => number syntax, so we can't draw
			// a visualization.
			return;
		}

		const volumes = volume.split(',').map((v) => Number(v));
		context.beginPath();
		context.moveTo(0, getTimelineLayerHeight('other'));
		volumes.forEach((v, index) => {
			const x = (index / (volumes.length - 1)) * visualizationWidth;
			const y =
				(1 - v) * (getTimelineLayerHeight('other') - TIMELINE_BORDER * 2) + 1;
			if (index === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		});
		context.strokeStyle = LIGHT_TRANSPARENT;
		context.stroke();
	}, [visualizationWidth, metadata, startFrom, volume, doesVolumeChange]);

	useEffect(() => {
		setError(null);
		getAudioData(src)
			.then((data) => {
				if (mountState.current.isMounted) {
					setMetadata(data);
				}
			})
			.catch((err) => {
				if (mountState.current.isMounted) {
					setError(err);
				}
			});
	}, [src, vidConf.fps]);

	const normalized = useMemo(() => {
		if (!metadata || metadata.numberOfChannels === 0) {
			return [];
		}

		const numberOfSamples = Math.floor(
			visualizationWidth / (WAVEFORM_BAR_LENGTH + WAVEFORM_BAR_MARGIN),
		);

		return getWaveformPortion({
			audioData: metadata,
			startTimeInSeconds: startFrom / vidConf.fps,
			durationInSeconds: Math.min(
				(durationInFrames / vidConf.fps) * playbackRate,
				metadata.durationInSeconds,
			),
			numberOfSamples,
			normalize: false,
		});
	}, [
		durationInFrames,
		vidConf.fps,
		metadata,
		playbackRate,
		startFrom,
		visualizationWidth,
	]);

	if (error) {
		return (
			<div style={container}>
				<div style={errorMessage}>
					No waveform available. Audio might not support CORS.
				</div>
			</div>
		);
	}

	if (!metadata) {
		return null;
	}

	return (
		<div style={container}>
			{normalized.map((w) => {
				return (
					<AudioWaveformBar
						key={w.index}
						amplitude={w.amplitude * (typeof volume === 'number' ? volume : 1)}
					/>
				);
			})}

			<canvas
				ref={canvas}
				style={canvasStyle}
				width={visualizationWidth}
				height={getTimelineLayerHeight('other')}
			/>
		</div>
	);
};
