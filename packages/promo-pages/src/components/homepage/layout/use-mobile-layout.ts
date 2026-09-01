import {useEffect, useState} from 'react';

export const useMobileLayout = () => {
	const [mobileLayout, setMobileLayout] = useState(false);

	useEffect(() => {
		const desktopLayout = window.matchMedia('(min-width: 900px)');
		const updateLayout = () => setMobileLayout(!desktopLayout.matches);

		updateLayout();
		desktopLayout.addEventListener('change', updateLayout);

		return () => desktopLayout.removeEventListener('change', updateLayout);
	}, []);

	return mobileLayout;
};
