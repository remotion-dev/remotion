import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {assetUrl} from './assets';

type VideoBRollProps = {
	/** Filename in public/ */
	src: string;
	/** Duration in seconds. Default: 3 */
	durationSeconds?: number;
	/** Fade in/out duration in seconds. Default: 0.2 */
	fadeDuration?: number;
	/** Scale factor for Ken Burns zoom. Default: 1.05 */
	scale?: number;
	/** Background color. Default: "white" */
	backgroundColor?: string;
	/** Trim start in seconds. Default: 0 */
	trimBeforeSeconds?: number;
	/** Playback rate. Default: 1 */
	playbackRate?: number;
};

export const VideoBRoll: React.FC<VideoBRollProps> = ({
	src,
	durationSeconds = 3,
	fadeDuration = 0.2,
	scale = 1.05,
	backgroundColor = 'white',
	trimBeforeSeconds = 0,
	playbackRate = 1,
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

	return (
		<AbsoluteFill
			style={{
				backgroundColor,
				justifyContent: 'center',
				alignItems: 'center',
				opacity,
			}}
		>
			<Video
				src={assetUrl(src)}
				muted
				trimBefore={Math.floor(trimBeforeSeconds * fps)}
				playbackRate={playbackRate}
				style={{
					height: '100%',
					objectFit: 'contain',
					transformOrigin: 'top center',
					transform: `scale(${currentScale})`,
				}}
			/>
		</AbsoluteFill>
	);
};
