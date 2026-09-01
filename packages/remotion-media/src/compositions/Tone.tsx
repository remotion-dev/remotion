import {Audio, staticFile, useVideoConfig} from 'remotion';

export const Tone = () => {
	const {fps} = useVideoConfig();

	return (
		<Audio
			src={staticFile('tone-1k-60s.wav')}
			loop
			allowAmplificationDuringRender
			volume={(f) => {
				return (Math.sin((f / fps) * Math.PI * 2 * 10) + 1) * 8;
			}}
		/>
	);
};
