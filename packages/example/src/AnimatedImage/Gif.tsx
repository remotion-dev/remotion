import {AnimatedImage, staticFile} from 'remotion';

export const GifAnimatedImage = () => {
	return <AnimatedImage src={staticFile('giphy.gif')} />;
};
