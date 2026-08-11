import {Audio, staticFile} from 'remotion';

export const Tone = () => {
	return (
		<Audio
			src={staticFile('tone-1k-60s.wav')}
			loop
			volume={(f) => {
				return (Math.sin(f * Math.PI * 2 * 30 * 10) + 1) / 2;
			}}
		/>
	);
};
