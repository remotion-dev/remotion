import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {
	Easing,
	HtmlInCanvas,
	Interactive,
	interpolate,
	Sequence,
	Track,
	useCurrentFrame,
} from 'remotion';
import {ChatGPTPrompt} from '../ChatGPTPrompt';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {InvokeAgentCaptureComposition} from './InvokeAgentCaptureComposition';

const InvokeAgentMenu = () => {
	const frame = useCurrentFrame();

	return (
		<HtmlInCanvas
			name="Invoke a coding agent close-up"
			width={1920}
			height={1080}
			style={{backgroundColor: '#1f2427'}}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.55],
					end: [0.5, 0.95],
					endBlur: 6,
				}),
			]}
		>
			<Interactive.Div
				name="Pan from Open in to the installed coding agents"
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: 1284,
					height: 1440,
					translate: interpolate(
						frame,
						[22, 64],
						['-600px -690px', '-750px -780px'],
						{
							easing: Easing.bezier(0.42, 0, 0.58, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					transformOrigin: interpolate(
						frame,
						[22, 64],
						['600px 690px', '750px 780px'],
						{
							easing: Easing.bezier(0.42, 0, 0.58, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					rotate: EXPLORE_CAMERA_ANGLE,
					scale: 2.2,
				}}
			>
				<Sequence
					name="Open the menu and invoke ChatGPT"
					trimBefore={80}
					durationInFrames={108}
					playbackRate={0.8}
					layout="none"
				>
					<InvokeAgentCaptureComposition />
				</Sequence>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

const InvokedChatGPTPrompt = () => {
	const frame = useCurrentFrame();

	return (
		<HtmlInCanvas
			name="Strong progressive focus on the prompt"
			width={1920}
			height={1080}
			style={{backgroundColor: '#ffffff'}}
			effects={[
				linearProgressiveBlur({
					start: [
						interpolate(frame, [0, 56], [0.2, 0.45], {
							easing: Easing.inOut(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						0.4,
					],
					end: [0.95, 0.8],
					endBlur: interpolate(frame, [0, 56], [32, 20], {
						easing: Easing.inOut(Easing.cubic),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}),
			]}
		>
			<Interactive.Div
				name="Tight angled view of the prompt's left edge"
				style={{
					position: 'absolute',
					left: 220,
					top: 520,
					width: 2014,
					height: 622,
					translate: '-100px -230px',
					transformOrigin: '100px 230px',
					rotate: '0.904608 0.351506 -0.241096 44deg',
					scale: interpolate(frame, [0, 56], [1.8, 1.85], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			>
				<ChatGPTPrompt
					isInitialPrompt={false}
					name="Context pasted into ChatGPT"
					theme="light"
					pluginName=""
					heading=""
					prompt="12 - Edit clips and delete AI slop in src/AgenticallyProgrammatically/AgenticallyProgrammatically.tsx:2571"
					typingStartFrame={3}
					typingDurationInFrames={0}
					showCaret
					showTools
					style={{}}
				/>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

const InvokeAgentBrollContent = () => {
	return (
		<Track name="Invoke an agent with Studio context">
			<Sequence name="Click ChatGPT and hold" from={0} durationInFrames={135}>
				<InvokeAgentMenu />
			</Sequence>
			<Sequence
				name="ChatGPT receives the context"
				from={135}
				durationInFrames={57}
			>
				<InvokedChatGPTPrompt />
			</Sequence>
		</Track>
	);
};

export const InvokeAgentBroll = Interactive.create({
	Component: InvokeAgentBrollContent,
	layout: 'absolute-fill',
	schema: {},
});
