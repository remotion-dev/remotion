let bundleOutDir: string | null = null;

export const getBundleOutDir = () => {
	return bundleOutDir;
};

export const setBundleDir = (path: string) => {
	bundleOutDir = path;
};
