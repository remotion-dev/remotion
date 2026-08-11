type UrlHandling = 'spa' | 'query-string';

const getUrlHandlingType = (): UrlHandling => {
	if (window.remotion_isReadOnlyStudio) {
		return 'query-string';
	}

	return 'spa';
};

export const getUrlForRoute = (route: string) => {
	if (getUrlHandlingType() === 'query-string') {
		return `${window.location.pathname}?${route}`;
	}

	return route;
};

export const pushUrl = (url: string) => {
	window.history.pushState({}, 'Studio', getUrlForRoute(url));
};

export const replaceUrl = (url: string) => {
	window.history.replaceState({}, 'Studio', getUrlForRoute(url));
};

export const clearUrl = () => {
	window.location.href = window.location.pathname;
};

export const reloadUrl = () => {
	window.location.reload();
};

export const getRoute = () => {
	if (getUrlHandlingType() === 'query-string') {
		return window.location.search.substring(1);
	}

	return window.location.pathname;
};
