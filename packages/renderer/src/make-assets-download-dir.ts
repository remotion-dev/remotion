import {tmpDir} from './tmp-dir';

export const makeAssetsDownloadTmpDir = (): string => {
	return tmpDir('remotion-assets-dir');
};
