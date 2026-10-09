import {Audio} from '@remotion/media';
import type {InteractivitySchema} from 'remotion';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {assetUrl} from './assets';
import {Thinking} from './Thinking';

const TYPING_DURATION_SECONDS = 2;
const TYPING_DELAY_SECONDS = 0.5;
const CURSOR_BLINK_FRAMES = 16;
const FONT_SIZE = 38;
const CHAR_WIDTH = 23;
const BOX_WIDTH = 1300;
const CONTENT_WIDTH = BOX_WIDTH - 56 * 2;
const LINE_HEIGHT = 54;
const POSTERIZE_FRAMES = 3;

export type PromptProps = {
	prompt: string;
	thinkingIndex: number;
};

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

const PromptInner: React.FC<PromptProps> = ({prompt, thinkingIndex}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const typingAnimationFrame =
		Math.floor(frame / POSTERIZE_FRAMES) * POSTERIZE_FRAMES;

	const delayFrames = TYPING_DELAY_SECONDS * fps;
	const typingFrames = TYPING_DURATION_SECONDS * fps;
	const framesPerChar = typingFrames / prompt.length;
	const typingFrame = Math.max(0, typingAnimationFrame - delayFrames);
	const typedChars = Math.min(
		prompt.length,
		Math.floor(typingFrame / framesPerChar),
	);
	const typedText = prompt.slice(0, typedChars);

	const fullTextWithPrefix = '❯ ' + prompt;
	const charsPerLine = Math.floor(CONTENT_WIDTH / CHAR_WIDTH);
	const numLines = Math.ceil(fullTextWithPrefix.length / charsPerLine);
	const textHeight = numLines * LINE_HEIGHT;

	const totalHeight = 32 * 2 + textHeight + 24 + 4 + 90;

	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{
				justifyContent: 'flex-end',
				alignItems: 'center',
				paddingBottom: 80,
			}}
		>
			<Audio
				name="Prompt typing sound"
				src={assetUrl('prompt-sfx.wav')}
				volume={0.3}
			/>
			<Interactive.Div
				name="Agent prompt card"
				style={{
					backgroundColor: '#292C34',
					padding: '32px 56px',
					boxShadow:
						'0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
					width: 1300,
					height: totalHeight,
					textAlign: 'left',
					translate: interpolate(frame, [0, 23], ['0px 400px', '0px 0px'], {
						easing: Easing.spring({damping: 200, allowTail: true}),
						posterize: 3,
						extrapolateLeft: 'clamp',
						extrapolateRight: 'extend',
					}),
					scale: interpolate(frame, [0, 23], [0.9, 1], {
						easing: Easing.spring({damping: 200, allowTail: true}),
						posterize: 3,
						extrapolateLeft: 'clamp',
						extrapolateRight: 'extend',
					}),
				}}
			>
				<span
					style={{
						color: 'white',
						fontSize: 38,
						fontFamily: 'monospace',
						fontWeight: 500,
					}}
				>
					❯ {typedText}
				</span>
				<Cursor frame={typingAnimationFrame} />
				<div
					style={{
						height: 4,
						backgroundColor: '#595A5F',
						marginTop: 24,
					}}
				/>
				<div
					style={{
						opacity: interpolate(frame, [2.5 * fps, 2.65 * fps], [0, 1], {
							easing: Easing.in(Easing.ease),
							posterize: 3,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<Thinking index={thinkingIndex} />
				</div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

const promptSchema = {
	prompt: {type: 'string', default: '', description: 'Prompt'},
	thinkingIndex: {
		type: 'number',
		default: 0,
		min: 0,
		step: 1,
		integer: true,
		hiddenFromList: false,
		keyframable: false,
		description: 'Thinking message index',
	},
} as const satisfies InteractivitySchema;

export const Prompt = Interactive.withSchema({
	Component: PromptInner,
	componentName: '<Prompt>',
	schema: promptSchema,
	wrapInSequence: true,
	layout: 'absolute-fill',
});
