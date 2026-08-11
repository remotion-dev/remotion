import {loadFont} from '@remotion/google-fonts/JetBrainsMono';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['400', '500'],
});

const WINDOW = '#0d1117';
const TITLE_BAR = '#161b22';
const BORDER = '#242c37';
const PROMPT = '#4ade80';
const COMMAND = '#e6edf3';
const OUTPUT = '#8b98a5';
const ACCENT = '#38bdf8';

const COMMAND_TEXT = '$ npm run build';
const FRAMES_PER_CHARACTER = 2;
const TYPING_START = 12;
const TYPING_END = TYPING_START + COMMAND_TEXT.length * FRAMES_PER_CHARACTER;

const OUTPUT_LINES = [
	{color: PROMPT, delay: 10, text: '42 modules transformed'},
	{color: PROMPT, delay: 22, text: 'bundled in 1.24 s'},
	{color: ACCENT, delay: 34, text: 'ready on localhost:3000'},
] as const;

const OUTPUT_START = TYPING_END + 8;
const LAST_OUTPUT = OUTPUT_START + OUTPUT_LINES[OUTPUT_LINES.length - 1].delay;
const EXIT_START = 132;
const EXIT_END = 150;

/**
 * A blinking block caret. It sits on the command while the line is being typed
 * and returns on the fresh prompt once the command has finished running, which
 * is what makes the terminal read as idle rather than frozen.
 */
const Caret: React.FC<{readonly visible: boolean}> = ({visible}) => {
	const frame = useCurrentFrame();

	return (
		<span
			style={{
				backgroundColor: COMMAND,
				display: 'inline-block',
				height: '1.1em',
				marginLeft: 2,
				opacity: visible && frame % 30 < 15 ? 1 : 0,
				verticalAlign: 'text-bottom',
				width: '0.55em',
			}}
		/>
	);
};

export const TerminalTyping: React.FC = () => {
	const frame = useCurrentFrame();

	const typed = COMMAND_TEXT.slice(
		0,
		Math.max(0, Math.floor((frame - TYPING_START) / FRAMES_PER_CHARACTER)),
	);

	return (
		<Interactive.Div
			name="Container"
			style={{
				backgroundColor: WINDOW,
				borderColor: BORDER,
				borderRadius: 16,
				borderStyle: 'solid',
				borderWidth: 1,
				boxShadow: '0 24px 60px rgba(1, 4, 9, 0.45)',
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				fontFamily: 'JetBrains Mono',
				height: 340,
				opacity: interpolate(
					frame,
					[0, 14, EXIT_START, EXIT_END],
					[0, 1, 1, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				),
				overflow: 'hidden',
				translate: interpolate(
					frame,
					[0, 18, EXIT_START, EXIT_END],
					['0px 16px', '0px 0px', '0px 0px', '0px -12px'],
					{
						easing: Easing.bezier(0.33, 1, 0.68, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				width: 900,
			}}
		>
			<div
				style={{
					alignItems: 'center',
					backgroundColor: TITLE_BAR,
					borderBottomColor: BORDER,
					borderBottomStyle: 'solid',
					borderBottomWidth: 1,
					display: 'flex',
					gap: 10,
					height: 46,
					paddingLeft: 22,
				}}
			>
				{['#ff5f57', '#febc2e', '#28c840'].map((color) => (
					<div
						key={color}
						style={{
							backgroundColor: color,
							borderRadius: '50%',
							height: 13,
							width: 13,
						}}
					/>
				))}
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					fontSize: 26,
					gap: 6,
					lineHeight: 1.5,
					padding: 26,
				}}
			>
				<Interactive.Div name="Command" style={{color: COMMAND}}>
					<span style={{color: PROMPT}}>{typed.slice(0, 2)}</span>
					{typed.slice(2)}
					<Caret visible={frame < TYPING_END + 6} />
				</Interactive.Div>
				<Interactive.Div
					name="Output"
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 6,
						marginTop: 10,
					}}
				>
					{OUTPUT_LINES.map((line) => {
						const start = OUTPUT_START + line.delay;

						return (
							<div
								key={line.text}
								style={{
									alignItems: 'center',
									color: OUTPUT,
									display: 'flex',
									gap: 14,
									opacity: interpolate(frame, [start, start + 8], [0, 1], {
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									}),
									translate: interpolate(
										frame,
										[start, start + 10],
										['0px 8px', '0px 0px'],
										{
											easing: Easing.out(Easing.cubic),
											extrapolateLeft: 'clamp',
											extrapolateRight: 'clamp',
										},
									),
								}}
							>
								<div
									style={{
										backgroundColor: line.color,
										borderRadius: '50%',
										flexShrink: 0,
										height: 10,
										width: 10,
									}}
								/>
								{line.text}
							</div>
						);
					})}
				</Interactive.Div>
				<div
					style={{
						color: COMMAND,
						marginTop: 10,
						opacity: interpolate(
							frame,
							[LAST_OUTPUT + 12, LAST_OUTPUT + 20],
							[0, 1],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
					}}
				>
					<span style={{color: PROMPT}}>$</span>
					<Caret visible={frame > LAST_OUTPUT + 12} />
				</div>
			</div>
		</Interactive.Div>
	);
};
