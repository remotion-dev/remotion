import {
	AudioData,
	useAudioData,
	visualizeAudioWaveform,
} from '@remotion/media-utils';
import React, {useEffect, useRef} from 'react';
import {AbsoluteFill, Audio, useCurrentFrame, useVideoConfig} from 'remotion';
import styled from 'styled-components';
import music from '../resources/sound1.mp3';
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

const WAVEFORM_SAMPLES = 16;

const Canvas: React.FC<{waveform: number[]; audioData: AudioData}> = ({
	waveform,
	audioData,
}) => {
	const {width, height} = useVideoConfig();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const canvas = canvasRef.current;
	const canvasCtx = canvas?.getContext('2d');
	useEffect(() => {
		if (canvasCtx) {
			canvasCtx.fillStyle = 'rgb(200, 200, 200)';
			canvasCtx.fillRect(0, 0, width, height);
			canvasCtx.lineWidth = 4;
			canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
			canvasCtx.beginPath();
			const sliceWidth = width / (WAVEFORM_SAMPLES - 1);
			let x = 0;
			for (let i = 0; i < waveform.length; i++) {
				const v = waveform[i] / 128.0;
				const y = v * audioData.sampleRate + height / 2;

				if (i === 0) {
					canvasCtx.moveTo(x, y);
				} else {
					canvasCtx.lineTo(x, y);
				}

				x += sliceWidth;
			}
			canvasCtx.stroke();
		}
	}, [audioData.sampleRate, canvasCtx, height, waveform, width]);
	return <canvas ref={canvasRef} width={width} height={height} />;
};

const VoiceVisualization: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const audioData = useAudioData(music);
	const audioDataVoice = useAudioData(voice);
	if (!audioData || !audioDataVoice) {
		return null;
	}

	const waveform = visualizeAudioWaveform({
		fps,
		frame,
		audioData: audioDataVoice,
		numberOfSamples: WAVEFORM_SAMPLES,
		waveformDuration: 1 / fps,
	});

	return (
		<div style={{flex: 1}}>
			<Audio src={voice} />
			<FullSize>
				<Orb>
					<Canvas audioData={audioData} waveform={waveform} />
				</Orb>
			</FullSize>
		</div>
	);
};

export default VoiceVisualization;
