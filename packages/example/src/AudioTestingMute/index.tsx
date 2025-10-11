import React from 'react';
import {
	Html5Audio,
	Html5Video,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import movie from '../resources/framer-music.mp4';
import music from '../resources/sound1.mp3';

const AudioTestingMute: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	/**
	 * Interleave music with the movie by muting each other
	 * at certain points.
	 */
	const getMuteState = React.useCallback(
		(type: 'movie' | 'music') => {
			const muteParts = [
				{start: Number(fps), end: 2 * fps},
				{start: 4 * fps, end: 5 * fps},
			];
			const toMute = muteParts.some(
				(mp) => frame >= mp.start && frame <= mp.end,
			);
			return type === 'movie' ? toMute : !toMute;
		},
		[fps, frame],
	);

	return (
		<div>
			<Html5Video src={movie} muted={getMuteState('movie')} />
			<Sequence from={20} durationInFrames={200}>
				<Sequence from={20} durationInFrames={200}>
					<Sequence from={20} durationInFrames={200}>
						<Sequence from={20} durationInFrames={200}>
							<Sequence from={20} durationInFrames={200}>
								<Html5Audio src={music} muted={getMuteState('music')} />
								<Html5Audio src={music} muted={getMuteState('music')} />
								<Html5Audio src={music} muted={getMuteState('music')} />
							</Sequence>
						</Sequence>
					</Sequence>
				</Sequence>
			</Sequence>
		</div>
	);
};

export default AudioTestingMute;
