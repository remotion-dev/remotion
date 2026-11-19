import {Audio, Video} from '@remotion/media';
import {useState} from 'react';
import {AbsoluteFill, Img, Loop, Sequence, staticFile} from 'remotion';
import {makeToneWav} from './pitch-shift-audio';

export const fractionalRgbSource = () => staticFile('fractional-rgb-loop.webm');

const LoopedVideo = () => (
	<Video
		src={fractionalRgbSource()}
		loop
		trimAfter={3}
		muted
		style={{width: 64, height: 64}}
	/>
);

const ShortVideo = () => (
	<Sequence durationInFrames={1.0001}>
		<Video src={fractionalRgbSource()} muted style={{width: 64, height: 64}} />
	</Sequence>
);

const NestedAudio = () => {
	const [src] = useState(makeToneWav);
	return (
		<Loop durationInFrames={1.2}>
			<Loop durationInFrames={0.4}>
				<Audio src={src} />
			</Loop>
		</Loop>
	);
};

const UnusedImage = () => {
	const [src] = useState(makeToneWav);
	return (
		<AbsoluteFill style={{backgroundColor: 'rgb(16, 40, 80)'}}>
			<Sequence from={0.25} durationInFrames={0.12}>
				<Audio src={src} />
				<Img src="/missing-fractional-boundary-image.png" maxRetries={0} />
			</Sequence>
		</AbsoluteFill>
	);
};

const LoopingSequenceAudio = () => {
	const [src] = useState(makeToneWav);
	return (
		<AbsoluteFill style={{backgroundColor: 'rgb(16, 40, 80)'}}>
			<Sequence from={0.25} durationInFrames={2.1}>
				<Sequence durationInFrames={0.7} loop>
					<Audio src={src} />
				</Sequence>
			</Sequence>
		</AbsoluteFill>
	);
};

const dimensions = {width: 64, height: 64, fps: 24, durationInFrames: 4};

export const fractionalLoopedVideo = {
	...dimensions,
	component: LoopedVideo,
	id: 'fractional-looped-video',
	fps: 30000 / 1001,
	durationInFrames: 12,
};

export const fractionalShortVideo = {
	...dimensions,
	component: ShortVideo,
	id: 'fractional-short-video',
	fps: 30,
	durationInFrames: 2,
};

export const fractionalNestedAudio = {
	...dimensions,
	component: NestedAudio,
	id: 'fractional-nested-audio',
};

export const fractionalUnusedImage = {
	...dimensions,
	component: UnusedImage,
	id: 'fractional-unused-image',
};

export const fractionalLoopingSequence = {
	...dimensions,
	component: LoopingSequenceAudio,
	id: 'fractional-looping-sequence',
};
