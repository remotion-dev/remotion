import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {
	Easing,
	HtmlInCanvas,
	Interactive,
	interpolate,
	Sequence,
	useCurrentFrame,
} from 'remotion';
import {ChatGPTPluginCaptureComposition} from './ChatGPTPluginCaptureComposition';

const ChatGPTPluginBrollContent = () => {
	const frame = useCurrentFrame();

	return (
		<HtmlInCanvas
			name="ChatGPT plugin page"
			width={1080}
			height={960}
			style={{backgroundColor: '#fafafa'}}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.55],
					end: [0.5, 0.98],
					endBlur: 8,
				}),
			]}
		>
			<Interactive.Div
				name="Pan from Remotion to Try in chat"
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: 3530,
					height: 1758,
					translate: interpolate(
						frame,
						[0, 112],
						['-1780px -600px', '-2720px -450px'],
						{
							easing: Easing.bezier(0.42, 0, 0.58, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					transformOrigin: interpolate(
						frame,
						[0, 112],
						['1780px 600px', '2720px 450px'],
						{
							easing: Easing.bezier(0.42, 0, 0.58, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					rotate: '0.904608 0.351506 -0.241096 27.995464deg',
					scale: 0.85,
				}}
			>
				<Sequence
					name="Recorded ChatGPT plugin page"
					durationInFrames={176}
					playbackRate={0.65}
					layout="none"
				>
					<ChatGPTPluginCaptureComposition />
				</Sequence>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

export const ChatGPTPluginBroll = Interactive.create({
	Component: ChatGPTPluginBrollContent,
	layout: 'absolute-fill',
	schema: {},
});
