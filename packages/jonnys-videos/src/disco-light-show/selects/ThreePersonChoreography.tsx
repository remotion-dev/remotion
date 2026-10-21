import {Video} from '@remotion/media';
import {Interactive, useVideoConfig} from 'remotion';

const ThreePersonChoreographyInner: React.FC = () => {
	const {fps} = useVideoConfig();

	return (
		<Video
			name="Three-person choreography"
			src="https://remotion.media/jonnys-videos/disco-light-show/selects/three-person-choreography-5s-568702c0016b.mp4"
			durationInFrames={5 * fps}
			style={{
				width: '100%',
				height: '100%',
			}}
		/>
	);
};

export const ThreePersonChoreography = Interactive.create({
	Component: ThreePersonChoreographyInner,
	layout: 'absolute-fill',
});
