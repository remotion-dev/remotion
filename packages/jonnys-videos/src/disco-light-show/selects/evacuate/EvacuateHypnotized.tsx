import {Audio, Video} from '@remotion/media';
import {Interactive} from 'remotion';
import {
	ORIGINAL_SHOW_AUDIO_URL,
	RERECORDING_VIDEO_URL,
} from '../../recordings/assets';

const EvacuateHypnotizedInner: React.FC = () => {
	return (
		<>
			<Video
				name="Evacuate hypnotized verse"
				src={RERECORDING_VIDEO_URL}
				trimBefore={58050}
				durationInFrames={345}
				muted
				style={{width: '100%', height: '100%'}}
			/>
			<Audio
				name="Clean show audio"
				src={ORIGINAL_SHOW_AUDIO_URL}
				trimBefore={57666}
				durationInFrames={345}
			/>
		</>
	);
};

export const EvacuateHypnotized = Interactive.create({
	Component: EvacuateHypnotizedInner,
	layout: 'absolute-fill',
});
