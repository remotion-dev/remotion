import React, {useEffect, useMemo, useState} from 'react';
import {
	AudioContextMetadata,
	getAudioMetadata,
} from '../helpers/get-audio-metadata';
import {getAudioRangeFromStartFromAndDuration} from '../helpers/get-audio-range-from-start-from';
import {getWaveformPortion} from '../helpers/get-waveform-portion';
import {TIMELINE_LAYER_HEIGHT} from '../helpers/timeline-layout';
import {AudioWaveformBar} from './AudioWaveformBar';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	position: 'absolute',
	height: TIMELINE_LAYER_HEIGHT,
};

export const AudioWaveform: React.FC<{
	src: string;
	visualizationWidth: number;
	fps: number;
	startFrom: number;
	duration: number;
	setMaxMediaDuration: React.Dispatch<React.SetStateAction<number>>;
}> = ({
	src,
	fps,
	startFrom: baseStartFrom,
	duration: baseDuration,
	visualizationWidth,
	setMaxMediaDuration,
}) => {
	const [metadata, setMetadata] = useState<AudioContextMetadata | null>(null);

	const {startFrom, durationInFrames} = getAudioRangeFromStartFromAndDuration({
		startFrom: baseStartFrom,
		durationInFrames: baseDuration,
	});

	useEffect(() => {
		getAudioMetadata(src)
			.then((data) => {
				setMaxMediaDuration(Math.floor(data.duration * fps));
				setMetadata(data);
			})
			.catch((err) => {
				console.error(`Could not load waveform for ${src}`, err);
			});
	}, [fps, setMaxMediaDuration, src]);

	const normalized = useMemo(() => {
		if (!metadata || metadata.numberOfChannels === 0) {
			return [];
		}

		return getWaveformPortion({
			metadata,
			startFrom,
			fps,
			durationInFrames,
			visualizationWidth,
		});
	}, [durationInFrames, fps, metadata, startFrom, visualizationWidth]);

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
