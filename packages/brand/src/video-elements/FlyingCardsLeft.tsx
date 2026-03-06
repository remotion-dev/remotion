import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const POSTERIZE_FRAMES = 3;
const FONT_SIZE = 52;
const CARD_PADDING_X = 56;
const CARD_PADDING_Y = 32;
const STAGGER_FRAMES = 8;
const CARD_WIDTH = 700;

const CARDS = ['Jonny Burger', '@JNYBGR'];

const Card: React.FC<{
	text: string;
	index: number;
	frame: number;
	fps: number;
	width: number;
}> = ({text, index, frame, fps, width}) => {
	const delay = index * STAGGER_FRAMES;
	const delayedFrame = Math.max(0, frame - delay);

	const enterProgress = spring({
		frame: delayedFrame,
		fps,
		config: {
			damping: 200,
		},
	});

	const translateX = interpolate(enterProgress, [0, 1], [-(width + 200), 0]);
	const scale = interpolate(enterProgress, [0, 1], [0.9, 1]);

	return (
		<div
			style={{
				backgroundColor: 'white',
				padding: `${CARD_PADDING_Y}px ${CARD_PADDING_X}px`,
				boxShadow:
					'0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
				transform: `translateX(${translateX}px) scale(${scale})`,
				marginBottom: 20,
				width: CARD_WIDTH,
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
				{text}
			</span>
		</div>
	);
};

export const VibeSkillsFlyingCardsLeft: React.FC = () => {
	const rawFrame = useCurrentFrame();
	const {fps, width} = useVideoConfig();
	const frame = Math.floor(rawFrame / POSTERIZE_FRAMES) * POSTERIZE_FRAMES;

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'flex-start',
				paddingLeft: 80,
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
				}}
			>
				{CARDS.map((text, index) => (
					<Card
						key={text}
						text={text}
						index={index}
						frame={frame}
						fps={fps}
						width={width}
					/>
				))}
			</div>
		</AbsoluteFill>
	);
};
