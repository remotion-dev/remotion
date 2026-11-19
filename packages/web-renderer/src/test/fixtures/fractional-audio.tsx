import {Audio} from '@remotion/media';
import {useState} from 'react';
import {AbsoluteFill, Loop, Sequence, useCurrentFrame} from 'remotion';
import {makeToneWav} from './pitch-shift-audio';

const LoopFrame: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				width: 16,
				height: 16,
				backgroundColor: frame < 0.05 ? 'rgb(16, 224, 32)' : 'rgb(224, 32, 96)',
			}}
		/>
	);
};

const Component: React.FC = () => {
	const [src] = useState(makeToneWav);
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: `rgb(${32 + frame * 24}, 64, 128)`}}>
			<Sequence from={0.25} durationInFrames={0.12}>
				<Audio src={src} />
			</Sequence>
			<Sequence from={1.125} durationInFrames={0.413008}>
				<Audio src={src} />
			</Sequence>
			<Sequence from={1.538008} durationInFrames={0.277}>
				<Audio src={src} trimBefore={1} />
			</Sequence>
			<Sequence from={2.1} durationInFrames={1.5}>
				<Loop durationInFrames={0.4}>
					<Audio src={src} />
					<LoopFrame />
				</Loop>
			</Sequence>
		</AbsoluteFill>
	);
};

export const fractionalAudio = {
	component: Component,
	id: 'fractional-audio',
	width: 64,
	height: 64,
	fps: 24,
	durationInFrames: 4,
} as const;
