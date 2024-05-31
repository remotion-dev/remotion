import {Audio} from 'remotion';

const ShortAudioLoop: React.FC = () => {
	return (
		<Audio
			loop
			volume={0.1}
			src="https://res.cloudinary.com/thatwas-pro/video/upload/v1700393642/test/8bit_j7ffha.wav"
		/>
	);
};

export default ShortAudioLoop;
