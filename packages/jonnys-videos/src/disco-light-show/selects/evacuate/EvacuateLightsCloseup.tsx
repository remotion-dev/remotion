import {Audio, Video} from '@remotion/media';
import {Interactive} from 'remotion';
import {
	ORIGINAL_SHOW_AUDIO_URL,
	RERECORDING_VIDEO_URL,
} from '../../recordings/assets';

const EvacuateLightsCloseupInner: React.FC = () => {
	return (
		<>
			<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
				<Video
					name="Evacuate lighting detail"
					src={RERECORDING_VIDEO_URL}
					trimBefore={58860}
					durationInFrames={300}
					muted
					style={{
						position: 'absolute',
						left: -200,
						top: -500,
						width: 1920,
						height: 1080,
						maxWidth: 'none',
					}}
				/>
			</div>
			<Audio
				name="Clean show audio"
				src={ORIGINAL_SHOW_AUDIO_URL}
				trimBefore={58476}
				durationInFrames={300}
			/>
		</>
	);
};

export const EvacuateLightsCloseup = Interactive.create({
	Component: EvacuateLightsCloseupInner,
	layout: 'absolute-fill',
});
