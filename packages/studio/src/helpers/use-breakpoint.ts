import {useEffect, useState} from 'react';

export function useBreakpoint(breakpoint: number): boolean {
	const [compactUI, setCompactUI] = useState<boolean>(
		window.innerWidth < breakpoint,
	);

	useEffect(() => {
		function handleResize() {
			setCompactUI(window.innerWidth < breakpoint);
		}

		window.addEventListener('resize', handleResize);
		handleResize();

		return () => window.removeEventListener('resize', handleResize);
	}, [breakpoint]);

	return compactUI;
}
