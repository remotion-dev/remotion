import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {Video} from '@remotion/media';
import {
	Easing,
	HtmlInCanvas,
	Interactive,
	interpolate,
	Track,
	useCurrentFrame,
} from 'remotion';

const AnnotateChatGPTBrollContent = () => {
	const frame = useCurrentFrame();

	return (
		<HtmlInCanvas
			name="Annotate with ChatGPT close-up"
			width={1920}
			height={1080}
			style={{backgroundColor: '#1f2427'}}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.88],
					end: [0.5, 1],
					endBlur: 3,
				}),
			]}
		>
			<Interactive.Div
				name="Push in from the context menu to the annotation prompt"
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: 1006,
					height: 1128,
					translate: interpolate(
						frame,
						[52, 114],
						['-400px -355px', '-400px -285px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.42, 0, 0.58, 1),
						},
					),
					transformOrigin: interpolate(
						frame,
						[52, 114],
						['400px 355px', '400px 285px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.42, 0, 0.58, 1),
						},
					),
					scale: interpolate(frame, [52, 114], [2.1, 3.1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						output: 'perceptual-scale',
					}),
				}}
			>
				<Track name="Recorded ChatGPT annotation flow">
					<Video
						name="Right-click and choose Annotate with ChatGPT"
						src="https://remotion.media/agentically-programmatically/annotate-with-chatgpt-3ca4811861b7.mov"
						trimBefore={48}
						durationInFrames={60}
						playbackRate={60 / 90}
						muted
						style={{position: 'absolute', width: 1006, height: 1128}}
					/>
					<Video
						name="Describe the color correction in the annotation"
						src="https://remotion.media/agentically-programmatically/annotate-with-chatgpt-3ca4811861b7.mov"
						from={90}
						trimBefore={108}
						durationInFrames={213}
						playbackRate={213 / 97}
						muted
						style={{position: 'absolute', width: 1006, height: 1128}}
					/>
				</Track>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

export const AnnotateChatGPTBroll = Interactive.create({
	Component: AnnotateChatGPTBrollContent,
	layout: 'absolute-fill',
	schema: {},
});
