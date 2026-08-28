type UrlHandling = 'query-string' | 'spa';

const getUrlHandlingType = (): UrlHandling => {
	if (window.remotion_isReadOnlyStudio || window.remotion_browserStudio) {
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
	if (getUrlHandlingType() === 'query-string') {
		const route = getNavigationWindow().location.search.substring(1);
		return route.startsWith('/') ? route : '';
	}

	return window.location.pathname;
};
