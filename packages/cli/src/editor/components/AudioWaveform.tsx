import React, {useEffect, useMemo, useState} from 'react';
import {getWaveform} from '../helpers/get-waveform';
import {TIMELINE_LAYER_HEIGHT} from '../helpers/timeline-layout';

const filterData = (audioBuffer: Float32Array) => {
	const samples = 200; // Number of samples we want to have in our final data set
	const blockSize = Math.floor(audioBuffer.length / samples); // the number of samples in each subdivision
	const filteredData = [];
	for (let i = 0; i < samples; i++) {
		const blockStart = blockSize * i; // the location of the first sample in the block
		let sum = 0;
		for (let j = 0; j < blockSize; j++) {
			sum = sum + Math.abs(audioBuffer[blockStart + j]); // find the sum of all the samples in the block
		}
		filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
	}
	return filteredData;
};

const normalizeData = (filteredData: number[]) => {
	const multiplier = Math.pow(Math.max(...filteredData), -1);
	return filteredData.map((n) => n * multiplier);
};

// TODO: Show metadata such as stereo, duration, bitrate
export const AudioWaveform: React.FC<{
	src: string;
}> = ({src}) => {
	// TODO: Resize to timeline length so it aligns with cursor

	const [waveform, setWaveform] = useState<Float32Array | null>(null);
	useEffect(() => {
		getWaveform(src)
			.then((wave) => setWaveform(wave))
			.catch((err) => {
				// TODO: Error handling
				console.log(err);
			});
	}, [src]);

	const normalized = useMemo(() => {
		if (!waveform) {
			return [];
		}
		return normalizeData(filterData(waveform));
	}, [waveform]);

	if (!waveform) {
		return null;
	}
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				position: 'absolute',
				height: TIMELINE_LAYER_HEIGHT,
			}}
		>
			{normalized.map((w, i) => {
				return (
					<div
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						style={{
							height: (TIMELINE_LAYER_HEIGHT / 2) * w,
							width: 4,
							backgroundColor: 'rgba(255, 255, 255, 0.2)',
							marginLeft: 2,
							borderRadius: 2,
						}}
					/>
				);
			})}
		</div>
	);
};
