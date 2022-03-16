import {Video} from 'remotion';
import {Audio, Sequence} from 'remotion';
import {AbsoluteFill, staticFile} from 'remotion';
import music from '../AudioTesting/music.mp3';

export const TwentyTwoKHzAudio = () => {
	const twenty = staticFile('22khz.wav');
	return (
		<AbsoluteFill>
			<Sequence from={1} durationInFrames={30}>
				<Audio src={music} />
			</Sequence>
			<Sequence from={31} durationInFrames={60}>
				<Audio src={twenty} />
				<Video src="./assets/CoffinDance.mp4" />
			</Sequence>
		</AbsoluteFill>
	);
};
