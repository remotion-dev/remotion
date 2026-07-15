import {getInstalledDependencies} from './get-installed-dependencies';

export const getInstalledInstallablePackages = (
	remotionRoot: string,
): string[] => {
	const {
		dependencies,
		devDependencies,
		optionalDependencies,
		peerDependencies,
	} = getInstalledDependencies(remotionRoot);

	return Array.from(
		new Set([
			...dependencies,
			...devDependencies,
			...optionalDependencies,
			...peerDependencies,
		]),
	);
};
