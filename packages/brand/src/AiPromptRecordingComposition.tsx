import {Video} from '@remotion/media';
import {AbsoluteFill} from 'remotion';

export const AiPromptRecordingComposition = () => {
	return (
		<AbsoluteFill
			name="Canvas Capture"
			durationInFrames={748}
			style={{
				width: 1494,
				height: 1440,
			}}
		>
			<Video
				src="https://remotion.media/explore-remotion/ai-prompt-source-2026-10-20-74886aec9d9a.mp4"
				durationInFrames={748}
				style={{
					position: 'absolute',
				}}
			/>
		</AbsoluteFill>
	);
};
