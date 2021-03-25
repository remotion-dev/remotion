import React, {useEffect, useMemo, useState} from 'react';
import {interpolate} from 'remotion';
import {
	AudioContextMetadata,
	getAudioMetadata,
} from '../helpers/get-audio-metadata';
import {getWaveformSamples} from '../helpers/reduce-waveform';
import {TIMELINE_LAYER_HEIGHT} from '../helpers/timeline-layout';
import {
	AudioWaveformBar,
	WAVEFORM_BAR_LENGTH,
	WAVEFORM_BAR_MARGIN,
} from './AudioWaveformBar';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	position: 'absolute',
	height: TIMELINE_LAYER_HEIGHT,
};

// TODO: Show metadata such as stereo, duration, bitrate
export const AudioWaveform: React.FC<{
	src: string;
	visualizationWidth: number;
	fps: number;
	startFrom: number;
	duration: number;
}> = ({src, fps, startFrom, duration, visualizationWidth}) => {
	const [metadata, setMetadata] = useState<AudioContextMetadata | null>(null);
	useEffect(() => {
		getAudioMetadata(src)
			.then((data) => {
				setMetadata(data);
			})
			.catch((err) => {
				console.error(`Could not load waveform for ${src}`, err);
			});
	}, [src]);

	const normalized = useMemo(() => {
		if (!metadata || metadata.numberOfChannels === 0) {
			return [];
		}
		const startSample = Math.floor(
			interpolate(
				startFrom,
				[0, metadata.duration * fps],
				[0, metadata.channelWaveforms[0].length]
			)
		);
		const endSample = Math.floor(
			interpolate(
				startFrom + duration,
				[0, metadata.duration * fps],
				[0, metadata.channelWaveforms[0].length]
			)
		);
		const numberOfSamples = Math.floor(
			visualizationWidth / (WAVEFORM_BAR_LENGTH + WAVEFORM_BAR_MARGIN)
		);
		return getWaveformSamples(
			metadata.channelWaveforms[0].slice(startSample, endSample),
			numberOfSamples
		).map((w, i) => {
			return {
				index: i,
				amplitude: w,
			};
		});
	}, [duration, fps, metadata, startFrom, visualizationWidth]);

	if (!metadata) {
		return null;
	}
	return (
		<div style={container}>
			{normalized.map((w) => {
				return <AudioWaveformBar key={w.index} amplitude={w.amplitude} />;
			})}
		</div>
	);
};
