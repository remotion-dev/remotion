import {useEffect, useState} from 'react';

const query = '(min-width: 1024px)';

export function useIsNarrow() {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia(query);
		setMatches(mediaQuery.matches);
		const handler = (event: MediaQueryListEvent) => {
			return setMatches(event.matches);
		};
		mediaQuery.addEventListener('change', handler);
		return () => mediaQuery.removeEventListener('change', handler);
	}, []);

	return !matches;
}
