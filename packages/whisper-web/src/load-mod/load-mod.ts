// ⚠️⚠️⚠️⚠️⚠️!! Intentionally putting this in a subdirectory, so it is 2 directories deep
// That way it can be imported when the output is dist/esm/index.js
import type {MainModule} from '../../main.js';

export const loadMod = async () => {
	// According to MDN, this is allowed:
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object
	const Mod = await import('../../main.js');

	return Mod.default as unknown as MainModule;
};
