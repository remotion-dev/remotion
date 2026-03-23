import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const POSTERIZE_FRAMES = 3;
const FONT_SIZE = 80;
const CARD_PADDING_X = 80;
const CARD_PADDING_Y = 48;

export const FlyingCardBottom: React.FC = () => {
	const rawFrame = useCurrentFrame();
	const {fps, height} = useVideoConfig();
	const frame = Math.floor(rawFrame / POSTERIZE_FRAMES) * POSTERIZE_FRAMES;

	const enterProgress = spring({
		frame,
		fps,
		config: {
			damping: 200,
		},
	});

	const translateY = interpolate(enterProgress, [0, 1], [height + 200, 0]);
	const scale = interpolate(enterProgress, [0, 1], [0.9, 1]);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					backgroundColor: 'white',
					padding: `${CARD_PADDING_Y}px ${CARD_PADDING_X}px`,
					boxShadow:
						'0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
					transform: `translateY(${translateY}px) scale(${scale})`,
				}}
			>
				<span
					style={{
						color: 'black',
						fontSize: FONT_SIZE,
						fontFamily: 'GT Planar',
						fontWeight: 500,
						whiteSpace: 'nowrap',
					}}
				>
					npx skills add remotion-dev/skills
				</span>
			</div>
		</AbsoluteFill>
	);
};
