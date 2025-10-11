import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';

export const TwentyTwoKHzAudio = () => {
	const twenty = staticFile('22khz.wav');
	return (
		<AbsoluteFill>
			<Sequence from={1} durationInFrames={30}>
				<Html5Audio src={staticFile('music.mp3')} />
			</Sequence>
			<Sequence from={31} durationInFrames={100}>
				<Html5Audio src={twenty} />
			</Sequence>
		</AbsoluteFill>
	);
};
