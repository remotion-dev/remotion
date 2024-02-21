import {getAbsoluteSrc} from '../absolute-src';

export const getOffthreadVideoSource = ({
	src,
	transparent,
	currentTime,
	colorMapped,
}: {
	src: string;
	transparent: boolean;
	currentTime: number;
	colorMapped: boolean;
}) => {
	return `http://localhost:${
		window.remotion_proxyPort
	}/proxy?src=${encodeURIComponent(
		getAbsoluteSrc(src),
	)}&time=${encodeURIComponent(currentTime)}&transparent=${String(
		transparent,
	)}&colorMapped=${String(colorMapped)}`;
};
