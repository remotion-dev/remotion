import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const WORDS = ['This is a', 'Text rotation example', 'using Remotion!'];

const FONT_SIZE = 120;
const FONT_WEIGHT = 'bold';
const COLOR_TEXT = '#eee';
const COLOR_BACKGROUND = '#1a1a2e';
const BLUR_AMOUNT = 10;

export const MyAnimation = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const WORD_DURATION = 2 * fps;
	const FADE_IN_DURATION = 0.5 * fps;
	const FADE_OUT_START = 1.5 * fps;

	const currentWordIndex = Math.floor(frame / WORD_DURATION) % WORDS.length;
	const frameInWord = frame % WORD_DURATION;

	// Fade in/out animation
	const opacity = interpolate(
		frameInWord,
		[0, FADE_IN_DURATION, FADE_OUT_START, WORD_DURATION],
		[0, 1, 1, 0],
		{extrapolateRight: 'clamp'},
	);

	// Scale animation
	const scale = interpolate(
		frameInWord,
		[0, FADE_IN_DURATION, FADE_OUT_START, WORD_DURATION],
		[0.8, 1, 1, 1.2],
		{extrapolateRight: 'clamp'},
	);

	// Blur animation
	const blur = interpolate(
		frameInWord,
		[0, FADE_IN_DURATION, FADE_OUT_START, WORD_DURATION],
		[BLUR_AMOUNT, 0, 0, BLUR_AMOUNT],
		{extrapolateRight: 'clamp'},
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLOR_BACKGROUND,
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					fontSize: FONT_SIZE,
					fontWeight: FONT_WEIGHT,
					color: COLOR_TEXT,
					opacity,
					transform: `scale(${scale})`,
					filter: `blur(${blur}px)`,
					fontFamily: 'system-ui, sans-serif',
				}}
			>
				{WORDS[currentWordIndex]}
			</div>
		</AbsoluteFill>
	);
};
