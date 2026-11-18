import {
	Easing,
	Freeze,
	HtmlInCanvas,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {RestructureAgentCaptureComposition} from './RestructureAgentCaptureComposition';

const ComputedValueBrollContent = ({
	mode,
}: {
	readonly mode: 'explanation' | 'prompt';
}) => {
	const frame = useCurrentFrame();
	return (
		<HtmlInCanvas
			name="Computed expression and suggested prompt"
			width={1920}
			height={1080}
			style={{backgroundColor: '#1f2427'}}
		>
			<Interactive.Div
				name="Move from the expression to its suggested prompt"
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: 1694,
					height: 1440,
					translate:
						mode === 'prompt'
							? '-900px -1030px'
							: interpolate(
									frame,
									[55, 85, 165, 205],
									[
										'-900px -742px',
										'-900px -650px',
										'-900px -650px',
										'-900px -1030px',
									],
									{
										easing: Easing.bezier(0.42, 0, 0.58, 1),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
					transformOrigin:
						mode === 'prompt'
							? '900px 1030px'
							: interpolate(
									frame,
									[55, 85, 165, 205],
									['900px 742px', '900px 650px', '900px 650px', '900px 1030px'],
									{
										easing: Easing.bezier(0.42, 0, 0.58, 1),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
					scale:
						mode === 'prompt'
							? 1.65
							: interpolate(frame, [55, 85], [1.06, 1.65], {
									easing: Easing.bezier(0.42, 0, 0.58, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
									output: 'perceptual-scale',
								}),
				}}
			>
				<Freeze frame={90}>
					<RestructureAgentCaptureComposition showCursor />
				</Freeze>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

export const ComputedValueBroll = Interactive.create({
	Component: ComputedValueBrollContent,
	layout: 'absolute-fill',
	schema: {
		mode: {
			type: 'enum',
			default: 'explanation',
			variants: {explanation: {}, prompt: {}},
			description: 'Focus',
			keyframable: false,
		},
	},
});
