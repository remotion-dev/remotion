import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {
	HtmlInCanvas,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {ChatGPTPrompt} from '../ChatGPTPrompt';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

const OpenStudioPromptContent = () => {
	const frame = useCurrentFrame();
	return (
		<HtmlInCanvas
			name="Open Studio prompt focus"
			width={1920}
			height={1080}
			style={{backgroundColor: '#ffffff'}}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.4],
					end: [0.5, 0.85],
					endBlur: 6,
				}),
			]}
		>
			<Interactive.Div
				name="Tight close-up of the remotion-studio skill"
				style={{
					position: 'absolute',
					left: '50%',
					top: '44%',
					width: 2014,
					height: 622,
					translate: '-250px -230px',
					transformOrigin: '250px 230px',
					rotate: EXPLORE_CAMERA_ANGLE,
					scale: interpolate(frame, [0, 98], [4, 4.3], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			>
				<ChatGPTPrompt
					isInitialPrompt={false}
					name="Invoke the remotion-studio skill"
					theme="light"
					pluginName=""
					prompt="/remotion-studio"
					heading=""
					typingStartFrame={0}
					typingDurationInFrames={0}
					showCaret={false}
					showTools
					style={{}}
				/>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

export const OpenStudioPrompt = Interactive.create({
	Component: OpenStudioPromptContent,
	layout: 'absolute-fill',
	schema: {},
});
