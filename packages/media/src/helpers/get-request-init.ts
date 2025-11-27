export const getRequestInit = ({
	crossOrigin,
}: {
	crossOrigin?: '' | 'anonymous' | 'use-credentials';
}): RequestInit | undefined => {
	if (crossOrigin === '' || crossOrigin === undefined) {
		return undefined;
	}

	if (crossOrigin === 'use-credentials') {
		return {
			mode: 'cors',
			credentials: 'include',
		};
	}

	return {
		mode: 'cors',
		credentials: 'omit',
	};
};
