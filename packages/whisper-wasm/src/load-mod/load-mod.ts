// ⚠️⚠️⚠️⚠️⚠️!! Intentionally putting this in a subdirectory, so it is 2 directories deep
// That way it can be imported when the output is dist/esm/index.js
import type {MainModule} from '../../main';

export const loadMod = async () => {
	const Mod = await import('../../main.js');

	return Mod.default as unknown as MainModule;
};
