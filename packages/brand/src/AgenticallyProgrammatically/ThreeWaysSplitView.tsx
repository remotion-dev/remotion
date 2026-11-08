import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {StudioInternals} from '@remotion/studio';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import type {ReactNode} from 'react';
import {
	CanvasImage,
	Easing,
	Img,
	Interactive,
	Sequence,
	Track,
	useCurrentFrame,
	useRemotionEnvironment,
} from 'remotion';
import {CodexPrompt} from '../CodexPrompt';
import {ExploreElementsRecording20261027Composition} from '../ExploreElementsRecording20261027Composition';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {StudioRenderClickCapture} from '../StudioRenderClickComposition';
import {TimelineCaptionReorderAndScrubComposition} from '../TimelineCaptionReorderAndScrubComposition';
import {TimelineRightTrimCapture} from '../TimelineRightTrimComposition';
import {StudioSettingsCaptureComposition} from './StudioSettingsCaptureComposition';

const PaneMotionBlur = ({children}: {readonly children: ReactNode}) => {
	const frame = useCurrentFrame();
	const {isRendering} = useRemotionEnvironment();
	return (
		<HtmlInCanvasMotionBlur
			name="Motion blur during vertical pane transitions"
			width={640}
			height={1080}
			shutterAngle={isRendering ? 180 : 90}
			samples={isRendering ? 32 : 4}
			disabled={
				![
					[80, 92],
					[119, 131],
					[208, 220],
					[235, 247],
				].some(([start, end]) => frame >= start && frame <= end)
			}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					width: 640,
					height: 1080,
					overflow: 'hidden',
					clipPath: 'inset(0)',
				}}
			>
				{children}
			</div>
		</HtmlInCanvasMotionBlur>
	);
};

const AngledPaneContent = ({
	children,
	code,
}: {
	readonly children: ReactNode;
	readonly code: boolean;
}) => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				width: 640,
				height: 1080,
				overflow: 'hidden',
				clipPath: 'inset(0)',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					rotate: EXPLORE_CAMERA_ANGLE,
					transformOrigin: 'top left',
					scale: 1.16,
					translate: '8px 25px',
				}}
			>
				{code ? (
					<div
						style={{
							position: 'absolute',
							top: 110,
							left: 0,
							width: 640,
							height: 1080,
							clipPath: 'inset(64px 0 0)',
							translate: '0 -64px',
							scale: 1.5,
							transformOrigin: '0 64px',
						}}
					>
						{children}
					</div>
				) : (
					children
				)}
			</div>
		</div>
	);
};

