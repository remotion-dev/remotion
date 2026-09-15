import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {MacBookScreen} from '../WebMCPPromo/MacBookScene';
import {Codex} from './Codex';
import {StudioReference} from './Studio';
import {TextEditor} from './TextEditor';

export const StudioCodeHandoff: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: '#ffffff'}}>
			<Interactive.Div
				name="Device frame"
				style={{
					height: 936,
					left: 142,
					position: 'absolute',
					top: 72,
					width: 1636,
				}}
			>
				<MacBookScreen
					height={936}
					left={0}
					showCameraNotch={false}
					top={0}
					width={1636}
				>
					<Interactive.Div
						name="Screen viewport"
						style={{
							backgroundColor: '#101114',
							borderRadius: 19,
							height: 900,
							left: 18,
							overflow: 'hidden',
							position: 'absolute',
							top: 18,
							width: 1600,
						}}
					>
						<Interactive.Div
							name="VS Code"
							style={{
								height: 900,
								left: 0,
								overflow: 'hidden',
								position: 'absolute',
								top: 0,
								translate: interpolate(
									frame,
									[60, 100],
									['800px 0px', '1600px 0px'],
									{
										easing: Easing.bezier(0.16, 1, 0.3, 1),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
								width: 800,
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
								height={900}
								highlightedLines="14-18"
								width={800}
							/>
						</Interactive.Div>

						<Interactive.Div
							name="Codex"
							style={{
								backgroundColor: '#f4f4f2',
								height: 900,
								left: 0,
								overflow: 'hidden',
								position: 'absolute',
								top: 0,
								translate: interpolate(
									frame,
									[60, 100, 140, 180],
									['-800px 0px', '0px 0px', '0px 0px', '-800px 0px'],
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
								width: 800,
							}}
						>
							<div
								style={{
									height: 1040,
									left: 0,
									position: 'absolute',
									scale: 800 / 1193,
									top: (900 - (1040 * 800) / 1193) / 2,
									transformOrigin: '0 0',
									width: 1193,
								}}
							>
								<Codex />
							</div>
						</Interactive.Div>

						<Interactive.Div
							name="Remotion Studio"
							style={{
								height: 900,
								left: 0,
								overflow: 'hidden',
								position: 'absolute',
								top: 0,
								translate: interpolate(
									frame,
									[60, 100, 140, 180],
									['0px 0px', '800px 0px', '800px 0px', '0px 0px'],
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
								width: interpolate(frame, [140, 180], [800, 1600], {
									easing: Easing.bezier(0.16, 1, 0.3, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
								zIndex: 1,
							}}
						>
							<div
								style={{
									height: 1080,
									left: 0,
									position: 'absolute',
									scale: 5 / 6,
									top: 0,
									transformOrigin: '0 0',
									width: 1920,
								}}
							>
								<StudioReference
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
									viewportWidth={interpolate(
										frame,
										[140, 180],
										[960, 1920],
										{
											easing: Easing.bezier(0.16, 1, 0.3, 1),
											extrapolateLeft: 'clamp',
											extrapolateRight: 'clamp',
										},
									)}
								/>
							</div>
						</Interactive.Div>
					</Interactive.Div>
				</MacBookScreen>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
