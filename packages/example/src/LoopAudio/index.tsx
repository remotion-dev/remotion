import React from 'react';
import {Audio, staticFile} from 'remotion';

const LoopedAudio: React.FC = () => {
	return <Audio loop src={staticFile('22khz.wav')} />;
};

export default LoopedAudio;
