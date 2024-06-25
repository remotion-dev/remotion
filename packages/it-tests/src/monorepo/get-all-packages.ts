import {existsSync, lstatSync, readdirSync, writeFileSync} from 'fs';
import {readFileSync} from 'node:fs';
import path from 'path';

export const getAllPackages = () => {
	const pkgDir = path.join(__dirname, '..', '..', '..');
	return readdirSync(pkgDir)
		.filter((pkg) => lstatSync(path.join(pkgDir, pkg)).isDirectory())
		.map((pkg) => ({pkg, path: path.join(pkgDir, pkg, 'package.json')}))
		.filter(({path}) => existsSync(path));
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
