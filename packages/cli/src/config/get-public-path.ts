let publicPath: string | null = null;

export const getPublicPath = () => {
	return publicPath;
};

export const setPublicPath = (path: string) => {
	publicPath = path;
};
