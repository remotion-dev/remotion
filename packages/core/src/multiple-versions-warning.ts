import {truthy} from './truthy';
import {VERSION} from './version';

export const checkMultipleRemotionVersions = () => {
	if (typeof globalThis === 'undefined') {
		return;
	}

	const alreadyImported =
		(globalThis as unknown as Window).remotion_imported ||
		(typeof window !== 'undefined' && window.remotion_imported);

	if (alreadyImported) {
		throw new TypeError(
			`🚨 Multiple versions of Remotion detected: ${[
				VERSION,
				typeof alreadyImported === 'string'
					? alreadyImported
					: 'an older version',
			]
				.filter(truthy)
				.join(
					' and '
				)}. This will cause things to break in an unexpected way.\nCheck that all your Remotion packages are on the same version. If your dependencies depend on Remotion, make them peer dependencies. You can also run \`npx remotion versions\` from your terminal to see which versions are mismatching.`
		);
	}

	(globalThis as unknown as Window).remotion_imported = true;
	if (typeof window !== 'undefined') {
		window.remotion_imported = VERSION;
	}
};
