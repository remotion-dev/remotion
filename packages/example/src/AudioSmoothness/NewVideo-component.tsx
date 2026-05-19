import {Video} from '@remotion/media';

const src = 'https://remotion.media/video.mp4';

export const AudioSmoothnessNewVideoComponent: React.FC = () => {
	return <Video src={src} debugOverlay logLevel="verbose" />;
};
