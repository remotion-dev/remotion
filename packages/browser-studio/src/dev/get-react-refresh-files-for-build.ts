import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const getBrowserStudioReactRefreshFilesForBuild = () => {
	const entry = fileURLToPath(
		import.meta.resolve('@rspack/plugin-react-refresh/react-refresh-entry'),
	);
	const runtime = fileURLToPath(
		import.meta.resolve('@rspack/plugin-react-refresh/react-refresh'),
	);
	const refreshUtils = join(dirname(runtime), 'refreshUtils.js');

	return {
		entry: readFileSync(entry, 'utf-8'),
		runtime: readFileSync(runtime, 'utf-8'),
		utils: readFileSync(refreshUtils, 'utf-8'),
	};
};
