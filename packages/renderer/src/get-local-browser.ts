import fs from 'fs';

const getSearchPathsForProduct = () => {
	return [];
};

export const getLocalBrowser = () => {
	for (const p of getSearchPathsForProduct()) {
		if (fs.existsSync(p)) {
			return p;
		}
	}

	return null;
};
