import type {CSSProperties} from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {PromptText} from './PromptText';

export type ChatGPTTheme = 'dark' | 'light';

type ChatGPTPromptProps = {
	readonly theme: ChatGPTTheme;
	readonly prompt: string;
	readonly pluginName: string;
	readonly isInitialPrompt: boolean;
	readonly heading: string;
	readonly typingStartFrame: number;
	readonly typingDurationInFrames: number;
	readonly showCaret: boolean;
	readonly showTools: boolean;
	readonly style: CSSProperties;
};

const ChatGPTPromptContent = ({
	theme,
	prompt,
	pluginName,
	isInitialPrompt,
	heading,
	typingStartFrame,
	typingDurationInFrames,
	showCaret,
	showTools,
	style,
}: ChatGPTPromptProps) => {
	const colors =
		theme === 'light'
			? {
					text: '#0d0d0d',
					toolsBackground: '#f3f3f3',
					toolsText: '#5d5d5d',
					border: '#e3e3e3',
					inputBackground: '#ffffff',
					inputShadow:
						'0 6px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.06)',
					plugin: '#0865c4',
					logo: '#0865c4',
					icon: '#0d0d0d',
					caret: '#0d0d0d',
					skill: '#426AAE',
				}
			: {
					text: '#e5e5e5',
					toolsBackground: '#1a1a1a',
					toolsText: '#c8c8c8',
					border: '#292929',
					inputBackground: '#202020',
					inputShadow: 'none',
					plugin: '#4e7bb5',
					logo: 'white',
					icon: '#dedede',
					caret: '#d6d6d6',
					skill: '#7db4f4',
				};
	return (
		<div
			style={{
				position: 'relative',
				width: 2014,
				height: 622,
				fontFamily: 'Arial, Helvetica, sans-serif',
				fontWeight: 400,
				color: colors.text,
				...style,
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: -7,
					width: '100%',
					textAlign: 'center',
					fontSize: 60,
					lineHeight: '72px',
					fontWeight: 400,
					whiteSpace: 'nowrap',
				}}
			>
				{heading}
			</div>
			{showTools ? (
				<div
					style={{
						position: 'absolute',
						top: 422,
						left: 32,
						right: 32,
						height: 200,
						backgroundColor: colors.toolsBackground,
						borderRadius: '0 0 40px 40px',
						boxSizing: 'border-box',
						padding: '114px 40px 0',
						display: 'flex',
						gap: 72,
						color: colors.toolsText,
						fontSize: 38,
						lineHeight: '48px',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 20,
							height: 48,
							whiteSpace: 'nowrap',
						}}
					>
						<svg
							width="44"
							height="44"
							viewBox="0 0 44 44"
							fill="none"
							stroke="currentColor"
							strokeWidth="3.5"
							strokeLinejoin="round"
						>
							<path d="M4 12C4 8 6 6 10 6h9l7 5h9c4 0 5 2 5 6v19c0 3-2 5-5 5H9c-3 0-5-2-5-5Z" />
							<path d="M4 19h36" />
						</svg>
						<span>
							{isInitialPrompt && pluginName === 'Remotion'
								? 'Choose project'
								: 'iteration-loop'}
						</span>
					</div>
					<div
						style={{display: 'flex', alignItems: 'center', gap: 20, height: 48}}
					>
						<svg
							width="44"
							height="44"
							viewBox="0 0 44 44"
							fill="none"
							stroke="currentColor"
							strokeWidth="3.5"
							strokeLinejoin="round"
						>
							<rect
								x="14"
								y="5"
								width="24"
								height="29"
								rx="5"
								transform="rotate(6 26 19.5)"
							/>
							<rect
								x="5"
								y="12"
								width="25"
								height="28"
								rx="5"
								fill={colors.toolsBackground}
								transform="rotate(-8 17.5 26)"
							/>
						</svg>
						<span>Files</span>
					</div>
				</div>
			) : null}
			<div
				style={{
					position: 'absolute',
					top: 158,
					width: '100%',
					height: 336,
					boxSizing: 'border-box',
					border: `2px solid ${colors.border}`,
					borderRadius: 72,
					backgroundColor: colors.inputBackground,
					boxShadow: colors.inputShadow,
					padding: '43px 50px',
					fontSize: 43,
					lineHeight: '56px',
				}}
			>
				<div style={{whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}>
					{pluginName ? (
						<span
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 9,
								color: colors.plugin,
								verticalAlign: 'bottom',
							}}
						>
							<svg
								width="36"
								height="36"
								viewBox="0 0 400 400"
								style={{transform: 'rotate(90deg)', flexShrink: 0}}
							>
								<path
									fill={colors.logo}
									stroke={colors.logo}
									strokeWidth="100"
									strokeLinejoin="round"
									d="M102 272a196 100 0 0 0 195 5A196 240 0 0 0 200 102.259 196 240 0 0 0 102 272Z"
								/>
							</svg>
							{pluginName}
						</span>
					) : null}
					{pluginName ? ' ' : null}
					<PromptText
						prompt={prompt}
						typingStartFrame={typingStartFrame}
						typingDurationInFrames={typingDurationInFrames}
						showCaret={showCaret}
						caretColor={colors.caret}
						skillColor={colors.skill}
					/>
				</div>
				<svg
					width="44"
					height="44"
					viewBox="0 0 44 44"
					fill="none"
					stroke={colors.icon}
					strokeWidth="5"
					strokeLinecap="round"
					style={{position: 'absolute', left: 48, bottom: 48}}
				>
					<path d="M22 4v36M4 22h36" />
				</svg>
			</div>
		</div>
	);
};

export const ChatGPTPrompt = Interactive.create({
	Component: ChatGPTPromptContent,
	layout: 'none',
	schema: {
		theme: {
			type: 'enum',
			default: 'dark',
			variants: {dark: {}, light: {}},
		},
		prompt: {
			type: 'string',
			default: 'please import my footage on a timeline.',
			description: 'Prompt text. Use $skill-name for a Codex skill mention.',
		},
		pluginName: {type: 'string', default: 'Remotion'},
		isInitialPrompt: {type: 'boolean', default: false},
		heading: {type: 'string', default: 'What should we work on?'},
		typingStartFrame: {
			type: 'number',
			default: 30,
			min: 0,
			step: 1,
			hiddenFromList: false,
		},
		typingDurationInFrames: {
			type: 'number',
			default: 180,
			min: 0,
			step: 1,
			hiddenFromList: false,
		},
		showCaret: {type: 'boolean', default: true},
		showTools: {type: 'boolean', default: true},
	},
});

export const AiPromptRecreation = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const sourceFrame = (frame * 60) / fps;
	const prompt =
		sourceFrame < 195
			? 'hi therer'.slice(
					0,
					Math.ceil(
						interpolate(sourceFrame, [75, 195], [9, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					),
				)
			: 'please import my footage on a timeline.'.slice(
					0,
					Math.floor(
						interpolate(sourceFrame, [195, 255, 390, 615], [0, 6, 6, 38], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					),
				);

	return (
		<AbsoluteFill style={{backgroundColor: '#0d0d0d', overflow: 'hidden'}}>
			<ChatGPTPrompt
				name="Recorded prompt recreated in code"
				isInitialPrompt
				theme="dark"
				prompt={prompt}
				pluginName="Remotion"
				heading="What should we work on?"
				typingStartFrame={0}
				typingDurationInFrames={0}
				showCaret
				showTools
				style={{position: 'absolute', left: 212, top: 432}}
			/>
		</AbsoluteFill>
	);
};
