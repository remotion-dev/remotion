import {Audio, Video} from '@remotion/media';
import {Interactive} from 'remotion';
import {
	ORIGINAL_SHOW_AUDIO_URL,
	RERECORDING_VIDEO_URL,
} from '../../recordings/assets';

const SuperfreakOpeningInner: React.FC = () => {
	return (
		<>
			<Video
				name="Superfreak opening groove"
				src={RERECORDING_VIDEO_URL}
				trimBefore={68504}
				durationInFrames={510}
				muted
				style={{width: '100%', height: '100%'}}
			/>
			<Audio
				name="Superfreak clean audio"
				src={ORIGINAL_SHOW_AUDIO_URL}
				trimBefore={68120}
				durationInFrames={510}
			/>
		</>
	);
};

export const SuperfreakOpening = Interactive.create({
	Component: SuperfreakOpeningInner,
	layout: 'absolute-fill',
});
