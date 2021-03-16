import React, {useEffect, useState} from 'react';

const filterData = (audioBuffer: AudioBuffer) => {
	const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
	const samples = 200; // Number of samples we want to have in our final data set
	const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
	const filteredData = [];
	for (let i = 0; i < samples; i++) {
		const blockStart = blockSize * i; // the location of the first sample in the block
		let sum = 0;
		for (let j = 0; j < blockSize; j++) {
			sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
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

	const [waveform, setWaveform] = useState<number[] | null>(null);
	useEffect(() => {
		const audioContext = new AudioContext();

		fetch(src)
			.then((response) => response.arrayBuffer())
			.then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
			.then((audioBuffer) => filterData(audioBuffer))
			.then((filtered) => normalizeData(filtered))
			.then((wave) => setWaveform(wave))
			.catch((err) => {
				// TODO: Error handling
				console.log(err);
			});
	}, [src]);
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
				height: 60,
			}}
		>
			{waveform.map((w, i) => {
				return (
					<div
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						style={{
							height: 40 * w,
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
