import React, {useEffect, useMemo, useState} from 'react';
import {getWaveform} from '../helpers/get-waveform';
import {getWaveformSamples} from '../helpers/reduce-waveform';
import {TIMELINE_LAYER_HEIGHT} from '../helpers/timeline-layout';
import {AudioWaveformBar} from './AudioWaveformBar';

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
}> = ({src, fps, startFrom, duration}) => {
	// TODO: Resize to timeline length so it aligns with cursor

	const [waveform, setWaveform] = useState<Float32Array | null>(null);
	useEffect(() => {
		getWaveform(src)
			.then((wave) => setWaveform(wave))
			.catch((err) => {
				console.error(`Could not load waveform for ${src}`, err);
			});
	}, [src]);

	const normalized = useMemo(() => {
		if (!waveform) {
			return [];
		}
		return getWaveformSamples(waveform, 200).map((w, i) => {
			return {
				index: i,
				amplitude: w,
			};
		});
	}, [waveform]);

	if (!waveform) {
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
