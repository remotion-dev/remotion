let bundleOutDir: string | null = null;

export const getBundleOutDir = () => {
	return bundleOutDir;
};

export const setBundleOutDir = (path: string) => {
	bundleOutDir = path;
};
