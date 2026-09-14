import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

type SlideInOverlayProps = {
	/** Content rendered inside the sliding panel */
	children: React.ReactNode;
	/** When the slide-in starts, in seconds */
	startAt: number;
	/** Duration of the slide-in animation, in seconds. Default: 1 */
	slideInDuration?: number;
	/** Duration the overlay stays fully visible, in seconds. Default: 3.5 */
	holdDuration?: number;
	/** Duration of the slide-out animation, in seconds. Default: 1 */
	slideOutDuration?: number;
	/** Width of the overlay as a percentage of the composition. Default: 40 */
	widthPercent?: number;
	/** Background color of the overlay panel. Default: "white" */
	backgroundColor?: string;
};

export const useSlideInProgress = ({
	startAt,
	slideInDuration = 1,
	holdDuration = 3.5,
	slideOutDuration = 1,
}: {
	startAt: number;
	slideInDuration?: number;
	holdDuration?: number;
	slideOutDuration?: number;
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const inStart = startAt * fps;
	const inDuration = slideInDuration * fps;
	const outStart = inStart + inDuration + holdDuration * fps;
	const outDuration = slideOutDuration * fps;

	const slideIn = interpolate(frame, [inStart, inStart + inDuration], [0, 1], {
		easing: Easing.out(Easing.cubic),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const slideOut = interpolate(
		frame,
		[outStart, outStart + outDuration],
		[0, 1],
		{
			easing: Easing.in(Easing.cubic),
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);

	return slideIn - slideOut;
};

export const SlideInOverlay: React.FC<SlideInOverlayProps> = ({
	children,
	startAt,
	slideInDuration = 1,
	holdDuration = 3.5,
	slideOutDuration = 1,
	widthPercent = 40,
	backgroundColor = 'white',
}) => {
	const progress = useSlideInProgress({
		startAt,
		slideInDuration,
		holdDuration,
		slideOutDuration,
	});

	const overlayX = interpolate(progress, [0, 1], [102, 0]);

	return (
		<AbsoluteFill
			style={{
				left: `${100 - widthPercent}%`,
				width: `${widthPercent}%`,
				transform: `translateX(${overlayX}%)`,
				backgroundColor,
				overflow: 'hidden',
			}}
			showInTimeline={false}
		>
			{children}
		</AbsoluteFill>
	);
};
