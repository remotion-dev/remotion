import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Interactive,
	type InteractiveTransformProps,
	useVideoConfig,
} from 'remotion';

const HerdrGroundControlContent = ({style}: InteractiveTransformProps) => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: '#000000', ...style}}>
			<Video
				name="Send the agent off — automatic return to the airport"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/scenes/herdr-terminal-send.mp4'
				}
				trimBefore={0.6 * fps}
				durationInFrames={10.5 * fps}
				playbackRate={1.25}
				muted
				objectFit="cover"
				premountFor={fps}
				style={{width: '100%', height: '100%'}}
			/>
		</AbsoluteFill>
	);
};

export const HerdrGroundControl = Interactive.create({
	Component: HerdrGroundControlContent,
	componentName: 'HerdrGroundControl',
});
