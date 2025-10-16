import {Video} from '@remotion/media';
import {Player} from '@remotion/player';
import React from 'react';

const NewVideoTag: React.FC = () => {
	return <Video src={'https://remotion.media/video.mp4'} />;
};

export default () => {
	return (
		<Player
			component={NewVideoTag}
			compositionHeight={1080}
			compositionWidth={1920}
			fps={30}
			durationInFrames={30}
		/>
	);
};
