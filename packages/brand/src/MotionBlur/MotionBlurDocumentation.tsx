import {
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

const MotionBlurDocumentationContent = () => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				backgroundColor: '#F8FAFC',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: 1080,
					height: 960,
					translate: '-50% -50%',
					scale: Math.min(width / 1080, height / 960),
					transformOrigin: '50% 50%',
					perspective: 1800,
					perspectiveOrigin: '50% 50%',
				}}
			>
				<Interactive.Div
					name="Tilted motion blur documentation"
					style={{
						position: 'absolute',
						inset: 0,
						backgroundColor: '#FFFFFF',
						borderRadius: 16,
						boxShadow: '0 36px 110px rgba(0, 0, 0, 0.22)',
						overflow: 'hidden',
						rotate: EXPLORE_CAMERA_ANGLE,
						scale: interpolate(
							frame,
							[0, 0.5 * fps, 2.2 * fps, 4.8 * fps],
							[1.08, 1.1, 1.28, 1.6],
							{
								easing: Easing.bezier(0.42, 0, 0.58, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						transformOrigin: '50% 50%',
						opacity: interpolate(frame, [0, 0.2 * fps], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<Img
						name="Motion blur guide in light mode"
						src="https://remotion.media/motion-blur-2026-11-17/documentation-api-light-7cab3e0dc354.png"
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 1080,
							height: (1080 * 1800) / 860,
							translate: interpolate(
								frame,
								[0, 0.5 * fps, 2.2 * fps, 4.8 * fps],
								['90px 40px', '90px 40px', '110px -840px', '230px -1220px'],
								{
									easing: Easing.bezier(0.42, 0, 0.58, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
						}}
					/>
				</Interactive.Div>
			</div>
		</div>
	);
};

export const MotionBlurDocumentation = Interactive.create({
	Component: MotionBlurDocumentationContent,
	layout: 'absolute-fill',
	schema: {},
});
