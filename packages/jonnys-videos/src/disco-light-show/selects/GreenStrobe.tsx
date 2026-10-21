import {Video} from '@remotion/media';
import {Interactive, useVideoConfig} from 'remotion';

const GreenStrobeInner: React.FC = () => {
	const {fps} = useVideoConfig();

	return (
		<Video
			name="Green to white strobe"
			src="https://remotion.media/jonnys-videos/disco-light-show/selects/green-strobe-a4a0a9ab771c.mp4"
			durationInFrames={6 * fps}
			style={{
				width: '100%',
				height: '100%',
			}}
		/>
	);
};

export const GreenStrobe = Interactive.create({
	Component: GreenStrobeInner,
	layout: 'absolute-fill',
});
