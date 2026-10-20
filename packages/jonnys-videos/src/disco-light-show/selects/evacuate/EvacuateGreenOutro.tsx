import {Audio, Video} from '@remotion/media';
import {Interactive} from 'remotion';
import {
	ORIGINAL_SHOW_AUDIO_URL,
	RERECORDING_VIDEO_URL,
} from '../../recordings/assets';

const EvacuateGreenOutroInner: React.FC = () => {
	return (
		<>
			<Video
				name="Evacuate green instrumental outro"
				src={RERECORDING_VIDEO_URL}
				trimBefore={61500}
				durationInFrames={480}
				muted
				style={{width: '100%', height: '100%'}}
			/>
			<Audio
				name="Clean show audio"
				src={ORIGINAL_SHOW_AUDIO_URL}
				trimBefore={61116}
				durationInFrames={480}
			/>
		</>
	);
};

export const EvacuateGreenOutro = Interactive.create({
	Component: EvacuateGreenOutroInner,
	layout: 'absolute-fill',
});
