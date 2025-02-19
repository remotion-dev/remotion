import {truthy} from './truthy.js';
import {VERSION} from './version.js';

export const checkMultipleRemotionVersions = () => {
	if (typeof globalThis === 'undefined') {
		return;
	}

	const set = () => {
		(globalThis as unknown as Window).remotion_imported = VERSION;
		if (typeof window !== 'undefined') {
			window.remotion_imported = VERSION;
		}
	};

	const alreadyImported =
		(globalThis as unknown as Window).remotion_imported ||
		(typeof window !== 'undefined' && window.remotion_imported);

	if (alreadyImported) {
		if (alreadyImported === VERSION) {
			// Next.JS will reload the package and cause a server-side warning.
			// It's okay if this happens during SSR in developement
			return;
		}

		// @remotion/webcodecs will also set this variable for the purpose of
		// being picked up by Wappalyzer.
		// If so, we can just override it because it is not the same as Remotion
		if (
			typeof alreadyImported === 'string' &&
			alreadyImported.includes('webcodecs')
		) {
			set();
			return;
		}

		throw new TypeError(
			`🚨 Multiple versions of Remotion detected: ${[
				VERSION,
				typeof alreadyImported === 'string'
					? alreadyImported
					: 'an older version',
			]
				.filter(truthy)
				.join(
					' and ',
				)}. This will cause things to break in an unexpected way.\nCheck that all your Remotion packages are on the same version. If your dependencies depend on Remotion, make them peer dependencies. You can also run \`npx remotion versions\` from your terminal to see which versions are mismatching.`,
		);
	}

	set();
};
