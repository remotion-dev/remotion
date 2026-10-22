import {spawnSync} from 'node:child_process';
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
			.reduce<Record<string, string>>((a, b) => {
				return {...a, [b[0]]: b[1]};
			}, {});
	});

	if (
		newDevDependencies?.['@remotion/eslint-config-flat'] &&
		/^10\./.test(newDevDependencies.eslint ?? '')
	) {
		// Bun's process.versions.node describes its compatibility target, not the
		// Node.js executable that will run npm scripts in the generated project.
		const nodeVersion = process.versions.bun
			? spawnSync('node', ['--version'], {
					encoding: 'utf8',
					windowsHide: true,
					timeout: 10000,
				}).stdout?.trim()
			: process.versions.node;
		const version = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(nodeVersion ?? '');
		const major = version ? Number(version[1]) : null;
		const minor = version ? Number(version[2]) : null;
		const supportsEslint10 =
			major !== null &&
			minor !== null &&
			(major >= 24 ||
				(major === 22 && minor >= 13) ||
				(major === 20 && minor >= 19));

		if (!supportsEslint10) {
			const eslint9NodeRequirement = '^18.18.0 || ^20.9.0 || >=21.1.0';
			if (
				major !== null &&
				minor !== null &&
				!(
					major >= 22 ||
					(major === 21 && minor >= 1) ||
					(major === 20 && minor >= 9) ||
					(major === 18 && minor >= 18)
				)
			) {
				throw new Error(
					`This template's ESLint configuration requires Node.js ${eslint9NodeRequirement}. Found ${nodeVersion}.`,
				);
			}

			newDevDependencies.eslint = '9.39.5';
			if (others.engines?.node === '^20.19.0 || ^22.13.0 || >=24') {
				others.engines.node = eslint9NodeRequirement;
			}
		}
	}

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
			...(packageManager === 'npm'
				? {allowScripts: {...packageJson.allowScripts, esbuild: false}}
				: {}),
			...(addTailwind ? {sideEffects: ['*.css']} : {}),
		},
		undefined,
		2,
	);

	setPackageJson(fileName, newPackageJson);
};
