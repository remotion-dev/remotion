export const isInsideStudio = (): boolean => {
	if (typeof window === 'undefined') {
		return false;
	}

	if (
		new URLSearchParams(window.location.search).get('remotion-studio') ===
		'true'
	) {
		return true;
	}

	// Client-side navigation may drop the query parameter while the library
	// remains inside the same Studio iframe.
	return window.parent !== window;
};
