import {
	smoothenSvgPath,
	useAudioData,
	visualizeAudioWaveform,
} from '@remotion/media-utils';
import React from 'react';
import {Audio, useCurrentFrame, useVideoConfig} from 'remotion';
import voice from '../resources/voice-short.mp3';

const padding = 80;

export const VoiceVisualization: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const audioDataVoice = useAudioData(voice);
	const {width} = useVideoConfig();

	const height = 600;

	if (!audioDataVoice) {
		return null;
	}

	const posterized = Math.round(frame / 1) * 1;

	const waveform = visualizeAudioWaveform({
		fps,
		frame: posterized,
		audioData: audioDataVoice,
		numberOfSamples: 40,
		windowInSeconds: 1,
		channel: 0,
	});

	const p = smoothenSvgPath({
		points: waveform.map((y, i) => {
			return {
				x: (i / (waveform.length - 1)) * width,
				y: height / 2 + (y * height) / 2,
			};
		}),
	});

	return (
		<div style={{flex: 1, padding}} className="flex-1 bg-white">
			<Audio src={voice} />
			<div className="flex justify-center items-center">
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
			</div>
		</div>
	);
};
