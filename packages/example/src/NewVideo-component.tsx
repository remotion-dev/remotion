import {Video} from '@remotion/media';

const src = 'https://remotion.media/video.mp4';

export const NewVideoComponent = () => {
	return <Video src={src} debugOverlay />;
};
