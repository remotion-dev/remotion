import {Audio, Video} from '@remotion/media';
import {Interactive, interpolate, Track, useCurrentFrame} from 'remotion';
import {ORIGINAL_SHOW_AUDIO_URL, RERECORDING_VIDEO_URL} from './assets';

const DiscoLightShowRerecordingInner: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<>
			<Video
				name="Re-recording — camera audio muted"
				src={RERECORDING_VIDEO_URL}
				muted
				durationInFrames={139128}
				style={{width: '100%', height: '100%'}}
			/>
			<Track name="Original show audio">
				<Audio
					name="Rehearsal start 1"
					src={ORIGINAL_SHOW_AUDIO_URL}
					from={399}
					trimBefore={4438}
					durationInFrames={1257}
					volume={interpolate(frame, [399, 400, 1653, 1655], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
				/>
				<Audio
					name="Rehearsal start 2"
					src={ORIGINAL_SHOW_AUDIO_URL}
					from={2195}
					trimBefore={4405}
					durationInFrames={2385}
					volume={interpolate(frame, [2195, 2196, 4577, 4579], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
				/>
				<Audio
					name="Continuous show take"
					src={ORIGINAL_SHOW_AUDIO_URL}
					from={4789}
					trimBefore={4405}
					durationInFrames={133887}
				/>
			</Track>
		</>
	);
};

export const DiscoLightShowRerecording = Interactive.create({
	Component: DiscoLightShowRerecordingInner,
	layout: 'absolute-fill',
});
