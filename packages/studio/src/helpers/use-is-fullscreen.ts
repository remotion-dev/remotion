import {useEffect, useState} from 'react';

const getIsFullscreen = () => {
	return Boolean(
		document.fullscreenElement ??
		(document as Document & {webkitFullscreenElement?: Element | null})
			.webkitFullscreenElement,
	);
};

export const useIsFullscreen = () => {
	const [isFullscreen, setIsFullscreen] = useState(getIsFullscreen);

	useEffect(() => {
		const onFullscreenChange = () => {
			setIsFullscreen(getIsFullscreen());
		};

		document.addEventListener('fullscreenchange', onFullscreenChange);
		document.addEventListener('webkitfullscreenchange', onFullscreenChange);
		return () => {
			document.removeEventListener('fullscreenchange', onFullscreenChange);
			document.removeEventListener(
				'webkitfullscreenchange',
				onFullscreenChange,
			);
		};
	}, []);

	return isFullscreen;
};
