import {existsSync, lstatSync, readdirSync, writeFileSync} from 'fs';
import {readFileSync} from 'node:fs';
import path from 'path';
import {Pkgs, packages} from '@remotion/studio-shared';
import {CreateVideoInternals} from 'create-video';
import {packagesRemovedInV5} from '../../../studio-shared/src/release-package-policy';

const workspaceOnlyPackages = ['canvas-capture-extension'];

export const getAllPackages = () => {
	const pkgDir = path.join(__dirname, '..', '..', '..');

	const localTemplates = CreateVideoInternals.FEATURED_TEMPLATES.map(
		(t) => t.templateInMonorepo,
	).filter(Boolean) as string[];

	const folders = readdirSync(pkgDir)
		.filter((pkg) => lstatSync(path.join(pkgDir, pkg)).isDirectory())
		.sort()
		.map((pkg) => ({
			pkg: pkg as Pkgs,
			path: path.join(pkgDir, pkg, 'package.json'),
		}))
		.filter(({path}) => existsSync(path));

	const packagesKeptForV4 = packagesRemovedInV5.map((pkg) =>
		pkg.replace('@remotion/', ''),
	);
	const packageAndTemplateNames = [
		...new Set([
			...packages,
			...localTemplates,
			...packagesKeptForV4,
			...workspaceOnlyPackages,
		]),
	].sort();

	const packagesAndTemplates = folders.map((pkg) => pkg.pkg).sort() as string[];

	if (
		JSON.stringify(packagesAndTemplates) !==
		JSON.stringify(packageAndTemplateNames)
	) {
		const diff = packageAndTemplateNames.filter(
			(pkg) => !packagesAndTemplates.includes(pkg),
		);
		const diff2 = packagesAndTemplates.filter(
			(pkg) => !packageAndTemplateNames.includes(pkg),
		);

		throw new Error(
			`Add the new package to 'get-all-packages.ts'. Diff: ${JSON.stringify(diff, null, 2)} ${JSON.stringify(
				diff2,
				null,
				2,
			)}`,
		);
	}

	return folders.filter((pkg) => packages.includes(pkg.pkg));
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
