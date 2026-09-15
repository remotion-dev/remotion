import {
	AbsoluteFill,
	Easing,
	Interactive,
	Sequence,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {Scene11} from '../announcements/whats-new-in-remotion/Scene11';
import {MacBookScreen} from '../WebMCPPromo/MacBookScene';
import {Codex} from './Codex';
import {Studio} from './Studio';
import {TextEditor} from './TextEditor';

export const StudioCodeHandoff: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: '#ffffff'}}>
			<Interactive.Div
				name="Device frame"
				style={{
					height: 796,
					left: 92.5,
					position: 'absolute',
					scale: 1.25,
					top: 42.5,
					transformOrigin: '0 0',
					width: 1388,
				}}
			>
				<MacBookScreen
					height={796}
					left={0}
					showCameraNotch={false}
					top={0}
					width={1388}
				>
					<Interactive.Div
						name="Screen viewport"
						style={{
							backgroundColor: '#101114',
							borderRadius: 19,
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
								height: 760,
								left: 0,
								overflow: 'hidden',
								position: 'absolute',
								top: 0,
								translate: interpolate(
									frame,
									[60, 100],
									['676px 0px', '1352px 0px'],
									{
										easing: Easing.bezier(0.16, 1, 0.3, 1),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
								width: 676,
							}}
						>
							<TextEditor
								code={`import {Video} from '@remotion/media';
import {interpolate, useVideoConfig} from 'remotion';
import {assetUrl} from './assets';
import {SILENCES} from './Composition';
import {EndCard} from './EndCard';
import {SlideInOverlay, useSlideInProgress} from './SlideInOverlay';

const FILE = 'whats11.mov';

export const Scene11: React.FC = () => {
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);
	const overlayProgress = useSlideInProgress({
		startAt: silence.trailingStart - silence.leadingEnd - 8,
		holdDuration: 9999,
	});
	const videoX = interpolate(overlayProgress, [0, 1], [0, -20]);

	return (
		<>
			<Video
				style={{translate: \`\${videoX}% 0px\`}}
				src={assetUrl(FILE)}
				trimBefore={trimBefore}
				trimAfter={trimAfter}
			/>
			<SlideInOverlay startAt={7} holdDuration={9999}>
				<EndCard platform="youtube" />
			</SlideInOverlay>
		</>
	);
};`}
								fileName="Scene11.tsx"
								height={760}
								highlightedLines="14-18"
								width={676}
							/>
						</Interactive.Div>

						<Interactive.Div
							name="Codex"
							style={{
								backgroundColor: '#f4f4f2',
								height: 760,
								left: 0,
								overflow: 'hidden',
								position: 'absolute',
								top: 0,
								translate: interpolate(
									frame,
									[60, 100, 140, 180],
									['-676px 0px', '0px 0px', '0px 0px', '-676px 0px'],
									{
										easing: [
											Easing.bezier(0.16, 1, 0.3, 1),
											Easing.linear,
											Easing.bezier(0.16, 1, 0.3, 1),
										],
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
								width: 676,
							}}
						>
							<Codex height={760} width={676} />
						</Interactive.Div>

						<Interactive.Div
							name="Remotion Studio"
							style={{
								height: 760,
								left: 0,
								overflow: 'hidden',
								position: 'absolute',
								top: 0,
								translate: interpolate(
									frame,
									[60, 100, 140, 180],
									['0px 0px', '676px 0px', '676px 0px', '0px 0px'],
									{
										easing: [
											Easing.bezier(0.16, 1, 0.3, 1),
											Easing.linear,
											Easing.bezier(0.16, 1, 0.3, 1),
										],
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
								width: interpolate(frame, [140, 180], [676, 1352], {
									easing: Easing.bezier(0.16, 1, 0.3, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
								zIndex: 1,
							}}
						>
							<Studio
								compositionHeight={1080}
								compositionName="Chapter11-Outro"
								compositionWidth={1920}
								content={
									<Sequence from={-416} layout="none">
										{/* Show Studio frame 655 within this 240-frame composition. */}
										<Scene11 platform="youtube" />
									</Sequence>
								}
								durationInFrames={742}
								frame={655}
								responsivenessProgress={interpolate(
									frame,
									[140, 180],
									[1, 0],
									{
										easing: Easing.bezier(0.16, 1, 0.3, 1),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								)}
								viewportHeight={760}
								viewportWidth={interpolate(
									frame,
									[140, 180],
									[676, 1352],
									{
										easing: Easing.bezier(0.16, 1, 0.3, 1),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								)}
							/>
						</Interactive.Div>
					</Interactive.Div>
				</MacBookScreen>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
