import fs from 'node:fs';
import path from 'node:path';

type DepsWithVersions = {
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
	optionalDependencies: Record<string, string>;
	peerDependencies: Record<string, string>;
};

export const getInstalledDependenciesWithVersions = (
	remotionRoot: string,
): DepsWithVersions => {
	const packageJsonFilePath = path.join(remotionRoot, 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonFilePath, 'utf-8'));

	return {
		dependencies: packageJson.dependencies ?? {},
		devDependencies: packageJson.devDependencies ?? {},
		optionalDependencies: packageJson.optionalDependencies ?? {},
		peerDependencies: packageJson.peerDependencies ?? {},
	};
};

export const getInstalledDependencies = (remotionRoot: string) => {
	const deps = getInstalledDependenciesWithVersions(remotionRoot);

	return {
		dependencies: Object.keys(deps.dependencies),
		devDependencies: Object.keys(deps.devDependencies),
		optionalDependencies: Object.keys(deps.optionalDependencies),
		peerDependencies: Object.keys(deps.peerDependencies),
	};
};
