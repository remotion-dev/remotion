import {
	createSmoothSvgPath,
	useAudioData,
	visualizeAudioWaveform,
} from '@remotion/media-utils';
import {Player} from '@remotion/player';
import React from 'react';
import {
	AbsoluteFill,
	Audio,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const src = staticFile('podcast.wav');

const BaseExample: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const audioDataVoice = useAudioData(src);
	const {width} = useVideoConfig();
	const height = 300;

	if (!audioDataVoice) {
		return null;
	}

	const waveform = visualizeAudioWaveform({
		fps,
		frame,
		audioData: audioDataVoice,
		numberOfSamples: 32,
		windowInSeconds: 1 / fps,
		channel: 0,
	});

	const p = createSmoothSvgPath({
		points: waveform.map((x, i) => {
			return {
				x: (i / (waveform.length - 1)) * width,
				y: x * height * 2 + height / 2,
			};
		}),
	});

	return (
		<div style={{flex: 1}}>
			<Audio src={src} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<svg
					style={{backgroundColor: '#0B84F3'}}
					viewBox={`0 0 ${width} ${height}`}
					width={width}
					height={height}
				>
					<path stroke="white" fill="none" strokeWidth={10} d={p as string} />
				</svg>
			</AbsoluteFill>
		</div>
	);
};

const MovingExample: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const audioDataVoice = useAudioData(src);
	const {width} = useVideoConfig();
	const height = 300;

	if (!audioDataVoice) {
		return null;
	}

	const waveform = visualizeAudioWaveform({
		fps,
		frame,
		audioData: audioDataVoice,
		numberOfSamples: 32,
		windowInSeconds: 10 / fps,
		channel: 0,
	});

	const p = createSmoothSvgPath({
		points: waveform.map((x, i) => {
			return {
				x: (i / (waveform.length - 1)) * width,
				y: x * height * 2 + height / 2,
			};
		}),
	});

	return (
		<div style={{flex: 1}}>
			<Audio src={src} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<svg
					style={{backgroundColor: '#0B84F3'}}
					viewBox={`0 0 ${width} ${height}`}
					width={width}
					height={height}
				>
					<path stroke="#ffffff" fill="none" strokeWidth={10} d={p as string} />
				</svg>
			</AbsoluteFill>
		</div>
	);
};

const PosterizedExample: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const audioDataVoice = useAudioData(src);
	const {width} = useVideoConfig();
	const height = 300;

	if (!audioDataVoice) {
		return null;
	}

	const waveform = visualizeAudioWaveform({
		fps,
		frame: Math.round(frame / 3) * 3,
		audioData: audioDataVoice,
		numberOfSamples: 16,
		windowInSeconds: 1 / fps,
		channel: 0,
	});

	const p = createSmoothSvgPath({
		points: waveform.map((x, i) => {
			return {
				x: (i / (waveform.length - 1)) * width,
				y: x * height * 2 + height / 2,
			};
		}),
	});

	return (
		<div style={{flex: 1}}>
			<Audio src={src} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<svg
					style={{backgroundColor: ' #0B84F3'}}
					viewBox={`0 0 ${width} ${height}`}
					width={width}
					height={height}
				>
					<path stroke="white" fill="none" strokeWidth={10} d={p as string} />
				</svg>
			</AbsoluteFill>
		</div>
	);
};

export const AudioWaveFormExample: React.FC<{
	readonly type: 'base' | 'moving' | 'posterized';
}> = ({type}) => {
	const component = (() => {
		if (type === 'base') {
			return BaseExample;
		}

		if (type === 'moving') {
			return MovingExample;
		}

		if (type === 'posterized') {
			return PosterizedExample;
		}

		throw new TypeError('oops');
	})();
	return (
		<div>
			<Player
				component={component}
				compositionWidth={1080}
				compositionHeight={300}
				controls
				durationInFrames={300}
				fps={30}
				style={{
					width: '100%',
				}}
				loop
			/>
		</div>
	);
};
