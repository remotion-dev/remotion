import React from 'react';
import {Audio, staticFile} from 'remotion';

const LoopedTrimmedAudio: React.FC = () => {
	return (
		<Audio
			loop
			src={staticFile('music.mp3')}
			startFrom={125}
			endAt={370}
			volume={(v) => v}
		/>
	);
};

export default LoopedTrimmedAudio;
