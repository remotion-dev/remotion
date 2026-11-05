import {Video} from '@remotion/media';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

const CodexDropSidebarContent = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Codex footage drop panel"
			style={{
				position: 'absolute',
				right: 0,
				top: 0,
				width: 840,
				height: '100%',
				overflow: 'hidden',
				zIndex: 1,
				opacity: interpolate(frame, [0, 18], [0, 1], {
					easing: Easing.bezier(0.42, 0, 0.58, 1),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			}}
		>
			<Video
				name="Drop raw camera footage into Codex"
				src="https://remotion.media/agentically-programmatically/codex-footage-drop-seamless-bottom-a93f3babea26.webm"
				muted
				playbackRate={1}
				durationInFrames={126}
				style={{
					position: 'absolute',
					left: -40,
					top: 0,
					width: 1260,
					height: 1080,
					transformOrigin: '104px 680px',
					scale: interpolate(frame, [60, 112], [1, 1.35], {
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			/>
		</Interactive.Div>
	);
};

export const CodexDropSidebar = Interactive.create({
	Component: CodexDropSidebarContent,
	layout: 'absolute-fill',
	schema: {},
});
