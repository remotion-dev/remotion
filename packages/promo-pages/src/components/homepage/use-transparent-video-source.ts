import {useEffect, useState} from 'react';
import {isWebkit} from './IfYouKnowReact';

export const useTransparentVideoSource = ({
	fallbackVideoSrc,
	videoSrc,
}: {
	readonly fallbackVideoSrc: string;
	readonly videoSrc: string;
}) => {
	const [src, setSrc] = useState(videoSrc);

	useEffect(() => {
		setSrc(isWebkit() ? fallbackVideoSrc : videoSrc);
	}, [fallbackVideoSrc, videoSrc]);

	return src;
};
