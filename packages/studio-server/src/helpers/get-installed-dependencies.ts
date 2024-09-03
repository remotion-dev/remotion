import path from 'node:path';

export const getInstalledDependencies = (remotionRoot: string) => {
	const packageJsonFilePath = path.join(remotionRoot, 'package.json');
	const packageJson = require(packageJsonFilePath);
	const dependencies = Object.keys(packageJson.dependencies);
	const devDependencies = Object.keys(packageJson.devDependencies ?? {});
	const optionalDependencies = Object.keys(
		packageJson.optionalDependencies ?? {},
	);
	const peerDependencies = Object.keys(packageJson.peerDependencies ?? {});

	return {
		dependencies,
		devDependencies,
		optionalDependencies,
		peerDependencies,
	};
};
