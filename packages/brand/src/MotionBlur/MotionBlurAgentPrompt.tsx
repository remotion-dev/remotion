import type {CSSProperties} from 'react';
import {Interactive, useCurrentFrame} from 'remotion';
import {ChatGPTPrompt} from '../ChatGPTPrompt';
import {getNaturalTypedCharacterCount} from '../natural-typing';

const MotionBlurAgentPromptContent = ({
	pastedContext,
	prompt,
	pasteFrame,
	typingStartFrame,
	typingDurationInFrames,
	style,
}: {
	readonly pastedContext: string;
	readonly prompt: string;
	readonly pasteFrame: number;
	readonly typingStartFrame: number;
	readonly typingDurationInFrames: number;
	readonly style: CSSProperties;
}) => {
	const frame = useCurrentFrame();
	const visibleCharacters = getNaturalTypedCharacterCount({
		text: prompt,
		frame,
		startFrame: typingStartFrame,
		durationInFrames: typingDurationInFrames,
		startCharacter: 0,
		endCharacter: prompt.length,
	});

	return (
		<div style={style}>
			<ChatGPTPrompt
				name="Paste context, then type the request"
				theme="light"
				pluginName=""
				isInitialPrompt={false}
				heading="What should we work on?"
				prompt={
					frame < pasteFrame
						? ''
						: `${pastedContext}\n${prompt.slice(0, visibleCharacters)}`
				}
				typingStartFrame={0}
				typingDurationInFrames={0}
				showCaret
				showTools
				style={{width: '100%', height: '100%'}}
			/>
		</div>
	);
};

export const MotionBlurAgentPrompt = Interactive.create({
	Component: MotionBlurAgentPromptContent,
	layout: 'none',
	schema: {
		pastedContext: {
			type: 'string',
			default: '',
			description: 'Pasted element context',
		},
		prompt: {
			type: 'string',
			default: 'add motion blur to this',
			description: 'Typed request',
		},
		pasteFrame: {
			type: 'number',
			default: 8,
			min: 0,
			step: 1,
			hiddenFromList: false,
			description: 'Paste frame',
		},
		typingStartFrame: {
			type: 'number',
			default: 30,
			min: 0,
			step: 1,
			hiddenFromList: false,
			description: 'Typing start frame',
		},
		typingDurationInFrames: {
			type: 'number',
			default: 40,
			min: 1,
			step: 1,
			hiddenFromList: false,
			description: 'Typing duration',
		},
	},
});
