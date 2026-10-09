import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const localPackageRootKey = '_remotionInternalPackageRoot';

export const getLocalPackageOverride = ({
	remotionRoot,
	packageName,
}: {
	remotionRoot: string;
	packageName: string;
}): string | null => {
	const packageJsonPath = path.join(remotionRoot, 'package.json');
	if (!fs.existsSync(packageJsonPath)) {
		return null;
	}

	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
	const localPackageRoot = packageJson[localPackageRootKey];
	if (typeof localPackageRoot !== 'string') {
		return null;
	}

	const packagesRoot = path.join(localPackageRoot, 'packages');
	if (!fs.existsSync(packagesRoot)) {
		return null;
	}

	for (const directory of fs.readdirSync(packagesRoot)) {
		const packageDirectory = path.join(packagesRoot, directory);
		const candidatePackageJsonPath = path.join(
			packageDirectory,
			'package.json',
		);
		if (!fs.existsSync(candidatePackageJsonPath)) {
			continue;
		}

		const candidatePackageJson = JSON.parse(
			fs.readFileSync(candidatePackageJsonPath, 'utf-8'),
		);
		if (
			candidatePackageJson.name === packageName &&
			!candidatePackageJson.private
		) {
			return pathToFileURL(packageDirectory).href;
		}
	}

	return null;
};
