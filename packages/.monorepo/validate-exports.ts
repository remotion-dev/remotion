import {existsSync} from 'node:fs';
import path from 'path';

export type Exports = Record<string, './package.json' | Record<string, string>>;

export const validateExports = (exports: Exports) => {
	const keys = Object.keys(exports);
	for (const key of keys) {
		const value = exports[key];
		if (key === './package.json' && value === './package.json') {
			continue;
		}

		if (typeof value === 'string') {
			throw new Error(`Invalid export for ${key}`);
		}

		if (!value.import || !value.require || !value.module || !value) {
			throw new Error(`Missing import or require for ${key}`);
		}
		const paths = Object.keys(value);
		for (const entry of paths) {
			if (
				entry !== 'import' &&
				entry !== 'require' &&
				entry !== 'module' &&
				entry !== 'types'
			) {
				throw new Error(`Invalid export: ${entry}: ${JSON.stringify(exports)}`);
			}
			const pathToCheck = path.join(process.cwd(), value[entry]);
			const exists = existsSync(pathToCheck);
			if (!exists) {
				throw new Error(`Path does not exist: ${pathToCheck}`);
			}
		}
	}
};
