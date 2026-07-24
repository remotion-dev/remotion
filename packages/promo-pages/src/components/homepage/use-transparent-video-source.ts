import {useState} from 'react';
import {isWebkit} from './IfYouKnowReact';

export const useTransparentVideoSource = ({
	fallbackVideoSrc,
	videoSrc,
}: {
	readonly fallbackVideoSrc: string;
	readonly videoSrc: string;
}) => {
	const [src] = useState(() => (isWebkit() ? fallbackVideoSrc : videoSrc));

	return src;
};
