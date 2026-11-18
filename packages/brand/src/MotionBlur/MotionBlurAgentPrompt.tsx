import type {CSSProperties} from 'react';
import {Interactive, useCurrentFrame} from 'remotion';
import {ChatGPTPrompt} from '../ChatGPTPrompt';
import {getNaturalTypedCharacterCount} from '../natural-typing';

const defaultHeading = 'What should we work on?';

const MotionBlurAgentPromptContent = ({
	pastedContext,
	prompt,
	heading = defaultHeading,
	projectName,
	pasteFrame,
	typingStartFrame,
	typingDurationInFrames,
	style,
}: {
	readonly pastedContext: string;
	readonly prompt: string;
	readonly heading?: string;
	readonly projectName?: string;
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
	const typedPrompt = prompt.slice(0, visibleCharacters);

	return (
		<div style={style}>
			<ChatGPTPrompt
				name="Type the request, then paste context"
				theme="light"
				pluginName=""
				projectName={projectName}
				isInitialPrompt={false}
				heading={heading}
				prompt={
					frame >= pasteFrame && pastedContext
						? `${typedPrompt}\n${pastedContext}`
						: typedPrompt
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
		heading: {type: 'string', default: defaultHeading},
		projectName: {type: 'string', default: 'iteration-loop'},
		pasteFrame: {
			type: 'number',
			default: 58,
			min: 0,
			step: 1,
			hiddenFromList: false,
			description: 'Paste frame',
		},
		typingStartFrame: {
			type: 'number',
			default: 8,
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
