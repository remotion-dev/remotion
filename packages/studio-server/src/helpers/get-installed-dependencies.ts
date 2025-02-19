import fs from 'node:fs';
import path from 'node:path';

export const getInstalledDependencies = (remotionRoot: string) => {
	const packageJsonFilePath = path.join(remotionRoot, 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonFilePath, 'utf-8'));
	const dependencies = Object.keys(packageJson.dependencies ?? {});
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
