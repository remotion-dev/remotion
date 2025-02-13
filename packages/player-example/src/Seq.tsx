import React from 'react';
import {
	AbsoluteFill,
	Audio,
	OffthreadVideo,
	Sequence,
	Series,
	useVideoConfig,
} from 'remotion';

export const Seq: React.FC = () => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill>
			<Sequence durationInFrames={2.5 * fps} premountFor={200}>
				<OffthreadVideo
					startFrom={90}
					pauseWhenBuffering
					src="https://dcdcxrdbmv8g5.cloudfront.net/users/af56c439-694a-441a-b366-5ad6c49ed21e/7c8f6190-51a3-41ea-8e0a-31c4fd273f01/piapi-videos/d0b629d6-c937-45f2-8151-8e0e23b4bf8e-1738793275585.mp4?one"
				/>
			</Sequence>
			<Sequence from={2.5 * fps} durationInFrames={2.5 * fps} premountFor={200}>
				<OffthreadVideo
					startFrom={90}
					pauseWhenBuffering
					src="https://dcdcxrdbmv8g5.cloudfront.net/users/af56c439-694a-441a-b366-5ad6c49ed21e/7c8f6190-51a3-41ea-8e0a-31c4fd273f01/piapi-videos/b14f4442-6f87-45cb-a741-066c15adef16-1738790742791.mp4?two"
				/>
			</Sequence>
			<Sequence
				from={2.5 * fps * 2}
				durationInFrames={2.5 * fps}
				premountFor={200}
			>
				<OffthreadVideo
					startFrom={90}
					pauseWhenBuffering
					src="https://dcdcxrdbmv8g5.cloudfront.net/reversed-videos/orVO87ZI77ivuhbISt0YT-reversed-716eed0a-e07e-4b22-bce1-435943d8569b.mp4?three"
				/>
			</Sequence>
			<Sequence
				from={4.26 * fps}
				premountFor={90}
				durationInFrames={5.13 * fps}
			>
				<Audio
					pauseWhenBuffering
					src="https://v3.fal.media/files/zebra/V389M5qsL68pU-dSBipNW_audio.mp3"
				></Audio>
			</Sequence>
			<Series>
				<Series.Sequence premountFor={90} durationInFrames={5.13 * fps}>
					<Audio
						pauseWhenBuffering
						src="https://v3.fal.media/files/zebra/V389M5qsL68pU-dSBipNW_audio.mp3?one"
					></Audio>
				</Series.Sequence>
				<Series.Sequence premountFor={90} durationInFrames={5.13 * fps}>
					<Audio
						pauseWhenBuffering
						src="https://v3.fal.media/files/panda/gC_PMZJy61fg4lNcJNAPU_audio.mp3?two"
					></Audio>
				</Series.Sequence>
				<Series.Sequence premountFor={90} durationInFrames={5.13 * fps}>
					<Audio
						pauseWhenBuffering
						src="https://v3.fal.media/files/penguin/9j-3wda6JtP2NSearEjff_audio.mp3?three"
					></Audio>
				</Series.Sequence>
				<Series.Sequence premountFor={90} durationInFrames={5.13 * fps}>
					<Audio
						pauseWhenBuffering
						src="https://v3.fal.media/files/elephant/vQCD3t20OV2hDJKdecDy0_audio.mp3?four"
					></Audio>
				</Series.Sequence>
			</Series>
			<Sequence from={290} premountFor={90}>
				<Audio
					pauseWhenBuffering
					src="https://v3.fal.media/files/monkey/iIa-0a9u2_g47EIRM6Vs8_audio.mp3?five"
				></Audio>
			</Sequence>
		</AbsoluteFill>
	);
};
