import {colorCorrection} from '@remotion/effects/color-correction';
import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {AbsoluteFill, HtmlInCanvas, Interactive} from 'remotion';
import {ChatGPTPrompt} from './ChatGPTPrompt';
import {EXPLORE_CAMERA_ANGLE} from './HomepageAssets/ExploreRemotion/camera-angle';

const ChatGPTPromptHomepageContent = ({
	prompt,
	typingStartFrame,
	typingDurationInFrames,
}: {
	readonly prompt: string;
	readonly typingStartFrame: number;
	readonly typingDurationInFrames: number;
}) => {
	return (
		<>
			<AbsoluteFill style={{backgroundColor: '#060708'}} />
			<HtmlInCanvas
				width={1080}
				height={1080}
				effects={[
					colorCorrection({
						pivot: 0,
						shadows: 1,
						whites: 0.26,
						blacks: -1,
						temperature: -1,
					}),
					linearProgressiveBlur({
						end: [0.725, 0.915],
						start: [0.23, 0.203],
						endBlur: 28,
					}),
				]}
			>
				<Interactive.Div
					name="Homepage prompt angle"
					style={{
						position: 'absolute',
						width: 1284,
						height: 500,
						left: -95,
						top: 290,
						overflow: 'hidden',
						rotate: EXPLORE_CAMERA_ANGLE,
						scale: 1.84,
						translate: '587.6px 0px',
					}}
				>
					<ChatGPTPrompt
						name="Simulated homepage prompt"
						isInitialPrompt
						theme="dark"
						prompt={prompt}
						pluginName="Remotion"
						heading="What should we work on?"
						typingStartFrame={typingStartFrame}
						typingDurationInFrames={typingDurationInFrames}
						showCaret
						showTools
						style={{position: 'absolute', left: 58.4, top: -138}}
					/>
				</Interactive.Div>
			</HtmlInCanvas>
		</>
	);
};

export const ChatGPTPromptHomepage = Interactive.create({
	Component: ChatGPTPromptHomepageContent,
	layout: 'absolute-fill',
	schema: {
		prompt: {
			type: 'string',
			default: 'please import my footage on a timeline.',
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
			default: 120,
			min: 0,
			step: 1,
			hiddenFromList: false,
		},
	},
});
