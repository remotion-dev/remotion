import fs from 'node:fs';
import path from 'node:path';
import {listOfRemotionPackages} from './list-of-remotion-packages';
import type {PackageManager} from './pkg-managers';

export const patchPackageJson = (
	{
		projectRoot,
		projectName,
		latestRemotionVersion,
		packageManager,
		addTailwind,
	}: {
		projectRoot: string;
		projectName: string;
		latestRemotionVersion: string;
		packageManager: PackageManager;
		addTailwind: boolean;
	},
	{
		getPackageJson = (filename: string) => fs.readFileSync(filename, 'utf-8'),
		setPackageJson = (filename: string, content: string) =>
			fs.writeFileSync(filename, content),
	} = {},
) => {
	const fileName = path.join(projectRoot, 'package.json');

	const contents = getPackageJson(fileName);
	const packageJson = JSON.parse(contents);

	const {name, dependencies, devDependencies, scripts, ...others} = packageJson;

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

	const updateScripts = (scriptsToUpdate: Record<string, string>) => {
		for (const [key, value] of Object.entries(scriptsToUpdate)) {
			scriptsToUpdate[key] = value.replace(/remotion\b/g, 'remotionb');
		}

		return scriptsToUpdate;
	};

	// update scripts to use "remotionb" instead of "remotion" if Bun is used
	// matching '@' as well to prevent conflicts with similarly named packages.
	const newScripts = packageManager.startsWith('bun')
		? updateScripts(scripts)
		: scripts;

	const newDependenciesWithTailwind = addTailwind
		? {
				...newDependencies,
				'@remotion/tailwind-v4': latestRemotionVersion,
				tailwindcss: '4.0.0',
			}
		: newDependencies;

	const newPackageJson = JSON.stringify(
		{
			name: projectName,
			...others,
			dependencies: newDependenciesWithTailwind,
			devDependencies: newDevDependencies,
			scripts: newScripts,
			...(addTailwind ? {sideEffects: ['*.css']} : {}),
		},
		undefined,
		2,
	);

	setPackageJson(fileName, newPackageJson);
};
