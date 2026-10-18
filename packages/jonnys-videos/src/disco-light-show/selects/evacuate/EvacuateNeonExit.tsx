import {Audio, Video} from '@remotion/media';
import {Interactive} from 'remotion';
import {
	ORIGINAL_SHOW_AUDIO_URL,
	RERECORDING_VIDEO_URL,
} from '../../recordings/assets';

const EvacuateNeonExitInner: React.FC = () => {
	return (
		<>
			<Video
				name="Evacuate neon exit"
				src={RERECORDING_VIDEO_URL}
				trimBefore={60870}
				durationInFrames={360}
				muted
				style={{width: '100%', height: '100%'}}
			/>
			<Audio
				name="Clean show audio"
				src={ORIGINAL_SHOW_AUDIO_URL}
				trimBefore={60486}
				durationInFrames={360}
			/>
		</>
	);
};

export const EvacuateNeonExit = Interactive.create({
	Component: EvacuateNeonExitInner,
	layout: 'absolute-fill',
});
