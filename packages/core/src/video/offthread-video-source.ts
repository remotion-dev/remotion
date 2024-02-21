import {getAbsoluteSrc} from '../absolute-src';

export const getOffthreadVideoSource = ({
	src,
	transparent,
	currentTime,
	toneMapped,
}: {
	src: string;
	transparent: boolean;
	currentTime: number;
	toneMapped: boolean;
}) => {
	return `http://localhost:${
		window.remotion_proxyPort
	}/proxy?src=${encodeURIComponent(
		getAbsoluteSrc(src),
	)}&time=${encodeURIComponent(currentTime)}&transparent=${String(
		transparent,
	)}&toneMapped=${String(toneMapped)}`;
};
