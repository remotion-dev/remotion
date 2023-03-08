import fs from 'fs';
import path from 'path';
import {listOfRemotionPackages} from './list-of-remotion-packages';
import type {PackageManager} from './pkg-managers';

export const patchPackageJson = (
	{
		projectRoot,
		projectName,
		latestRemotionVersion,
		packageManager,
	}: {
		projectRoot: string;
		projectName: string;
		latestRemotionVersion: string;
		packageManager: `${PackageManager}@${string}` | null;
	},
	{
		getPackageJson = (filename: string) => fs.readFileSync(filename, 'utf-8'),
		setPackageJson = (filename: string, content: string) =>
			fs.writeFileSync(filename, content),
	} = {}
) => {
	const fileName = path.join(projectRoot, 'package.json');

	const contents = getPackageJson(fileName);
	const packageJson = JSON.parse(contents);

	const {name, dependencies, devDependencies, ...others} = packageJson;

	const [newDependencies, newDevDependencies] = [
		dependencies,
		devDependencies ?? {},
	].map((depsField) => {
		return Object.keys(depsField)
			.map((d) => {
				if (listOfRemotionPackages.includes(d)) {
					return [d, latestRemotionVersion];
				}

				return [d, depsField[d]];
			})
			.reduce((a, b) => {
				return {...a, [b[0]]: b[1]};
			}, {});
	});

	const newPackageJson = JSON.stringify(
		{
			name: projectName,
			...others,
			dependencies: newDependencies,
			devDependencies: newDevDependencies,
			...(packageManager ? {packageManager} : {}),
		},
		undefined,
		2
	);

	setPackageJson(fileName, newPackageJson);
};
