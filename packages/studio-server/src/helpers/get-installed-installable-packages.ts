import type {InstallablePackage} from '@remotion/studio-shared';
import {listOfInstallableRemotionPackages} from '@remotion/studio-shared';
import {getInstalledDependencies} from './get-installed-dependencies';

export const getInstalledInstallablePackages = (
	remotionRoot: string,
): InstallablePackage[] => {
	const {dependencies, devDependencies, optionalDependencies} =
		getInstalledDependencies(remotionRoot);
	const installablePackages = [
		...dependencies,
		...devDependencies,
		...optionalDependencies,
	];

	return listOfInstallableRemotionPackages.filter((pkg) =>
		installablePackages.includes(pkg),
	);
};
