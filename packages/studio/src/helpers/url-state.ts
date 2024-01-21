export const pushUrl = (url: string) => {
	window.history.pushState({}, 'Studio', url);
};

export const clearUrl = () => {
	window.location.href = '/';
};

export const reloadUrl = () => {
	window.location.reload();
};

export const getPathname = () => {
	return window.location.pathname;
};
