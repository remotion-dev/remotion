import fs from 'fs';
import path from 'path';
import type {PackageManager} from './pkg-managers';

export const listOfRemotionPackages = [
	'@remotion/bundler',
	'@remotion/cli',
	'@remotion/eslint-config',
	'@remotion/renderer',
	'@remotion/skia',
	'@remotion/lottie',
	'@remotion/media-utils',
	'@remotion/motion-blur',
	'@remotion/google-fonts',
	'@remotion/noise',
	'@remotion/paths',
	'@remotion/babel-loader',
	'@remotion/lambda',
	'@remotion/player',
	'@remotion/preload',
	'@remotion/three',
	'@remotion/gif',
	'remotion',
];

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

	const {name, dependencies, ...others} = packageJson;

	const newDependencies = Object.keys(dependencies)
		.map((d) => {
			if (listOfRemotionPackages.includes(d)) {
				return [d, latestRemotionVersion];
			}

			return [d, dependencies[d]];
		})
		.reduce((a, b) => {
			return {...a, [b[0]]: b[1]};
		}, {});

	const newPackageJson = JSON.stringify(
		{
			name: projectName,
			...others,
			dependencies: newDependencies,
			...(packageManager ? {packageManager} : {}),
		},
		undefined,
		2
	);

	setPackageJson(fileName, newPackageJson);
};
