import {
	smoothenSvgPath,
	useAudioData,
	visualizeAudioWaveform,
} from '@remotion/media-utils';
import React from 'react';
import {AbsoluteFill, Audio, useCurrentFrame, useVideoConfig} from 'remotion';
import styled from 'styled-components';
import voice from '../resources/voice-short.mp3';

const FullSize = styled(AbsoluteFill)`
	display: flex;
	justify-content: center;
	align-items: center;
`;

const VoiceVisualization: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const audioDataVoice = useAudioData(voice);
	const {width, height} = useVideoConfig();

	if (!audioDataVoice) {
		return null;
	}

	const posterized = Math.round(frame / 3) * 3;

	const waveform = visualizeAudioWaveform({
		fps,
		frame: posterized,
		audioData: audioDataVoice,
		numberOfSamples: 16,
		windowInSeconds: 1 / fps,
		channel: 0,
	});

	const p = smoothenSvgPath(
		waveform.map((y, i) => {
			return [
				(i / (waveform.length - 1)) * width,
				height / 2 + (y * height) / 2,
			];
		})
	);

	return (
		<div style={{flex: 1}}>
			<Audio src={voice} />
			<FullSize>
				<svg
					style={{backgroundColor: 'white'}}
					viewBox={`0 0 ${width} ${height}`}
					width={width}
					height={height}
				>
					<path fill="none" stroke="#0b84f3" strokeWidth={10} d={p} />
				</svg>
			</FullSize>
		</div>
	);
};

export default VoiceVisualization;
