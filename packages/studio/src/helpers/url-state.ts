type UrlHandling = 'spa' | 'query-string';

const getUrlHandlingType = (): UrlHandling => {
	if (window.process.env.NODE_ENV === 'production') {
		return 'query-string';
	}

	return 'spa';
};

export const pushUrl = (url: string) => {
	if (getUrlHandlingType() === 'query-string') {
		window.history.pushState(
			{},
			'Studio',
			`${window.location.pathname}?${url}`,
		);
	} else {
		window.history.pushState({}, 'Studio', url);
	}
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
