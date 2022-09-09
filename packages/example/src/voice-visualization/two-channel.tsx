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

const makeDuoform = (form: number[], width: number, height: number) => {
	const p2Path = form.map((y, i) => {
		return [
			(i / (form.length - 1)) * width,
			height / 2 + (Math.max(0.015, Math.abs(y)) * height) / 2,
		] as [number, number];
	});
	const p2PathReverse = form
		.map((y, i) => {
			return [
				(i / (form.length - 1)) * width,
				height / 2 - (Math.max(0.015, Math.abs(y)) * height) / 2,
			] as [number, number];
		})
		.reverse();

	const p2 = smoothenSvgPath(p2Path);
	const p2Reverse = smoothenSvgPath(p2PathReverse);

	const joined = [
		p2,
		`L ${p2PathReverse[0][0]} ${p2PathReverse[0][1]}`,
		p2Reverse,
		`L ${p2Path[0][0]} ${p2Path[0][1]}`,
	].join(' ');

	return joined;
};

export const TwoChannelVoiceVisualization: React.FC = () => {
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
		frame: posterized + 0.5 * fps,
		audioData: audioDataVoice,
		numberOfSamples: 16,
		windowInSeconds: 1,
		channel: 0,
	});
	const waveform2 = visualizeAudioWaveform({
		fps,
		frame: posterized,
		audioData: audioDataVoice,
		numberOfSamples: 16,
		windowInSeconds: 1,
		channel: 1,
	});

	const joined = makeDuoform(waveform, width, height);
	const joined2 = makeDuoform(waveform2, width, height);

	return (
		<div style={{flex: 1, backgroundColor: 'white'}}>
			<Audio src={voice} />
			<FullSize style={{opacity: 1}}>
				<svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
					<defs>
						<linearGradient id="myGradient2" gradientTransform="rotate(90)">
							<stop offset="0%" stopColor="#adffff" />
							<stop offset="100%" stopColor="rgb(173, 255, 255)" />
						</linearGradient>
					</defs>
					<path fill="url(#myGradient2)" fillRule="nonzero" d={joined} />
				</svg>
			</FullSize>
			<FullSize style={{opacity: 0.5, mixBlendMode: 'exclusion'}}>
				<svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
					<defs>
						<linearGradient id="myGradient" gradientTransform="rotate(90)">
							<stop offset="5%" stopColor="#ff0000" />
							<stop offset="95%" stopColor="#ff7d19" />
						</linearGradient>
					</defs>
					<path fill="url(#myGradient)" fillRule="nonzero" d={joined2} />
				</svg>
			</FullSize>{' '}
		</div>
	);
};
