import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {Audio, Video} from '@remotion/media';
import type {ReactNode} from 'react';
import {
	Easing,
	Freeze,
	HtmlInCanvas,
	Img,
	Interactive,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {ChatGPTPrompt} from '../ChatGPTPrompt';
import type {ChatGPTTheme} from '../ChatGPTPrompt';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {getNaturalTypedCharacterCount} from '../natural-typing';
import {AgentAppRow} from './AvailableAgentsSidebar';
import {SoundtrackTimelineCaptureComposition} from './SoundtrackTimelineCaptureComposition';

// Vertical versions of the AgenticallyProgrammatically cutaways.
// Panel cutaways fill the 1080x960 top half; playback fills the 1080x1920 frame.

type ShortPromptProps = {
	readonly theme: ChatGPTTheme;
	readonly prompt: string;
	readonly pluginName: string;
	readonly isInitialPrompt: boolean;
	readonly typingStartFrame: number;
	readonly typingDurationInFrames: number;
	readonly cameraDurationInFrames: number;
};

const ShortPromptContent = ({
	theme,
	prompt,
	pluginName,
	isInitialPrompt,
	typingStartFrame,
	typingDurationInFrames,
	cameraDurationInFrames,
}: ShortPromptProps) => {
	const frame = useCurrentFrame();

	return (
		<HtmlInCanvas
			name="Progressive prompt focus"
			width={1080}
			height={960}
			style={{backgroundColor: theme === 'light' ? '#ffffff' : '#060708'}}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.5],
					end: [0.5, 0.92],
					endBlur: 6,
				}),
			]}
		>
			<Interactive.Div
				name="Angled prompt"
				style={{
					position: 'absolute',
					left: '50%',
					top: '49%',
					width: 940,
					height: 622,
					transformOrigin: '50% 50%',
					rotate: EXPLORE_CAMERA_ANGLE,
					translate: '-50% -50%',
					scale: interpolate(
						frame,
						[0, cameraDurationInFrames - 1],
						[1, 1.04],
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
					name="ChatGPT prompt"
					theme={theme}
					prompt={prompt}
					pluginName={pluginName}
					isInitialPrompt={isInitialPrompt}
					heading="What should we work on?"
					typingStartFrame={typingStartFrame}
					typingDurationInFrames={typingDurationInFrames}
					showCaret
					showTools
					style={{width: 940}}
				/>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

export const ShortPrompt = Interactive.create({
	Component: ShortPromptContent,
	layout: 'absolute-fill',
	schema: {
		pluginName: {type: 'string', default: 'Remotion'},
		isInitialPrompt: {type: 'boolean', default: false},
		theme: {
			type: 'enum',
			default: 'light',
			variants: {dark: {}, light: {}},
		},
		prompt: {
			type: 'string',
			default:
				'Put these videos on the timeline with captions and motion graphics as well.',
		},
		cameraDurationInFrames: {
			type: 'number',
			default: 130,
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
			default: 112,
			min: 0,
			step: 1,
			hiddenFromList: false,
		},
	},
});

const ShortPluginPromptContent = () => {
	const frame = useCurrentFrame();

	return (
		<HtmlInCanvas
			name="Close-up of the Remotion plugin prompt"
			width={1080}
			height={960}
			style={{backgroundColor: '#ffffff'}}
			effects={[
				linearProgressiveBlur({
					start: [0.4, 0.45],
					end: [0.95, 0.85],
					endBlur: 12,
				}),
			]}
		>
			<Interactive.Div
				name="Tight angled focus on Remotion"
				style={{
					position: 'absolute',
					left: 180,
					top: 480,
					width: 2014,
					height: 622,
					translate: '-50px -230px',
					transformOrigin: '50px 230px',
					rotate: '0.904608 0.351506 -0.241096 44deg',
					scale: interpolate(frame, [0, 121], [2.2, 2.35], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			>
				<ChatGPTPrompt
					name="Invoke Remotion to edit the footage"
					theme="light"
					pluginName="Remotion"
					isInitialPrompt
					heading=""
					prompt="Edit these videos into a polished video."
					typingStartFrame={6}
					typingDurationInFrames={90}
					showCaret
					showTools
					style={{}}
				/>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

export const ShortPluginPrompt = Interactive.create({
	Component: ShortPluginPromptContent,
	layout: 'absolute-fill',
	schema: {},
});

const ShortMotionGraphicsTitleContent = () => {
	return (
		<HtmlInCanvas
			name="Roller ski title preview"
			width={1080}
			height={960}
			style={{backgroundColor: '#1f2427'}}
		>
			<Interactive.Div
				name="Angled close-up of the added title"
				style={{
					position: 'absolute',
					left: '50%',
					top: 450,
					width: 988,
					height: 560,
					overflow: 'hidden',
					translate: '-50% -50%',
					rotate: EXPLORE_CAMERA_ANGLE,
					scale: 1.35,
				}}
			>
				<Video
					name="Roller Ski Commute title from the screen recording"
					src={
						'https://remotion.media/agentically-programmatically/roller-ski-title-screen-recording-a0a787d02d48.mov'
					}
					trimBefore={60}
					durationInFrames={29}
					muted
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: 1164,
						height: 932,
						translate: '-92px -60px',
					}}
				/>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

export const ShortMotionGraphicsTitle = Interactive.create({
	Component: ShortMotionGraphicsTitleContent,
	layout: 'absolute-fill',
	schema: {},
});

const ShortBeatMatchPromptContent = () => {
	const frame = useCurrentFrame();
	const prefix = 'See ';
	const path = '~/Downloads/track.mp3';
	const instruction =
		' and analyze the beat for its rhythm. Place placeholder text on the timeline.';
	// "start with some music" types the prefix, "music" pastes the track,
	// "ask your agent" starts the instruction.
	const typedPrefix = getNaturalTypedCharacterCount({
		text: prefix,
		frame,
		startFrame: 57,
		durationInFrames: 10,
		startCharacter: 0,
		endCharacter: prefix.length,
	});
	const typedInstruction = getNaturalTypedCharacterCount({
		text: instruction,
		frame,
		startFrame: 106,
		durationInFrames: 100,
		startCharacter: 0,
		endCharacter: instruction.length,
	});

	return (
		<ShortPrompt
			name="Paste the track path, then describe the beat match"
			theme="light"
			pluginName="Remotion"
			isInitialPrompt={false}
			prompt={
				frame < 80
					? prefix.slice(0, typedPrefix)
					: prefix + path + instruction.slice(0, typedInstruction)
			}
			typingStartFrame={0}
			typingDurationInFrames={0}
			cameraDurationInFrames={223}
		/>
	);
};

export const ShortBeatMatchPrompt = Interactive.create({
	Component: ShortBeatMatchPromptContent,
	layout: 'absolute-fill',
	schema: {},
});

const ShortPlaceholderTimelineContent = () => {
	const frame = useCurrentFrame();

	return (
		<HtmlInCanvas
			name="Tilted placeholder timeline"
			width={1080}
			height={960}
			style={{backgroundColor: '#1f2427'}}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.55],
					end: [0.5, 1],
					endBlur: 10,
				}),
			]}
		>
			<Interactive.Div
				name="Zoom in on timeline placeholders"
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: 2378,
					height: 1440,
					translate: '-336.5px -800px',
					transformOrigin: '336.5px 800px',
					rotate: EXPLORE_CAMERA_ANGLE,
					scale: interpolate(frame, [0, 80], [1.65, 2], {
						easing: Easing.bezier(0.33, 0, 0.67, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			>
				<Freeze frame={67}>
					<SoundtrackTimelineCaptureComposition />
				</Freeze>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

export const ShortPlaceholderTimeline = Interactive.create({
	Component: ShortPlaceholderTimelineContent,
	layout: 'absolute-fill',
	schema: {},
});

const ShortSoundtrackCamera = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Timeline close-up camera"
			style={{
				position: 'absolute',
				left: '50%',
				top: '50%',
				width: 2378,
				height: 1440,
				translate: '-336.5px -800px',
				transformOrigin: '336.5px 800px',
				rotate: EXPLORE_CAMERA_ANGLE,
				scale: 2,
			}}
		>
			<Interactive.Div
				name="Follow the playing timeline"
				style={{
					position: 'absolute',
					inset: 0,
					translate: interpolate(
						frame,
						[0, 30, 60, 90, 120, 150, 168],
						[
							'0px 0px',
							'-299.5px 0px',
							'-590px 0px',
							'-880px 0px',
							'-1160px 0px',
							'-1450px 0px',
							'-1630px 0px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			>
				<Sequence
					name="Playback from 20 - Next phrase"
					trimBefore={67}
					durationInFrames={280}
					layout="none"
				>
					<Video
						name="Timeline playback without cursor"
						src="https://remotion.media/agentically-programmatically/soundtrack-timeline-2026-11-04-e0792be009c6.mp4"
						muted
						durationInFrames={347}
						style={{position: 'absolute'}}
					/>
				</Sequence>
			</Interactive.Div>
		</Interactive.Div>
	);
};

const ShortSoundtrackPlaybackContent = () => {
	const frame = useCurrentFrame();
	const {height} = useVideoConfig();

	return (
		<HtmlInCanvas
			name="Tilted soundtrack timeline"
			width={1080}
			height={Math.round(
				interpolate(frame, [0, 18, 169, 187], [960, height, height, 960], {
					easing: Easing.bezier(0.42, 0, 0.58, 1),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			)}
			style={{backgroundColor: '#1f2427'}}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.55],
					end: [0.5, 1],
					endBlur: 10,
				}),
			]}
		>
			<ShortSoundtrackCamera />
		</HtmlInCanvas>
	);
};

export const ShortSoundtrackPlayback = Interactive.create({
	Component: ShortSoundtrackPlaybackContent,
	layout: 'absolute-fill',
	schema: {},
});

const ShortSoundtrackDemoContent = () => {
	const frame = useCurrentFrame();
	const {height} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				width: 1080,
				height: Math.round(
					interpolate(frame, [0, 18], [960, height], {
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				),
				backgroundColor: '#1f2427',
				overflow: 'hidden',
			}}
		>
			<ShortSoundtrackCamera />
		</div>
	);
};

export const ShortSoundtrackDemo = Interactive.create({
	Component: ShortSoundtrackDemoContent,
	layout: 'absolute-fill',
	schema: {},
});

export const ShortSoundtrackPresenterPush = ({
	children,
	direction,
}: {
	readonly children: ReactNode;
	readonly direction: 'down' | 'up';
}) => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Push presenter with the timeline"
			style={{
				position: 'absolute',
				inset: 0,
				translate:
					direction === 'down'
						? interpolate(frame, [0, 18], ['0px 0px', '0px 960px'], {
								easing: Easing.bezier(0.42, 0, 0.58, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							})
						: interpolate(frame, [60, 78], ['0px 960px', '0px 0px'], {
								easing: Easing.bezier(0.42, 0, 0.58, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
			}}
		>
			{children}
		</Interactive.Div>
	);
};

const ShortAgentPluginsContent = () => {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				color: '#18191a',
				fontFamily: 'Here GT Planar',
				fontWeight: 500,
				fontSize: 88,
				lineHeight: 1.05,
				letterSpacing: '-0.025em',
				fontFeatureSettings: '"ss03" 1',
			}}
		>
			<Interactive.Div
				name="Remotion plugin"
				style={{
					position: 'absolute',
					left: 140,
					top: 266,
					display: 'flex',
					alignItems: 'center',
					gap: 24,
					color: '#64748b',
					fontSize: 64,
					opacity: interpolate(frame, [0, 12], [0, 1], {
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<Img
					name="Remotion triangle"
					src="https://remotion.media/agentically-programmatically/remotion-single-triangle-a67dbd2e9855.svg"
					style={{width: 56, height: 56}}
				/>
				Remotion plugin for
			</Interactive.Div>
			<AgentAppRow
				name="ChatGPT"
				label="ChatGPT"
				logoScale={1.1}
				logo="https://remotion.media/agentically-programmatically/agent-icons/codex-63534da7294b.png"
				style={{
					position: 'absolute',
					left: 140,
					top: 434,
					gap: 40,
					opacity: interpolate(frame, [52, 64], [0, 1], {
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					translate: interpolate(frame, [52, 64], ['0px 40px', '0px 0px'], {
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			/>
			<AgentAppRow
				name="Claude"
				label="Claude"
				logoScale={1.1}
				logo="https://remotion.media/agentically-programmatically/agent-icons/claude-code-ef290ea7e8bf.png"
				style={{
					position: 'absolute',
					left: 140,
					top: 600,
					gap: 40,
					opacity: interpolate(frame, [74, 86], [0, 1], {
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					translate: interpolate(frame, [74, 86], ['0px 40px', '0px 0px'], {
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			/>
		</div>
	);
};

export const ShortAgentPlugins = Interactive.create({
	Component: ShortAgentPluginsContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

export const ShortSoundtrackMusic = () => {
	const frame = useCurrentFrame();

	return (
		<Audio
			name="Takiti - in sync with the timeline playback"
			src="https://remotion.media/studio-update/takiti-instrumental-lawd-ito-adapted-2026-11-02-448ab724379d.wav"
			trimBefore={427}
			durationInFrames={584}
			volume={interpolate(
				frame,
				[0, 30, 45, 60, 202, 214, 560, 583],
				[0, 0.08, 0.12, 0.4, 0.4, 0.07, 0.07, 0],
				{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
			)}
		/>
	);
};
