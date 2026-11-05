import {Video} from '@remotion/media';
import {
	Easing,
	Freeze,
	HtmlInCanvas,
	Interactive,
	interpolate,
	Sequence,
	Track,
	useCurrentFrame,
} from 'remotion';
import {DoubleClickCodeCaptureComposition} from './DoubleClickCodeCaptureComposition';

const DoubleClickCodeBrollContent = () => {
	const frame = useCurrentFrame();
	return (
		<Track name="Double-click and reveal the source in VS Code">
			<Sequence name="Double-click the timeline item" durationInFrames={48}>
				<HtmlInCanvas
					name="Timeline double-click close-up"
					width={1920}
					height={1080}
					style={{backgroundColor: '#1f2427'}}
				>
					<Interactive.Div
						name="Focus on the clicked timeline item"
						style={{
							position: 'absolute',
							left: '50%',
							top: '50%',
							width: 2004,
							height: 1440,
							translate: '-1048px -590px',
							transformOrigin: '1048px 590px',
							scale: 1.8,
						}}
					>
						<Sequence trimBefore={30} durationInFrames={48} layout="none">
							<DoubleClickCodeCaptureComposition />
						</Sequence>
					</Interactive.Div>
				</HtmlInCanvas>
			</Sequence>
			<Sequence
				name="VS Code opens at the selected source"
				from={48}
				durationInFrames={190}
			>
				<Interactive.Div
					name="VS Code desktop recording"
					style={{
						position: 'absolute',
						inset: 0,
						backgroundColor: '#1f2427',
					}}
				>
					<Interactive.Div
						name="Focus on the VS Code window with surrounding desktop visible"
						style={{
							position: 'absolute',
							left: '50%',
							top: '50%',
							width: 2350,
							height: 1386,
							translate: '-942px -666px',
							transformOrigin: '942px 666px',
							scale: interpolate(frame, [148, 222], [1.02, 1.6], {
								easing: Easing.inOut(Easing.cubic),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								output: 'perceptual-scale',
							}),
						}}
					>
						<Freeze frame={59} active={(captureFrame) => captureFrame >= 59}>
							<Video
								name="VS Code opens, loads the source, then holds"
								src="https://remotion.media/agentically-programmatically/vscode-code-handoff-40df9ee12451.mov"
								trimBefore={261}
								durationInFrames={190}
								muted
								style={{
									position: 'absolute',
									left: 0,
									top: 0,
									width: 2350,
									height: 1386,
								}}
							/>
						</Freeze>
					</Interactive.Div>
				</Interactive.Div>
			</Sequence>
		</Track>
	);
};

export const DoubleClickCodeBroll = Interactive.create({
	Component: DoubleClickCodeBrollContent,
	layout: 'absolute-fill',
	schema: {},
});
