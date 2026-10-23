import {
	AbsoluteFill,
	Easing,
	Interactive,
	Img,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {MacBookScreen} from '../WebMCPPromo/MacBookScene';
import {Codex} from './Codex';
import {Studio} from './Studio';
import {TextEditor} from './TextEditor';
import {whatsNewTimeline} from './WhatsNewTimeline';

const windowBorderRadius = 6;
// Match the one-pixel border in VS Code's 720px reference layout.
const windowOutline = {
	border: `${667 / 720}px solid #454545`,
	borderRadius: windowBorderRadius,
	boxSizing: 'border-box',
	inset: 0,
	pointerEvents: 'none',
	position: 'absolute',
	zIndex: 2,
} as const;
const screenInset = 6;
const deviceBezel = 18;
const transitionEasing = Easing.bezier(0.42, 0, 0.58, 1);

export const StudioCodeHandoff: React.FC = () => {
	const frame = useCurrentFrame();
	const studioLeft = interpolate(
		frame,
		[165, 225, 270, 330],
		[6, 679, 679, 6],
		{
			easing: [transitionEasing, Easing.linear, transitionEasing],
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);
	const responsivenessProgress = interpolate(
		frame,
		[60, 120, 165, 225],
		[1, 0, 0, 1],
		{
			easing: [transitionEasing, Easing.linear, transitionEasing],
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);
	const studioWidth = 1340 - 673 * responsivenessProgress;

	return (
		<AbsoluteFill>
			<Interactive.Div
				name="Device frame"
				style={{
					height: 796,
					left: 69.5,
					position: 'absolute',
					scale: 1.35,
					top: -17.5,
					width: 1388,
					translate: '173.5px 240.2px',
					transformOrigin: '50% 80%',
				}}
			>
				<MacBookScreen
					borderRadius={windowBorderRadius + screenInset + deviceBezel}
					height={796}
					left={0}
					showCameraNotch={false}
					showShadow={false}
					top={0}
					width={1388}
				>
					<Interactive.Div
						name="Screen viewport"
						style={{
							backgroundColor: 'transparent',
							borderRadius: windowBorderRadius + screenInset,
							height: 760,
							left: 18,
							overflow: 'hidden',
							position: 'absolute',
							top: 18,
							width: 1352,
						}}
					>
						<Interactive.Div
							name="VS Code"
							style={{
								borderRadius: windowBorderRadius,
								height: 748,
								left: 0,
								overflow: 'hidden',
								position: 'absolute',
								top: 6,
								translate: interpolate(
									frame,
									[60, 120, 270, 330],
									['679px 0px', '1358px 0px', '1358px 0px', '679px 0px'],
									{
										easing: [transitionEasing, Easing.linear, transitionEasing],
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
								width: 667,
							}}
						>
							<TextEditor
								borderRadius={windowBorderRadius}
								code={`import {Audio} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {IntroScene} from './scenes/Intro';
import {LightLeaksScene} from './scenes/LightLeaks';
import {OutroScene} from './scenes/Outro';

export const WhatsNew = () => {
  return (
    <>
      <TransitionSeries name="Chapters">
        <TransitionSeries.Sequence
          name="Intro"
          durationInFrames={250}
        >
          <IntroScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence
          name="Light leaks"
          durationInFrames={864}
        >
          <LightLeaksScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence
          name="Outro"
          durationInFrames={180}
        >
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio name="Score" src="score.wav" />
    </>
  );
};`}
								fileName="WhatsNew.tsx"
								height={748}
								highlightedLines=""
								width={667}
							/>
						</Interactive.Div>

						<Interactive.Div
							name="Codex"
							style={{
								borderRadius: windowBorderRadius,
								height: 748,
								left: 0,
								overflow: 'hidden',
								position: 'absolute',
								top: 6,
								translate: interpolate(
									frame,
									[165, 225, 270, 330],
									['-667px 0px', '6px 0px', '6px 0px', '-667px 0px'],
									{
										easing: [transitionEasing, Easing.linear, transitionEasing],
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
								width: 667,
							}}
						>
							<Codex
								borderRadius={windowBorderRadius}
								height={748}
								width={667}
							/>
							<Interactive.Div name="Window border" style={windowOutline} />
						</Interactive.Div>

						<Interactive.Div
							name="Remotion Studio"
							style={{
								borderRadius: windowBorderRadius,
								height: 748,
								left: 0,
								overflow: 'hidden',
								position: 'absolute',
								top: 6,
								translate: `${studioLeft}px 0px`,
								width: studioWidth,
								zIndex: 1,
							}}
						>
							<Studio
								compositionHeight={1080}
								compositionName="WhatsNew"
								compositionWidth={1920}
								content={
									<Img
										src="https://remotion.media/homepage/studio-endcard-25914e3e08ad.jpg"
										showInTimeline={false}
										style={{width: '100%', height: '100%'}}
									/>
								}
								durationInFrames={1294}
								frame={1234}
								timeline={whatsNewTimeline}
								responsivenessProgress={responsivenessProgress}
								showTimelineZoom={false}
								timelineOffset={0}
								viewportHeight={748}
								viewportWidth={studioWidth}
							/>
							<Interactive.Div name="Window border" style={windowOutline} />
						</Interactive.Div>
					</Interactive.Div>
				</MacBookScreen>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
