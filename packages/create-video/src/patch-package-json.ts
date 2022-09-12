import fs from 'fs';
import path from 'path';

export const listOfRemotionPackages = [
	'@remotion/bundler',
	'@remotion/cli',
	'@remotion/eslint-config',
	'@remotion/renderer',
	'@remotion/skia',
	'@remotion/lottie',
	'@remotion/media-utils',
	'@remotion/paths',
	'@remotion/babel-loader',
	'@remotion/lambda',
	'@remotion/player',
	'@remotion/preload',
	'@remotion/three',
	'@remotion/gif',
	'remotion',
];

export const patchPackageJson = ({
	projectRoot,
	projectName,
	latestRemotionVersion,
}: {
	projectRoot: string;
	projectName: string;
	latestRemotionVersion: string;
}) => {
	const fileName = path.join(projectRoot, 'package.json');

	const contents = fs.readFileSync(fileName, 'utf-8');
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
		},
		undefined,
		2
	);

	fs.writeFileSync(fileName, newPackageJson);
};
