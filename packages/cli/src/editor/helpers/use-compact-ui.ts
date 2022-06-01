import {useEffect, useState} from 'react';

const breakpoint = 1200;

export function useCompactUI(): boolean {
	const [compactUI, setCompactUI] = useState<boolean>(
		window.innerWidth < breakpoint
	);

	useEffect(() => {
		function handleResize() {
			setCompactUI(window.innerWidth < breakpoint);
		}

		window.addEventListener('resize', handleResize);
		handleResize();

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return compactUI;
}
