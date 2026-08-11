import {Html5Audio, staticFile} from 'remotion';

export const HandleAudioRenderError = () => {
	return <Html5Audio src={staticFile('balloons.json')} />;
};
