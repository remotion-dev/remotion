import {useEffect, useRef, useState} from 'react';

const breakpoint = 900;

function getIsMobile() {
	return window.innerWidth < breakpoint;
}

export const useMobileLayout = () => {
	const [isMobile, setIsMobile] = useState(getIsMobile());
	const isMobileRef = useRef(isMobile);

	useEffect(() => {
		function handleResize() {
			if (getIsMobile() !== isMobileRef.current) {
				setIsMobile(getIsMobile());
			}

			isMobileRef.current = getIsMobile();
		}

		window.addEventListener('resize', handleResize);
		return () => {
			return window.removeEventListener('resize', handleResize);
		};
	}, []);

	return isMobile;
};
