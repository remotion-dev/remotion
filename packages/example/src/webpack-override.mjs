import {readFileSync} from 'node:fs';
import path from 'node:path';
import {enableScss} from '@remotion/enable-scss';
import {enableSkia} from '@remotion/skia/enable';
import {enableTailwind} from '@remotion/tailwind-v4';

const WEBPACK_OR_ESBUILD = 'esbuild';

const resolveCwd = (p) => {
	return require.resolve(p, {
		paths: [path.join(process.cwd(), 'node_modules')],
	});
};

const getPackageAliases = (packageName) => {
	const packageJsonPath = path.join(
		process.cwd(),
		'node_modules',
		...packageName.split('/'),
		'package.json',
	);
	const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
	const packageExports = packageJson.exports;

	if (typeof packageExports !== 'object' || packageExports === null) {
		return {
			[`${packageName}$`]: resolveCwd(packageName),
		};
	}

	return Object.fromEntries(
		Object.keys(packageExports)
			.filter((subpath) => {
				return (
					(subpath === '.' || subpath.startsWith('./')) &&
					subpath !== './package.json' &&
					!subpath.includes('*')
				);
			})
			.map((subpath) => {
				const importPath =
					subpath === '.' ? packageName : `${packageName}/${subpath.slice(2)}`;

				// `$` makes the alias exact, so it cannot capture undeclared subpaths.
				return [`${importPath}$`, resolveCwd(importPath)];
			}),
	);
};

// this is so the studio live reloads when the CJS modules are changed
// probably a bad idea and we should slowly get rid of the ones which compile MJS with turbo
const aliases = {
	...getPackageAliases('@remotion/gif'),
	...getPackageAliases('@remotion/layout-utils'),
	...getPackageAliases('@remotion/lottie'),
	...getPackageAliases('@remotion/media-utils'),
	...getPackageAliases('@remotion/motion-blur'),
	...getPackageAliases('@remotion/noise'),
	...getPackageAliases('@remotion/paths'),
	...getPackageAliases('@remotion/fonts'),
	...getPackageAliases('@remotion/player'),
	...getPackageAliases('@remotion/preload'),
	...getPackageAliases('@remotion/rive'),
	...getPackageAliases('@remotion/shapes'),
	...getPackageAliases('@remotion/animated-emoji'),
	...getPackageAliases('@remotion/skia'),
	...getPackageAliases('@remotion/three'),
	...getPackageAliases('@remotion/transitions'),
	...getPackageAliases('@remotion/zod-types'),
	'@remotion/effects/blur$': path.join(
		process.cwd(),
		'../effects/dist/esm/blur.mjs',
	),
	'@remotion/effects/wave$': path.join(
		process.cwd(),
		'../effects/dist/esm/wave.mjs',
	),
	'@remotion/effects/halftone$': path.join(
		process.cwd(),
		'../effects/dist/esm/halftone.mjs',
	),
	'@remotion/effects/tint$': path.join(
		process.cwd(),
		'../effects/dist/esm/tint.mjs',
	),
};

/** @type {import('@remotion/bundler').BundlerOverrideFn} */
export const bundlerOverride = (currentConfiguration) => {
	const replaced = (() => {
		if (WEBPACK_OR_ESBUILD === 'webpack') {
			const {replaceLoadersWithBabel} = require(
				path.join(
					// eslint-disable-next-line no-undef
					process.cwd(),
					'..',
					'..',
					'example',
					'node_modules',
					'@remotion/babel-loader',
				),
			);
			return replaceLoadersWithBabel(currentConfiguration);
		}

		return currentConfiguration;
	})();
	return enableScss(
		enableSkia(
			enableTailwind({
				...replaced,
				module: {
					...replaced.module,
					rules: [
						...(replaced.module?.rules ?? []),
						{
							test: /\.mdx?$/,
							use: [
								{
									loader: '@mdx-js/loader',
									options: {},
								},
							],
						},
					],
				},
				resolve: {
					...replaced.resolve,
					alias: {
						...replaced.resolve.alias,
						// eslint-disable-next-line no-undef
						lib: path.join(process.cwd(), 'src', 'lib'),

						// ES Modules need to be generated with `pnpm build` in every package
						// So if you just make a change while you run `pnpm watch`, you don't see the difference
						// which is confusing for contributors
						...aliases,
					},
				},
			}),
		),
	);
};
