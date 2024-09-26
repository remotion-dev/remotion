import {Pkgs, packages} from '@remotion/studio-shared';
import {existsSync, lstatSync, readdirSync, writeFileSync} from 'fs';
import {readFileSync} from 'node:fs';
import path from 'path';

export const getAllPackages = () => {
	const pkgDir = path.join(__dirname, '..', '..', '..');
	const filePackages = readdirSync(pkgDir)
		.filter((pkg) => lstatSync(path.join(pkgDir, pkg)).isDirectory())
		.sort()
		.map((pkg) => ({
			pkg: pkg as Pkgs,
			path: path.join(pkgDir, pkg, 'package.json'),
		}))
		.filter(({path}) => existsSync(path));

	const notInFile = packages
		.slice()
		.sort()
		.map((pkg) => pkg);

	if (
		JSON.stringify(filePackages.map((pkg) => pkg.pkg).sort()) !==
		JSON.stringify(notInFile)
	) {
		const diff = notInFile.filter(
			(pkg) => !filePackages.map((pkg) => pkg.pkg).includes(pkg),
		);
		const diff2 = filePackages
			.map((pkg) => pkg.pkg)
			.filter((pkg) => !notInFile.includes(pkg));

		throw new Error(
			`Add the new package to 'get-all-packages.ts'. Diff: ${JSON.stringify(diff, null, 2)} ${JSON.stringify(
				diff2,
				null,
				2,
			)}`,
		);
	}

	return filePackages;
};

export const updatePackageJson = (
	json: string,
	updater: (data: Record<string, unknown>) => Record<string, unknown>,
) => {
	const contents = readFileSync(json, 'utf8');
	const pkg = JSON.parse(contents);
	const updatedPkg = updater(pkg);
	writeFileSync(json, JSON.stringify(updatedPkg, null, '\t') + '\n');
};
