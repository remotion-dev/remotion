import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {
	HtmlInCanvas,
	CanvasImage,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

const CubeWaveCodeBrollContent = () => {
	const frame = useCurrentFrame();
	const blurPosition = interpolate(frame, [0, 241], [0, 0.65], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<HtmlInCanvas
			name="Tilted CubeWave code with downward-moving progressive blur"
			width={1920}
			height={1080}
			style={{backgroundColor: '#131414'}}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.05 + blurPosition],
					end: [0.5, 0.65 + blurPosition],
					endBlur: 18,
				}),
			]}
		>
			<CanvasImage
				name="CubeWave.tsx — actual Monaco screenshot, Dark+"
				src="https://remotion.media/agentically-programmatically/cube-wave-monaco-c8499a30a565.png"
				width={1440}
				height={1700}
				style={{
					position: 'absolute',
					left: 64,
					top: '50%',
					width: 1440,
					height: 1700,
					maxWidth: 'none',
					translate: interpolate(
						frame,
						[0, 241],
						['0px -750px', '-24px -785px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					transformOrigin: '0px 750px',
					rotate: EXPLORE_CAMERA_ANGLE,
					scale: interpolate(frame, [0, 241], [1.4, 1.46], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			/>
		</HtmlInCanvas>
	);
};

export const CubeWaveCodeBroll = Interactive.create({
	Component: CubeWaveCodeBrollContent,
	layout: 'absolute-fill',
	schema: {},
});
