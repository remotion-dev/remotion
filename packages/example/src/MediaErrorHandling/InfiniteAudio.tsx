import React from 'react';
import {Html5Audio, staticFile} from 'remotion';

export const InfiniteAudio: React.FC = () => {
	return <Html5Audio loop src={staticFile('infinite-audio.mp3')} />;
};
