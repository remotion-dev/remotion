import {Audio, staticFile} from 'remotion';

const AudioTesting: React.FC = () => {
	return (
		<Audio
			allowAmplificationDuringRender
			src={staticFile('music.mp3')}
			volume={10}
		/>
	);
};

export default AudioTesting;
