type UrlHandling = 'browser-studio' | 'query-string' | 'spa';

const getUrlHandlingType = (): UrlHandling => {
	if (window.remotion_browserStudio) {
		return 'browser-studio';
	}

	if (window.remotion_isReadOnlyStudio) {
		return 'query-string';
	}

	return 'spa';
};

export const getNavigationWindow = () => {
	if (window.remotion_browserStudio && window.parent !== window) {
		return window.parent;
	}

	return window;
};

export const getUrlForRoute = (route: string) => {
	if (getUrlHandlingType() === 'browser-studio') {
		const navigationWindow = getNavigationWindow();
		const currentSearch = navigationWindow.location.search.substring(1);
		const firstSeparator = currentSearch.indexOf('&');
		const hostSearch = currentSearch.startsWith('/')
			? firstSeparator === -1
				? ''
				: currentSearch.substring(firstSeparator + 1)
			: currentSearch;
		return `${navigationWindow.location.pathname}?${route}${hostSearch ? `&${hostSearch}` : ''}`;
	}

	if (getUrlHandlingType() === 'query-string') {
		return `${getNavigationWindow().location.pathname}?${route}`;
	}

	return route;
};

export const pushUrl = (url: string) => {
	getNavigationWindow().history.pushState({}, 'Studio', getUrlForRoute(url));
};

export const replaceUrl = (url: string) => {
	getNavigationWindow().history.replaceState({}, 'Studio', getUrlForRoute(url));
};

export const clearUrl = () => {
	window.location.href = window.location.pathname;
};

export const reloadUrl = () => {
	window.location.reload();
};

export const getRoute = () => {
	if (getUrlHandlingType() === 'browser-studio') {
		const search = getNavigationWindow().location.search.substring(1);
		const firstSeparator = search.indexOf('&');
		const route =
			firstSeparator === -1 ? search : search.substring(0, firstSeparator);
		return route.startsWith('/') ? route : '';
	}

	if (getUrlHandlingType() === 'query-string') {
		const route = getNavigationWindow().location.search.substring(1);
		return route.startsWith('/') ? route : '';
	}

	return window.location.pathname;
};
