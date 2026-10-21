import {Audio, Video} from '@remotion/media';
import {Interactive} from 'remotion';
import {
	ORIGINAL_SHOW_AUDIO_URL,
	RERECORDING_VIDEO_URL,
} from '../../recordings/assets';

const EvacuateOpeningHookInner: React.FC = () => {
	return (
		<>
			<Video
				name="Evacuate opening hook"
				src={RERECORDING_VIDEO_URL}
				trimBefore={55440}
				durationInFrames={480}
				muted
				style={{width: '100%', height: '100%'}}
			/>
			<Audio
				name="Clean show audio"
				src={ORIGINAL_SHOW_AUDIO_URL}
				trimBefore={55056}
				durationInFrames={480}
			/>
		</>
	);
};

export const EvacuateOpeningHook = Interactive.create({
	Component: EvacuateOpeningHookInner,
	layout: 'absolute-fill',
});
