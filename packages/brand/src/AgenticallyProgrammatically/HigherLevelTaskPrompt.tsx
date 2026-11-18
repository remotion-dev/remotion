import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {
	Easing,
	HtmlInCanvas,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {ChatGPTPrompt} from '../ChatGPTPrompt';
import type {ChatGPTTheme} from '../ChatGPTPrompt';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

type PromptProps = {
	readonly theme: ChatGPTTheme;
	readonly blurStrength: number;
	readonly prompt: string;
	readonly pluginName: string;
	readonly isInitialPrompt: boolean;
	readonly typingStartFrame: number;
	readonly typingDurationInFrames: number;
	readonly cameraDurationInFrames: number;
};

const MovingPrompt = ({
	theme,
	prompt,
	pluginName,
	isInitialPrompt,
	typingStartFrame,
	typingDurationInFrames,
	cameraDurationInFrames,
}: PromptProps) => {
	const frame = useCurrentFrame();
	return (
		<Interactive.Div
			name="Centered Ken Burns prompt"
			style={{
				position: 'absolute',
				left: '50%',
				top: '44%',
				width: 2014,
				height: 622,
				transformOrigin: '50% 50%',
				rotate: EXPLORE_CAMERA_ANGLE,
				translate: '-50% -50%',
				scale: interpolate(
					frame,
					[0, cameraDurationInFrames - 1],
					[0.93, 0.945],
					{
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.linear,
						output: 'perceptual-scale',
					},
				),
			}}
		>
			<ChatGPTPrompt
				theme={theme}
				name="ChatGPT prompt"
				prompt={prompt}
				pluginName={pluginName}
				isInitialPrompt={isInitialPrompt}
				heading="What should we work on?"
				typingStartFrame={typingStartFrame}
				typingDurationInFrames={typingDurationInFrames}
				showCaret
				showTools
				style={{}}
			/>
		</Interactive.Div>
	);
};

const HigherLevelTaskPromptContent = (props: PromptProps) => {
	return (
		<HtmlInCanvas
			name="Progressive prompt focus"
			width={1920}
			height={1080}
			style={{backgroundColor: props.theme === 'light' ? '#ffffff' : '#060708'}}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.4],
					end: [0.5, 0.85],
					endBlur: props.blurStrength,
				}),
			]}
		>
			<MovingPrompt {...props} />
		</HtmlInCanvas>
	);
};

export const HigherLevelTaskPrompt = Interactive.create({
	Component: HigherLevelTaskPromptContent,
	layout: 'absolute-fill',
	schema: {
		pluginName: {type: 'string', default: 'Remotion'},
		isInitialPrompt: {type: 'boolean', default: false},
		blurStrength: {
			type: 'number',
			default: 6,
			min: 0,
			step: 1,
			hiddenFromList: false,
		},
		theme: {
			type: 'enum',
			default: 'dark',
			variants: {dark: {}, light: {}},
		},
		prompt: {
			type: 'string',
			default:
				"Keep an 'agent' counter. Everytime I say 'agent', increase the counter.",
		},
		cameraDurationInFrames: {
			type: 'number',
			default: 99,
			min: 1,
			step: 1,
			hiddenFromList: false,
		},
		typingStartFrame: {
			type: 'number',
			default: 0,
			min: 0,
			step: 1,
			hiddenFromList: false,
		},
		typingDurationInFrames: {
			type: 'number',
			default: 65,
			min: 0,
			step: 1,
			hiddenFromList: false,
		},
	},
});
