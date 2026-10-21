import {Audio, Video} from '@remotion/media';
import {Interactive} from 'remotion';
import {
	ORIGINAL_SHOW_AUDIO_URL,
	RERECORDING_VIDEO_URL,
} from '../../recordings/assets';

const SuperfreakRiffInner: React.FC = () => {
	return (
		<>
			<Video
				name="Superfreak instrumental break"
				src={RERECORDING_VIDEO_URL}
				trimBefore={71558}
				durationInFrames={480}
				muted
				style={{width: '100%', height: '100%'}}
			/>
			<Audio
				name="Superfreak clean audio"
				src={ORIGINAL_SHOW_AUDIO_URL}
				trimBefore={71174}
				durationInFrames={480}
			/>
		</>
	);
};

export const SuperfreakRiff = Interactive.create({
	Component: SuperfreakRiffInner,
	layout: 'absolute-fill',
});
