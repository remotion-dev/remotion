import {
	formatAverageAudioVolume,
	subscribeToWaveformPeaks,
} from '@remotion/timeline-utils';
import React, {useEffect, useState} from 'react';
import {LIGHT_TEXT} from '../helpers/colors';

export const AssetAudioVolume: React.FC<{
	readonly src: string | null;
	readonly waveformSampleRate: number | null;
}> = ({src, waveformSampleRate}) => {
	const [value, setValue] = useState('Calculating…');
	useEffect(() => {
		setValue('Calculating…');
		if (src === null || waveformSampleRate === null) {
			return;
		}

		return subscribeToWaveformPeaks({
			src,
			waveformSampleRate,
			onPeaks: (_peaks, final, averageVolume) => {
				if (final) {
					setValue(formatAverageAudioVolume(averageVolume));
				}
			},
			onError: () => setValue('Unavailable'),
		});
	}, [src, waveformSampleRate]);

	return (
		<span
			role="group"
			style={{
				fontFamily: 'sans-serif',
				fontSize: 13,
				lineHeight: '20px',
				color: LIGHT_TEXT,
			}}
			aria-label="RMS level across all channels over the full audio track, including silence."
		>
			{value}
		</span>
	);
};
