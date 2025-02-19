import React from 'react';
import {Audio, staticFile} from 'remotion';

export const InfiniteAudio: React.FC = () => {
	return <Audio loop src={staticFile('infinite-audio.mp3')} />;
};