const ThreeWaysSplitViewContent = () => {
	return (
		<>
			<Interactive.Div
				name="Left pane — agentically"
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 640,
					height: 1080,
					backgroundColor: '#171717',
					overflow: 'hidden',
					clipPath: 'inset(0)',
					contain: 'paint',
				}}
			>
				<PaneMotionBlur>
					<TransitionSeries name="Agent instructions">
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Ask the agent to add content"
							durationInFrames={92}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code={false}>
								<CodexPrompt
									name="Ask the agent to add content"
									prompt="Add the following element: https://www.remotion.dev/elements/backgrounds/rotating-starburst/"
									typingStartFrame={0}
									typingDurationInFrames={40}
									style={{
										position: 'absolute',
										left: -55,
										top: 315,
										scale: 2.2,
										transformOrigin: 'top left',
									}}
								/>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition
							presentation={slide({direction: 'from-bottom'})}
							timing={linearTiming({
								durationInFrames: 12,
								easing: Easing.bezier(0.4, 0, 0.2, 1),
							})}
						/>
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Ask the agent to remove silence"
							durationInFrames={51}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code={false}>
								<CodexPrompt
									name="Ask the agent to remove silence"
									prompt="Cut away the silent parts."
									typingStartFrame={6}
									typingDurationInFrames={18}
									style={{
										position: 'absolute',
										left: -55,
										top: 315,
										scale: 2.2,
										transformOrigin: 'top left',
									}}
								/>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition
							presentation={slide({direction: 'from-bottom'})}
							timing={linearTiming({
								durationInFrames: 12,
								easing: Easing.bezier(0.4, 0, 0.2, 1),
							})}
						/>
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Ask the agent to add captions"
							durationInFrames={101}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code={false}>
								<CodexPrompt
									name="Ask the agent to add captions"
									prompt="$remotion-captions Add captions and move them up."
									typingStartFrame={6}
									typingDurationInFrames={42}
									style={{
										position: 'absolute',
										left: -55,
										top: 315,
										scale: 2.2,
										transformOrigin: 'top left',
									}}
								/>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition
							presentation={slide({direction: 'from-bottom'})}
							timing={linearTiming({
								durationInFrames: 12,
								easing: Easing.bezier(0.4, 0, 0.2, 1),
							})}
						/>
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Ask the agent to export"
							durationInFrames={39}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code={false}>
								<CodexPrompt
									name="Ask the agent to export"
									prompt="Render this video as an MP4."
									typingStartFrame={6}
									typingDurationInFrames={12}
									style={{
										position: 'absolute',
										left: -55,
										top: 315,
										scale: 2.2,
										transformOrigin: 'top left',
									}}
								/>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition
							presentation={slide({direction: 'from-bottom'})}
							timing={linearTiming({
								durationInFrames: 12,
								easing: Easing.bezier(0.4, 0, 0.2, 1),
							})}
						/>
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Ask the agent to change settings"
							durationInFrames={168}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code={false}>
								<CodexPrompt
									name="Ask the agent to change settings"
									prompt="From now on, export videos with higher quality by default."
									typingStartFrame={6}
									typingDurationInFrames={40}
									style={{
										position: 'absolute',
										left: -55,
										top: 315,
										scale: 2.2,
										transformOrigin: 'top left',
									}}
								/>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
					</TransitionSeries>
				</PaneMotionBlur>
			</Interactive.Div>
			<Interactive.Div
				name="Middle pane — interactively"
				style={{
					position: 'absolute',
					left: 640,
					top: 0,
					width: 640,
					height: 1080,
					backgroundColor: '#1f2427',
					overflow: 'hidden',
					clipPath: 'inset(0)',
					contain: 'paint',
				}}
			>
				<PaneMotionBlur>
					<TransitionSeries name="Studio demonstrations">
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Add a rotating background"
							durationInFrames={92}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code={false}>
								<div
									style={{
										position: 'absolute',
										left: -393,
										top: 134,
										width: 2402,
										height: 1600,
										scale: 0.5,
										transformOrigin: 'top left',
									}}
								>
									<Track name="Element drop and result">
										<Sequence
											name="Drag the starburst onto the canvas"
											from={0}
											durationInFrames={40}
											trimBefore={50}
											layout="none"
										>
											<ExploreElementsRecording20261027Composition
												cursorFrame={null}
												showDragPreview
											/>
										</Sequence>
										<Sequence
											name="Installed rotating starburst"
											from={40}
											durationInFrames={52}
											trimBefore={180}
											freeze={180}
											layout="none"
										>
											<ExploreElementsRecording20261027Composition
												cursorFrame={182}
												showDragPreview={false}
											/>
										</Sequence>
									</Track>
								</div>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition
							presentation={slide({direction: 'from-top'})}
							timing={linearTiming({
								durationInFrames: 12,
								easing: Easing.bezier(0.4, 0, 0.2, 1),
							})}
						/>
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Trim the clip in Studio"
							durationInFrames={51}
							trimBefore={114}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code={false}>
								<div
									style={{
										position: 'absolute',
										left: -680,
										top: 140,
										width: 1894,
										height: 1118,
										scale: 0.9,
										transformOrigin: 'top left',
									}}
								>
									<TimelineRightTrimCapture />
								</div>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition
							presentation={slide({direction: 'from-top'})}
							timing={linearTiming({
								durationInFrames: 12,
								easing: Easing.bezier(0.4, 0, 0.2, 1),
							})}
						/>
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Move captions in Studio"
							durationInFrames={101}
							trimBefore={12}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code={false}>
								<TimelineCaptionReorderAndScrubComposition
									style={{
										position: 'absolute',
										left: -2100,
										top: -115,
										width: 2084,
										height: 1440,
										scale: 1.25,
										transformOrigin: 'top left',
									}}
								/>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition
							presentation={slide({direction: 'from-top'})}
							timing={linearTiming({
								durationInFrames: 12,
								easing: Easing.bezier(0.4, 0, 0.2, 1),
							})}
						/>
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Export from Studio"
							durationInFrames={39}
							trimBefore={354}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code={false}>
								<div
									style={{
										position: 'absolute',
										left: -820,
										top: -245,
										width: 2736,
										height: 1976,
										scale: 0.6,
										transformOrigin: 'top left',
									}}
								>
									<StudioRenderClickCapture pressIn />
								</div>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition
							presentation={slide({direction: 'from-top'})}
							timing={linearTiming({
								durationInFrames: 12,
								easing: Easing.bezier(0.4, 0, 0.2, 1),
							})}
						/>
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Change Studio settings"
							durationInFrames={252}
							trimBefore={66}
							playbackRate={1.5}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code={false}>
								<div
									style={{
										position: 'absolute',
										left: -160,
										top: -190,
										width: 2830,
										height: 1986,
										scale: 0.68,
										transformOrigin: 'top left',
									}}
								>
									<StudioSettingsCaptureComposition
										name="Recorded Studio settings"
										durationInFrames={358}
									/>
								</div>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
					</TransitionSeries>
				</PaneMotionBlur>
			</Interactive.Div>
			<Interactive.Div
				name="Right pane — code"
				style={{
					position: 'absolute',
					left: 1280,
					top: 0,
					width: 640,
					height: 1080,
					backgroundColor: '#131414',
					overflow: 'hidden',
					clipPath: 'inset(0)',
					contain: 'paint',
				}}
			>
				<PaneMotionBlur>
					<TransitionSeries name="Monaco code screenshots">
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Adding content — rotating-starburst.element.tsx"
							durationInFrames={92}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code>
								<CanvasImage
									width={1920}
									height={3240}
									name="Adding content — rotating-starburst.element.tsx"
									src="https://remotion.media/three-ways-code/content-starburst-2026-11-04-192e4b033c77.png"
									style={{width: 640, height: 1080}}
								/>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition
							presentation={slide({direction: 'from-bottom'})}
							timing={linearTiming({
								durationInFrames: 12,
								easing: Easing.bezier(0.4, 0, 0.2, 1),
							})}
						/>
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Editing — RideMontage.tsx"
							durationInFrames={51}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code>
								<CanvasImage
									width={1920}
									height={3240}
									name="Editing — RideMontage.tsx"
									src="https://remotion.media/three-ways-code/editing-video-trims-2026-11-04-6abe0c641af0.png"
									style={{width: 640, height: 1080}}
								/>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition
							presentation={slide({direction: 'from-bottom'})}
							timing={linearTiming({
								durationInFrames: 12,
								easing: Easing.bezier(0.4, 0, 0.2, 1),
							})}
						/>
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Captions — AgenticallyProgrammatically.tsx"
							durationInFrames={101}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code>
								<CanvasImage
									width={1920}
									height={3240}
									name="Captions — AgenticallyProgrammatically.tsx"
									src="https://remotion.media/three-ways-code/captions-dark-plus-prettier-2026-11-04-80c9a3b5d65e.png"
									style={{width: 640, height: 1080}}
								/>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition
							presentation={slide({direction: 'from-bottom'})}
							timing={linearTiming({
								durationInFrames: 12,
								easing: Easing.bezier(0.4, 0, 0.2, 1),
							})}
						/>
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Exporting — bundle and render"
							durationInFrames={39}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code>
								<CanvasImage
									width={1920}
									height={3240}
									name="Exporting — bundle and render"
									src="https://remotion.media/three-ways-code/exporting-bundle-2026-11-04-03c897301cbe.png"
									style={{width: 640, height: 1080}}
								/>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition
							presentation={slide({direction: 'from-bottom'})}
							timing={linearTiming({
								durationInFrames: 12,
								easing: Easing.bezier(0.4, 0, 0.2, 1),
							})}
						/>
						<TransitionSeries.Sequence
							width={640}
							height={1080}
							name="Settings — remotion.config.ts"
							durationInFrames={168}
							style={{overflow: 'hidden', clipPath: 'inset(0)'}}
						>
							<AngledPaneContent code>
								<CanvasImage
									width={1920}
									height={3240}
									name="Settings — remotion.config.ts"
									src="https://remotion.media/three-ways-code/settings-dark-plus-prettier-2026-11-04-83df154b5ada.png"
									style={{width: 640, height: 1080}}
								/>
							</AngledPaneContent>
						</TransitionSeries.Sequence>
					</TransitionSeries>
				</PaneMotionBlur>
			</Interactive.Div>
			<Interactive.Div
				name="ChatGPT pane icon"
				style={{position: 'absolute', left: 32, top: 32, width: 80, height: 80}}
			>
				<svg
					width="80"
					height="80"
					viewBox="0 0 24 24"
					fill="white"
					fillRule="evenodd"
				>
					<path d="M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.87 4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z" />
				</svg>
			</Interactive.Div>
			<Interactive.Div
				name="Remotion pane icon"
				style={{
					position: 'absolute',
					left: 672,
					top: 32,
					width: 80,
					height: 80,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Img
					src="https://remotion.media/agentically-programmatically/remotion-single-triangle-a67dbd2e9855.svg"
					style={{width: 76, height: 78}}
				/>
			</Interactive.Div>
			<Interactive.Div
				name="VS Code pane icon"
				style={{
					position: 'absolute',
					left: 1312,
					top: 32,
					width: 80,
					height: 80,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<StudioInternals.EditorIcon editorId="vscode" size={110} />
			</Interactive.Div>
			<Interactive.Div
				name="Agent and Studio divider"
				style={{
					position: 'absolute',
					left: 639,
					top: 0,
					width: 2,
					height: 1080,
					backgroundColor: 'black',
				}}
			/>
			<Interactive.Div
				name="Studio and code divider"
				style={{
					position: 'absolute',
					left: 1279,
					top: 0,
					width: 2,
					height: 1080,
					backgroundColor: 'black',
				}}
			/>
		</>
	);
};

export const ThreeWaysSplitView = Interactive.create({
	Component: ThreeWaysSplitViewContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
