import {Audio, Video} from '@remotion/media';
import {Interactive} from 'remotion';
import {
	ORIGINAL_SHOW_AUDIO_URL,
	RERECORDING_VIDEO_URL,
} from '../../recordings/assets';

const SuperfreakOrangeBreakInner: React.FC = () => {
	return (
		<>
			<Video
				name="Superfreak orange break"
				src={RERECORDING_VIDEO_URL}
				trimBefore={69374}
				durationInFrames={300}
				muted
				style={{width: '100%', height: '100%'}}
			/>
			<Audio
				name="Superfreak clean audio"
				src={ORIGINAL_SHOW_AUDIO_URL}
				trimBefore={68990}
				durationInFrames={300}
			/>
		</>
	);
};

export const SuperfreakOrangeBreak = Interactive.create({
	Component: SuperfreakOrangeBreakInner,
	layout: 'absolute-fill',
});
