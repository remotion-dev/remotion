import {
	AbsoluteFill,
	Img,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {assetUrl} from './assets';

type ImageBRollProps = {
	/** Filename in public/ */
	src: string;
	/** Duration in seconds. Default: 4 */
	durationSeconds?: number;
	/** Fade in/out duration in seconds. Default: 0.2 */
	fadeDuration?: number;
	/** Scale factor for Ken Burns zoom. Default: 1.15 */
	scale?: number;
	/** Pan translateY range in percent. Default: -15 */
	panY?: number;
};

export const ImageBRoll: React.FC<ImageBRollProps> = ({
	src,
	durationSeconds = 4,
	fadeDuration = 0.2,
	scale = 1.15,
	panY = -15,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const duration = Math.round(durationSeconds * fps);
	const fade = fadeDuration * fps;

	const opacity = interpolate(
		frame,
		[0, fade, duration - fade, duration],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	const currentScale = interpolate(frame, [0, duration], [1, scale], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const translateY = interpolate(frame, [0, duration], [0, panY], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				justifyContent: 'center',
				alignItems: 'center',
				opacity,
			}}
		>
			<Img
				src={assetUrl(src)}
				style={{
					height: '100%',
					objectFit: 'contain',
					transformOrigin: 'top center',
					transform: `scale(${currentScale}) translateY(${translateY}%)`,
				}}
			/>
		</AbsoluteFill>
	);
};
