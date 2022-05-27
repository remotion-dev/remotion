import {
	createSmoothSvgPath,
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

const Orb = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	flex: 1;
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
		numberOfSamples: 64,
		windowInSeconds: 0.5,
	});

	const p = createSmoothSvgPath(
		waveform.map((y, i) => {
			return [
				(i / (waveform.length - 1)) * width,
				height / 2 + ((y * height) / 2) * 5,
			];
		})
	);

	return (
		<div style={{flex: 1}}>
			<Audio src={voice} />
			<FullSize>
				<Orb>
					<svg
						style={{backgroundColor: 'white'}}
						viewBox={`0 0 ${width} ${height}`}
						width={width}
						height={height}
					>
						<path fill="none" stroke="#0b84f3" strokeWidth={10} d={p} />
					</svg>
				</Orb>
			</FullSize>
		</div>
	);
};

export default VoiceVisualization;
