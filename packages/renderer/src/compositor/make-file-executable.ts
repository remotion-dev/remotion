/* eslint-disable no-bitwise */
import {accessSync, chmodSync, constants} from 'node:fs';

export const makeFileExecutableIfItIsNot = (path: string) => {
	try {
		accessSync(path, constants.X_OK);
	} catch (err) {
		chmodSync(path, 0o755);
	}
};
