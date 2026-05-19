import {Video} from '@remotion/media';
import {Player} from '@remotion/player';
import React from 'react';

export const NewVideoTag: React.FC = () => {
	return <Video src={'https://remotion.media/video.mp4'} />;
};

export default function Video-ssr() => {
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
