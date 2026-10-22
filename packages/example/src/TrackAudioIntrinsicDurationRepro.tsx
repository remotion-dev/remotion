import {Audio} from '@remotion/media';
import {Track} from 'remotion';

// At 30 fps, this 0.154-second sound finishes within 5 frames. The second
// sound starts at frame 30, so both clips fit on one Track without explicit
// durations. Studio must wait for metadata and validate their intrinsic lengths.
export const TrackAudioIntrinsicDurationRepro = () => (
	<Track name="Non-overlapping audio">
		<Audio name="First whoosh" src="https://remotion.media/whoosh.wav" />
		<Audio
			name="Second whoosh"
			src="https://remotion.media/whoosh.wav"
			from={30}
		/>
	</Track>
);
