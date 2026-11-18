import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import type {ChatGPTTheme} from '../ChatGPTPrompt';
import {getNaturalTypedCharacterCount} from '../natural-typing';
import {HigherLevelTaskPrompt} from './HigherLevelTaskPrompt';

const RoughCutPromptContent = ({theme}: {readonly theme: ChatGPTTheme}) => {
	const frame = useCurrentFrame();
	const prompt =
		'Put these videos on the timeline with captions and motion graphics as well.';
	const stages = [
		{frame: 0, characters: 0},
		{frame: 33, characters: 16},
		{frame: 41, characters: 19},
		{frame: 66, characters: 32},
		{frame: 110, characters: 32},
		{frame: 120, characters: 37},
		{frame: 135, characters: 46},
		{frame: 143, characters: 50},
		{frame: 170, characters: 66},
		{frame: 210, characters: prompt.length},
	];
	let visibleCharacters = prompt.length;
	for (let index = 1; index < stages.length; index++) {
		const end = stages[index];
		if (frame <= end.frame) {
			const start = stages[index - 1];
			visibleCharacters = getNaturalTypedCharacterCount({
				text: prompt,
				frame,
				startFrame: start.frame,
				durationInFrames: end.frame - start.frame,
				startCharacter: start.characters,
				endCharacter: end.characters,
			});
			break;
		}
	}

	return (
		<>
			<AbsoluteFill
				style={{backgroundColor: theme === 'light' ? '#ffffff' : '#060708'}}
			/>
			<Interactive.Div
				name="Pull back from the growing request"
				style={{
					position: 'absolute',
					inset: 0,
					transformOrigin: '72px 450px',
					scale: interpolate(frame, [0, 210], [3, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.22, 0.61, 0.36, 1),
						output: 'perceptual-scale',
					}),
				}}
			>
				<HigherLevelTaskPrompt
					isInitialPrompt={false}
					pluginName="Remotion"
					theme={theme}
					blurStrength={6}
					name="One prompt grows with the narration"
					prompt={prompt.slice(0, visibleCharacters)}
					typingStartFrame={0}
					typingDurationInFrames={0}
					cameraDurationInFrames={227}
				/>
			</Interactive.Div>
		</>
	);
};

export const RoughCutPrompt = Interactive.create({
	Component: RoughCutPromptContent,
	layout: 'absolute-fill',
	schema: {
		theme: {
			type: 'enum',
			default: 'dark',
			variants: {dark: {}, light: {}},
		},
	},
});
