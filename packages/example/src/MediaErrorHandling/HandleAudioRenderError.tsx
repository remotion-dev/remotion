import {Audio, staticFile} from 'remotion';

export const HandleAudioRenderError = () => {
	return <Audio src={staticFile('balloons.json')} />;
};
