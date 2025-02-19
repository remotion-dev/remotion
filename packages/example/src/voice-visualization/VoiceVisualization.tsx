import {
	AudioData,
	createSmoothSvgPath,
	visualizeAudioWaveform,
} from '@remotion/media-utils';
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

export const VoiceVis: React.FC<{
	audioDataVoice: AudioData;
	padding: number;
	numberOfSamples: number;
	windowInSeconds: number;
	posterization: number;
	amplitude: number;
}> = ({
	audioDataVoice,
	padding,
	numberOfSamples,
	windowInSeconds,
	posterization,
	amplitude,
}) => {
	const {width, fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const height = 200;

	const posterized = Math.round(frame / posterization) * posterization;

	const waveform = visualizeAudioWaveform({
		fps,
		frame: posterized,
		audioData: audioDataVoice,
		numberOfSamples: numberOfSamples,
		windowInSeconds: windowInSeconds,
		channel: 0,
	});

	const p = createSmoothSvgPath({
		points: waveform.map((y, i) => {
			return {
				x: (i / (waveform.length - 1)) * width,
				y: height / 2 + ((y * height) / 2) * amplitude,
			};
		}),
	});

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			style={{
				overflow: 'visible',
			}}
			width={width - padding * 2}
			height={height}
		>
			<path
				strokeLinecap="round"
				fill="none"
				stroke="#222"
				strokeWidth={10}
				d={p}
			/>
		</svg>
	);
};
