import React from 'react';
import {Html5Audio, staticFile} from 'remotion';

const LoopedAudio: React.FC = () => {
	return <Html5Audio loop src={staticFile('22khz.wav')} />;
};

export default LoopedAudio;
