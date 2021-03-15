import React from 'react';
import {
	Audio,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	Video,
} from 'remotion';
// FIXME: commit sample movie + music
import movie from '../resources/framer-music.mp4';
import music from '../resources/sound1.mp3';

const AudioTestingMute: React.FC = () => {
	const sequenceFrame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();

	/**
	 * Interleave music with the movie by muting each other
	 * at certain points.
	 */
	const getMuteState = React.useCallback(
		(type: 'movie' | 'music') => {
			const muteParts = [
				{start: 1 * fps, end: 2 * fps},
				{start: 4 * fps, end: 5 * fps},
			];
			const toMute = muteParts.some(
				(mp) => sequenceFrame >= mp.start && sequenceFrame <= mp.end
			);
			return type == 'movie' ? toMute : !toMute;
		},
		[fps, sequenceFrame]
	);

	return (
		<Sequence from={0} durationInFrames={durationInFrames}>
			<Video src={movie} muted={getMuteState('movie')} />
			<Audio src={music} muted={getMuteState('music')} />
		</Sequence>
	);
};

export default AudioTestingMute;
