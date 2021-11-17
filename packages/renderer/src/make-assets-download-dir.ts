import path from 'path';
import fs from 'fs';
import os from 'os';

export const makeAssetsDownloadTmpDir = (): Promise<string> => {
	return fs.promises.mkdtemp(path.join(os.tmpdir(), 'remotion-assets-dir'));
};
