import {getAbsoluteSrc} from '../absolute-src';

export const getOffthreadVideoSource = ({
	src,
	transparent,
	currentTime,
}: {
	src: string;
	transparent: boolean;
	currentTime: number;
}) => {
	return `http://localhost:${
		window.remotion_proxyPort
	}/proxy?src=${encodeURIComponent(
		getAbsoluteSrc(src),
	)}&time=${encodeURIComponent(currentTime)}&transparent=${String(
		transparent,
	)}`;
};
