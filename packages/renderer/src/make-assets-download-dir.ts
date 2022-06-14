import {tmpDir} from './tmp-dir';

let dir: string | null = null;

export const makeAssetsDownloadTmpDir = (): string => {
	if (dir) {
		return dir;
	}

	dir = tmpDir('remotion-assets-dir');
	return dir;
};
