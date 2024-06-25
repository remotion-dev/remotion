import {existsSync, lstatSync, readdirSync, writeFileSync} from 'fs';
import {readFileSync} from 'node:fs';
import path from 'path';

export const packages = [
	'core',
	'player',
	'renderer',
	'cli',
	'cloudrun',
	'lambda',
	'bundler',
	'studio-server',
	'install-whisper-cpp',
	'google-fonts',
	'media-utils',
	'lottie',
	'layout-utils',
	'noise',
	'motion-blur',
	'preload',
	'shapes',
	'zod-types',
	'gif',
	'eslint-plugin',
	'eslint-config',
	'compositor-linux-x64-gnu',
	'compositor-linux-x64-musl',
	'compositor-darwin-x64',
	'compositor-darwin-arm64',
	'compositor-linux-arm64-gnu',
	'compositor-linux-arm64-musl',
	'compositor-win32-x64-msvc',
	'babel-loader',
	'fonts',
	'transitions',
	'enable-scss',
	'create-video',
	'studio-shared',
	'tailwind',
	'streaming',
	'video-parser',
	'rive',
	'paths',
	'studio',
	'skia',
	'three',
	'astro-example',
	'lambda-go-example',
	'test-utils',
	'example-without-zod',
	'lambda-go',
	'animation-utils',
	'example',
	'lambda-php',
	'bugs',
	'docs',
	'it-tests',
	'lambda-python',
	'player-example',
	'ai-improvements',
	'discord-poster',
	'cli-autocomplete',
] as const;

export type Pkgs = (typeof packages)[number];

export const getAllPackages = () => {
	const pkgDir = path.join(__dirname, '..', '..', '..');
	const filePackages = readdirSync(pkgDir)
		.filter((pkg) => lstatSync(path.join(pkgDir, pkg)).isDirectory())
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
