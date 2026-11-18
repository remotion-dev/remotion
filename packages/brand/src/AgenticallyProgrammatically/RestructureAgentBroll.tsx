import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {MacOSCursor} from '@remotion/mac-cursors';
import {
	HtmlInCanvas,
	Easing,
	Freeze,
	Interactive,
	interpolate,
	Sequence,
	Track,
	useCurrentFrame,
} from 'remotion';
import {RestructureAgentCaptureComposition} from './RestructureAgentCaptureComposition';

const RestructureAgentBrollContent = () => {
	const frame = useCurrentFrame();

	return (
		<HtmlInCanvas
			name="Fix computed value dialog close-up"
			width={1920}
			height={1080}
			style={{backgroundColor: '#1f2427'}}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.83],
					end: [0.5, 1],
					endBlur: 3,
				}),
			]}
		>
			<Interactive.Div
				name="Follow the narration from ChatGPT to the code editor"
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: 1694,
					height: 1440,
					translate: interpolate(
						frame,
						[132, 160],
						['-1240px -940px', '-1380px -650px'],
						{
							easing: Easing.bezier(0.42, 0, 0.58, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					transformOrigin: interpolate(
						frame,
						[132, 160],
						['1240px 940px', '1380px 650px'],
						{
							easing: Easing.bezier(0.42, 0, 0.58, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					scale: interpolate(frame, [132, 160], [2.4, 2.55], {
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			>
				<Track name="Agent and editor controls">
					<Sequence
						name="Hover ChatGPT while the agent is mentioned"
						durationInFrames={132}
						layout="none"
					>
						<Freeze frame={207}>
							<RestructureAgentCaptureComposition showCursor={false} />
						</Freeze>
					</Sequence>
					<Sequence
						name="Hover and click Open in Code"
						from={132}
						trimBefore={222}
						durationInFrames={116}
						playbackRate={92 / 58}
						layout="none"
					>
						<Freeze frame={270} active={(captureFrame) => captureFrame >= 270}>
							<RestructureAgentCaptureComposition showCursor={false} />
						</Freeze>
					</Sequence>
				</Track>
				<MacOSCursor
					name="Exit right, then enter from the left at Open in Code"
					cursor="default"
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						scale: interpolate(
							frame,
							[181, 184, 187, 191],
							[
								1.9785209396686363, 1.7806688457017728, 1.7806688457017728,
								1.9785209396686363,
							],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						translate:
							frame < 145
								? interpolate(
										frame,
										[112, 130],
										[
											'1233.1518186355804px 954.0412513887323px',
											'2050px 954.0412513887323px',
										],
										{
											easing: Easing.bezier(0.42, 0, 0.58, 1),
											extrapolateLeft: 'clamp',
											extrapolateRight: 'clamp',
										},
									)
								: interpolate(
										frame,
										[145, 164],
										[
											'800px 545.7085352697763px',
											'1251.4067657429919px 545.7085352697763px',
										],
										{
											easing: Easing.bezier(0.42, 0, 0.58, 1),
											extrapolateLeft: 'clamp',
											extrapolateRight: 'clamp',
										},
									),
					}}
				/>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

export const RestructureAgentBroll = Interactive.create({
	Component: RestructureAgentBrollContent,
	layout: 'absolute-fill',
	schema: {},
});
