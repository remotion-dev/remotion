import {Audio, Video} from '@remotion/media';
import {Interactive} from 'remotion';
import {
	ORIGINAL_SHOW_AUDIO_URL,
	RERECORDING_VIDEO_URL,
} from '../../recordings/assets';

const SuperfreakChorusInner: React.FC = () => {
	return (
		<>
			<Video
				name="Superfreak first chorus"
				src={RERECORDING_VIDEO_URL}
				trimBefore={70019}
				durationInFrames={390}
				muted
				style={{width: '100%', height: '100%'}}
			/>
			<Audio
				name="Superfreak clean audio"
				src={ORIGINAL_SHOW_AUDIO_URL}
				trimBefore={69635}
				durationInFrames={390}
			/>
		</>
	);
};

export const SuperfreakChorus = Interactive.create({
	Component: SuperfreakChorusInner,
	layout: 'absolute-fill',
});
