import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {assetUrl} from './assets';

const PAN_START = 227;

export const WebRendererDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Initial zoom from 1 to 1.5 with smooth spring
	const zoomProgress = spring({
		frame,
		fps,
		config: {damping: 200},
		durationInFrames: 30,
	});
	const baseScale = interpolate(zoomProgress, [0, 1], [1, 1.5]);

	// After PAN_START, pan from center to top-right
	const panProgress = spring({
		frame: frame - PAN_START,
		fps,
		config: {damping: 200},
		durationInFrames: 30,
	});

	// Transform origin goes from center to top-right
	const originX = interpolate(panProgress, [0, 1], [50, 100]);
	const originY = interpolate(panProgress, [0, 1], [50, 0]);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				justifyContent: 'center',
				alignItems: 'center',
				overflow: 'hidden',
			}}
		>
			<Video
				src={assetUrl('web-renderer-demo.mp4')}
				muted
				trimBefore={Math.floor(4 * fps)}
				playbackRate={2}
				style={{
					height: '100%',
					objectFit: 'contain',
					transformOrigin: `${originX}% ${originY}%`,
					transform: `scale(${baseScale})`,
				}}
			/>
		</AbsoluteFill>
	);
};
