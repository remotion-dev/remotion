import {Video} from '@remotion/media';
import {staticFile} from 'remotion';

export const UnavailableVideo = () => {
	return (
		<Video
			src={staticFile('missing-video.mp4')}
			style={{width: '100%', height: '100%'}}
		/>
	);
};
