// ⚠️⚠️⚠️⚠️⚠️!! Intentionally putting this in a subdirectory, so it is 2 directories deep
// That way it can be imported when the output is dist/esm/index.js

import type {printHandler} from '../print-handler.js';

export const loadMod = async ({
	handler,
}: {
	handler: ReturnType<typeof printHandler>;
}) => {
	const createModule = await import('../../main.js').then((mod) => mod.default);

	const Module = await createModule({
		print: handler,
		printErr: handler,
	});

	return Module;
};
