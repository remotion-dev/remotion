import {useEffect, useRef, useState} from 'react';

// hook to hide a popup/modal when clicked outside
export default function useComponentVisible(initialIsVisible: boolean) {
	const [isComponentVisible, setIsComponentVisible] =
		useState(initialIsVisible);

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setIsComponentVisible(false);
			}
		};

		document.addEventListener('pointerup', handleClickOutside, true);
		return () => {
			document.removeEventListener('pointerup', handleClickOutside, true);
		};
	}, []);

	return {ref, isComponentVisible, setIsComponentVisible};
}
