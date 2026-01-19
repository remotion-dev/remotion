import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const MyAnimation = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const COLOR_BG = '#ffffff';
	const COLOR_TEXT = '#000000';

	const FULL_TEXT = 'From prompt to motion graphics. This is Remotion.';
	const CARET_SYMBOL = '\u258C';
	const PAUSE_AFTER = 'From prompt to motion graphics.';

	const FONT_SIZE = 72;
	const FONT_WEIGHT = 700;
	const CHAR_FRAMES = 2;
	const CURSOR_BLINK_FRAMES = 16;
	const PAUSE_SECONDS = 1;

	const PAUSE_FRAMES = Math.round(fps * PAUSE_SECONDS);

	const pauseIndex = FULL_TEXT.indexOf(PAUSE_AFTER);
	const preLen =
		pauseIndex >= 0 ? pauseIndex + PAUSE_AFTER.length : FULL_TEXT.length;

	let typedChars = 0;
	if (frame < preLen * CHAR_FRAMES) {
		typedChars = Math.floor(frame / CHAR_FRAMES);
	} else if (frame < preLen * CHAR_FRAMES + PAUSE_FRAMES) {
		typedChars = preLen;
	} else {
		const postPhase = frame - preLen * CHAR_FRAMES - PAUSE_FRAMES;
		typedChars = Math.min(
			FULL_TEXT.length,
			preLen + Math.floor(postPhase / CHAR_FRAMES),
		);
	}
	const typedText = FULL_TEXT.slice(0, typedChars);

	const caretOpacity = interpolate(
		frame % CURSOR_BLINK_FRAMES,
		[0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
		[1, 0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLOR_BG,
				display: 'flex',
				fontFamily: 'Inter, sans-serif',
			}}
		>
			<div
				style={{
					color: COLOR_TEXT,
					fontSize: FONT_SIZE,
					fontWeight: FONT_WEIGHT,
					lineHeight: 1.15,
					whiteSpace: 'pre-wrap',
				}}
			>
				<span>{typedText}</span>
				<span style={{opacity: caretOpacity}}>{CARET_SYMBOL}</span>
			</div>
		</AbsoluteFill>
	);
};
