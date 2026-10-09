import {Audio} from '@remotion/media';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {rollerSkiAsset} from './assets';
import {BasicCaptions} from './basic-captions';

const CommuteMotionGraphicInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{backgroundColor: '#F7F9FC', color: '#14213D'}}
		>
			<Audio
				src={rollerSkiAsset('footage/IMG_0463.MOV')}
				trimBefore={417}
				premountFor={fps}
			/>
			<Interactive.Div
				name="Remotion wordmark"
				style={{
					position: 'absolute',
					left: 142,
					top: 116,
					color: '#1F4FD8',
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 48,
					fontWeight: 800,
					letterSpacing: -2,
					opacity: interpolate(frame, [0, 18], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				Remotion
			</Interactive.Div>
			<div
				style={{
					position: 'absolute',
					left: 142,
					width: 900,
					top: 325,
				}}
			>
				<Interactive.Div
					name="Original tagline"
					style={{
						color: '#14213D',
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 110,
						fontWeight: 800,
						letterSpacing: -5,
						lineHeight: 1.08,
						opacity: interpolate(frame, [10, 30, 142, 159], [0, 1, 1, 0.28], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						translate: interpolate(frame, [10, 30], ['0px 30px', '0px 0px'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					Best place to work
				</Interactive.Div>
				<Interactive.Div
					name="Cross-out"
					style={{
						position: 'absolute',
						left: 0,
						top: 57,
						width: interpolate(frame, [121, 140], ['0%', '100%'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						height: 8,
						borderRadius: 4,
						backgroundColor: '#1F4FD8',
					}}
				/>
			</div>
			<Interactive.Div
				name="New tagline"
				style={{
					position: 'absolute',
					left: 142,
					right: 142,
					top: 540,
					color: '#1F4FD8',
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 110,
					fontWeight: 800,
					letterSpacing: -5,
					lineHeight: 1.08,
					opacity: interpolate(frame, [145, 171], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					translate: interpolate(frame, [145, 171], ['0px 30px', '0px 0px'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				Best commute to work
			</Interactive.Div>
			<BasicCaptions
				name="Best commute voiceover captions"
				captions={[
					{
						text: 'Mountains!',
						startMs: 60,
						endMs: 1100,
						timestampMs: 580,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: 'What more could you want?',
						startMs: 1360,
						endMs: 2380,
						timestampMs: 1870,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: 'The roller skis?',
						startMs: 2580,
						endMs: 4040,
						timestampMs: 3310,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: 'Come on, best commute goes to Jonny, alright?',
						startMs: 4200,
						endMs: 6940,
						timestampMs: 5570,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
				width={1500}
				style={{position: 'absolute', left: 210, bottom: 72}}
			/>
		</AbsoluteFill>
	);
};

export const CommuteMotionGraphic = Interactive.withSchema({
	Component: CommuteMotionGraphicInner,
	componentName: '<CommuteMotionGraphic>',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
