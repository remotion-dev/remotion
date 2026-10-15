import {Audio} from '@remotion/media';
import {Track} from 'remotion';

export const TrackAudioIntrinsicDurationE2e = () => {
	const secondFrom = 30;
	return (
		<>
			<div>Audio metadata fixture</div>
			<Track name="Sound effects">
				<Audio
					name="First sound"
					src="https://example.com/track-duration.wav"
				/>
				<Audio
					name="Second sound"
					src="https://example.com/track-duration.wav"
					from={secondFrom}
				/>
			</Track>
		</>
	);
};
