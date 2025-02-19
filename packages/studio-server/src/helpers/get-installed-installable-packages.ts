import {installableMap} from '@remotion/studio-shared';
import {getInstalledDependencies} from './get-installed-dependencies';

export const getInstalledInstallablePackages = (
	remotionRoot: string,
): string[] => {
	const {dependencies, devDependencies, optionalDependencies} =
		getInstalledDependencies(remotionRoot);
	const installablePackages = [
		...dependencies,
		...devDependencies,
		...optionalDependencies,
	];

	return Object.entries(installableMap)
		.filter(([, _installable]) => _installable)
		.map(([pkg]) => (pkg === 'core' ? 'remotion' : `@remotion/${pkg}`))
		.filter((pkg) => installablePackages.includes(pkg));
};
