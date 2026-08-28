type UrlHandling = 'browser-studio' | 'query-string' | 'spa';

const browserStudioRouteParameter = 'remotion-route';

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
		const searchParams = currentSearch.startsWith('/')
			? new URLSearchParams()
			: new URLSearchParams(currentSearch);
		searchParams.set(browserStudioRouteParameter, route);
		return `${navigationWindow.location.pathname}?${searchParams.toString()}`;
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
		const route = new URLSearchParams(search).get(browserStudioRouteParameter);
		if (route !== null) {
			return route.startsWith('/') ? route : '';
		}

		return search.startsWith('/') ? search : '';
	}

	if (getUrlHandlingType() === 'query-string') {
		const route = getNavigationWindow().location.search.substring(1);
		return route.startsWith('/') ? route : '';
	}

	return window.location.pathname;
};
