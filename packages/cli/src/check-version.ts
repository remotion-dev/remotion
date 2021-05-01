import {Log} from './log';

const semver = require('semver');

const current = process.version;
const supported = '>=12.10.0';

export const checkNodeVersion = () => {
	if (!semver.satisfies(current, supported)) {
		Log.warn(
			`Required node version ${supported} not satisfied with current version ${current}.`
		);
		Log.warn(`Update your node version to ${supported}`);
	}
};
