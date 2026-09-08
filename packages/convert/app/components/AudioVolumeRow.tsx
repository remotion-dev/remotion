import {
	formatAverageAudioVolume,
	subscribeToWaveformPeaks,
} from '@remotion/timeline-utils';
import type {InputAudioTrack} from 'mediabunny';
import {useEffect, useState} from 'react';
import {TableCell, TableRow} from './ui/table';

export const AudioVolumeRow: React.FC<{readonly track: InputAudioTrack}> = ({
	track,
}) => {
	const [value, setValue] = useState<string | null>(null);
	useEffect(() => {
		setValue('Calculating…');
		return subscribeToWaveformPeaks({
			src: track,
			onPeaks: (_peaks, final, averageVolume) => {
				if (final) {
					setValue(formatAverageAudioVolume(averageVolume));
				}
			},
			onError: () => setValue('Unavailable'),
		});
	}, [track]);

	return (
		<TableRow>
			<TableCell
				className="font-brand"
				title="RMS level across all channels over the full audio track, including silence."
			>
				Average volume
			</TableCell>
			<TableCell className="text-right">{value ?? 'Calculating…'}</TableCell>
		</TableRow>
	);
};
