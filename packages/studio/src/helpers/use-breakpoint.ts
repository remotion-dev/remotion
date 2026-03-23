import {useEffect, useRef, useState} from 'react';

export function useBreakpoint(breakpoint: number): boolean {
	const [compactUI, setCompactUI] = useState<boolean>(
		window.innerWidth < breakpoint,
	);
	const compactUIRef = useRef(compactUI);

	useEffect(() => {
		function handleResize() {
			const newValue = window.innerWidth < breakpoint;
			if (newValue !== compactUIRef.current) {
				setCompactUI(newValue);
			}

			compactUIRef.current = newValue;
		}

		window.addEventListener('resize', handleResize);
		handleResize();

		return () => window.removeEventListener('resize', handleResize);
	}, [breakpoint]);

	return compactUI;
}
