import {
	AbsoluteFill,
	Audio,
	Easing,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {MESSAGES} from './messages';
import {Thinking} from './Thinking';

const TYPING_DURATION_SECONDS = 2;
const TYPING_DELAY_SECONDS = 0.5;
const THINKING_FADE_SECONDS = 0.15;
const CURSOR_BLINK_FRAMES = 16;
const FONT_SIZE = 38;
const CHAR_WIDTH = 23;
const BOX_WIDTH = 1300;
const CONTENT_WIDTH = BOX_WIDTH - 56 * 2;
const LINE_HEIGHT = 54;
const POSTERIZE_FRAMES = 3;

export const PromptSchema = z.object({
	prompt: z.string().describe('The prompt text to display with typing animation'),
	thinkingIndex: z
		.number()
		.describe('Index for the thinking animation variant'),
});

export type PromptProps = z.infer<typeof PromptSchema>;

const Cursor: React.FC<{frame: number}> = ({frame}) => {
	const opacity = interpolate(
		frame % CURSOR_BLINK_FRAMES,
		[0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
		[1, 0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return (
		<span
			style={{
				opacity,
				display: 'inline-block',
				width: 20,
				height: FONT_SIZE,
				backgroundColor: 'white',
				marginLeft: 4,
				verticalAlign: 'text-bottom',
			}}
		/>
	);
};

export const Prompt: React.FC<PromptProps> = ({prompt, thinkingIndex}) => {
	const clampedThinkingIndex = Math.max(
		0,
		Math.min(MESSAGES.length - 1, thinkingIndex),
	);
	const rawFrame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const frame = Math.floor(rawFrame / POSTERIZE_FRAMES) * POSTERIZE_FRAMES;

	const delayFrames = TYPING_DELAY_SECONDS * fps;
	const typingFrames = TYPING_DURATION_SECONDS * fps;
	const framesPerChar = typingFrames / prompt.length;
	const typingFrame = Math.max(0, frame - delayFrames);
	const typedChars = Math.min(
		prompt.length,
		Math.floor(typingFrame / framesPerChar),
	);
	const typedText = prompt.slice(0, typedChars);

	const typingEndFrame = delayFrames + typingFrames;
	const thinkingFadeFrames = THINKING_FADE_SECONDS * fps;
	const thinkingOpacity = interpolate(
		frame,
		[typingEndFrame, typingEndFrame + thinkingFadeFrames],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.in(Easing.ease),
		},
	);

	const enterProgress = spring({
		frame,
		fps,
		config: {
			damping: 200,
		},
	});
	const translateY = interpolate(enterProgress, [0, 1], [400, 0]);
	const scale = interpolate(enterProgress, [0, 1], [0.9, 1]);

	const fullTextWithPrefix = '❯ ' + prompt;
	const charsPerLine = Math.floor(CONTENT_WIDTH / CHAR_WIDTH);
	const numLines = Math.ceil(fullTextWithPrefix.length / charsPerLine);
	const textHeight = numLines * LINE_HEIGHT;

	const totalHeight = 32 * 2 + textHeight + 24 + 4 + 90;

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'flex-end',
				alignItems: 'center',
				paddingBottom: 80,
			}}
		>
			<Audio src={staticFile('prompt-appear.wav')} />
			<div
				style={{
					backgroundColor: '#292C34',
					padding: '32px 56px',
					boxShadow:
						'0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
					width: BOX_WIDTH,
					height: totalHeight,
					textAlign: 'left',
					transform: `translateY(${translateY}px) scale(${scale})`,
				}}
			>
				<span
					style={{
						color: 'white',
						fontSize: FONT_SIZE,
						fontFamily: 'monospace',
						fontWeight: 500,
					}}
				>
					❯ {typedText}
				</span>
				<Cursor frame={frame} />
				<div
					style={{
						height: 4,
						backgroundColor: '#595A5F',
						marginTop: 24,
					}}
				/>
				<div style={{opacity: thinkingOpacity}}>
					<Thinking index={clampedThinkingIndex} />
				</div>
			</div>
		</AbsoluteFill>
	);
};
