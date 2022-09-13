let publicDir: string | null = null;

export const getPublicDir = () => {
	return publicDir;
};

export const setPublicDir = (dir: string) => {
	publicDir = dir;
};
