import {Audio, Video} from '@remotion/media';
import {Interactive} from 'remotion';
import {
	ORIGINAL_SHOW_AUDIO_URL,
	RERECORDING_VIDEO_URL,
} from '../../recordings/assets';

const EvacuateDropInner: React.FC = () => {
	return (
		<>
			<Video
				name="Evacuate build and drop"
				src={RERECORDING_VIDEO_URL}
				trimBefore={56820}
				durationInFrames={480}
				muted
				style={{width: '100%', height: '100%'}}
			/>
			<Audio
				name="Clean show audio"
				src={ORIGINAL_SHOW_AUDIO_URL}
				trimBefore={56436}
				durationInFrames={480}
			/>
		</>
	);
};

export const EvacuateDrop = Interactive.create({
	Component: EvacuateDropInner,
	layout: 'absolute-fill',
});
