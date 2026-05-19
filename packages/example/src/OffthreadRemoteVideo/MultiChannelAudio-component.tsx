import {Html5Audio} from 'remotion';

const src = 'https://remotion.media/multiple-audio-streams.mov';

export const MultiChannelAudioComponent = () => {
	return (
		<>
			<Html5Audio src={src} audioStreamIndex={3} />
		</>
	);
};
