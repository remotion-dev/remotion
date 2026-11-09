import type {CSSProperties} from 'react';
import {Interactive} from 'remotion';
import {CodexComposer} from './video-elements/Codex';

const CodexPromptContent = ({
	prompt,
	typingStartFrame,
	typingDurationInFrames,
	style,
}: {
	readonly prompt: string;
	readonly typingStartFrame: number;
	readonly typingDurationInFrames: number;
	readonly style: CSSProperties;
}) => {
	return (
		<div
			style={{
				position: 'relative',
				width: 640,
				height: 130,
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
				fontWeight: 400,
				WebkitFontSmoothing: 'antialiased',
				...style,
			}}
		>
			<CodexComposer
				top={0}
				prompt={prompt}
				typingStartFrame={typingStartFrame}
				typingDurationInFrames={typingDurationInFrames}
			/>
		</div>
	);
};

export const CodexPrompt = Interactive.create({
	Component: CodexPromptContent,
	layout: 'none',
	schema: {
		prompt: {type: 'string', default: 'Cut away the silent parts.'},
		typingStartFrame: {
			type: 'number',
			default: 0,
			min: 0,
			step: 1,
			hiddenFromList: false,
		},
		typingDurationInFrames: {
			type: 'number',
			default: 30,
			min: 0,
			step: 1,
			hiddenFromList: false,
		},
	},
});
