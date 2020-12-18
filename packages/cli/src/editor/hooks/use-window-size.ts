import {useEffect, useState} from 'react';

export const useWindowSize = () => {
	const [windowSize, setWindowSize] = useState({
		width: window.outerWidth,
		height: window.outerHeight,
	});

	useEffect(() => {
		function handleResize() {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}

		handleResize();

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return windowSize;
};
