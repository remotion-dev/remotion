import {afterAll, expect, test} from 'bun:test';
import {readdirSync, readFileSync, rmSync} from 'node:fs';
import path from 'node:path';
import {replaceLoadersWithBabel} from '@remotion/babel-loader';
import {
	bundle,
	type BundlerOverrideFn,
	type RspackOverrideFn,
	type WebpackOverrideFn,
	webpack,
} from '@remotion/bundler';
import {enableScss} from '@remotion/enable-scss';
import {enableTailwind} from '@remotion/tailwind';
import {DefinePlugin as RspackDefinePlugin} from '@rspack/core';

const outputDirectories: string[] = [];

const readJavaScriptFiles = (directory: string): string => {
	return readdirSync(directory, {withFileTypes: true})
		.flatMap((entry) => {
			const absolutePath = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				return readJavaScriptFiles(absolutePath);
			}

			return entry.name.endsWith('.js')
				? [readFileSync(absolutePath, 'utf8')]
				: [];
		})
		.join('\n');
};

const bundleFixture = async ({
	entryPoint,
	bundlerOverride,
	rspack,
	rspackOverride,
	webpackOverride,
}: {
	entryPoint: string;
	bundlerOverride?: BundlerOverrideFn;
	rspack: boolean;
	rspackOverride?: RspackOverrideFn;
	webpackOverride?: WebpackOverrideFn;
}) => {
	const outputDirectory = await bundle({
		entryPoint,
		bundlerOverride,
		enableCaching: false,
		ignoreRegisterRootWarning: true,
		rootDir: path.dirname(entryPoint),
		rspack,
		rspackOverride,
		webpackOverride,
	});
	outputDirectories.push(outputDirectory);
	return readJavaScriptFiles(outputDirectory);
};

afterAll(() => {
	for (const outputDirectory of outputDirectories) {
		rmSync(outputDirectory, {recursive: true, force: true});
	}
});

test(
	'MDX, PostCSS, and custom loaders work through a shared Rspack override',
	async () => {
		const fixtureDirectory = path.join(
			import.meta.dir,
			'fixtures',
			'portable-overrides',
		);
		const customLoader = path.join(fixtureDirectory, 'custom-loader.cjs');
		const bundlerOverride: BundlerOverrideFn = (configuration) => ({
			...configuration,
			module: {
				...configuration.module,
				rules: [
					...(configuration.module?.rules ?? []).map((rule) => {
						if (
							!rule ||
							rule === '...' ||
							!rule.test?.toString().includes('.css')
						) {
							return rule;
						}

						const use = Array.isArray(rule.use)
							? rule.use
							: rule.use
								? [rule.use]
								: [];

						return {
							...rule,
							use: [
								...use,
								{
									loader: 'postcss-loader',
									options: {
										postcssOptions: {plugins: ['postcss-size']},
									},
								},
							],
						};
					}),
					{
						test: /\.mdx?$/,
						use: [{loader: '@mdx-js/loader', options: {}}],
					},
					{test: /\.custom$/, use: [customLoader]},
				],
			},
		});

		const result = await bundleFixture({
			entryPoint: path.join(fixtureDirectory, 'entry.ts'),
			bundlerOverride,
			rspack: true,
		});

		expect(result).toContain('MDX portable override sentinel');
		expect(result).toContain('width: 321px');
		expect(result).toContain('height: 181px');
		expect(result).toContain('CUSTOM_LOADER:custom loader input');
	},
	{timeout: 60_000},
);

test(
	'SCSS, Tailwind v3, and Babel helpers work through a shared Rspack override',
	async () => {
		const fixtureDirectory = path.join(
			import.meta.dir,
			'fixtures',
			'portable-helpers',
		);
		let scriptLoaders: string[] = [];
		const bundlerOverride: BundlerOverrideFn = (configuration) => {
			const withHelpers = replaceLoadersWithBabel(
				enableScss(
					enableTailwind(configuration, {
						configLocation: path.join(fixtureDirectory, 'tailwind.config.cjs'),
					}),
				),
			);

			const scriptRule = (withHelpers.module?.rules ?? []).find(
				(rule) =>
					rule && rule !== '...' && rule.test?.toString().includes('.tsx'),
			);
			if (scriptRule && scriptRule !== '...') {
				const use = Array.isArray(scriptRule.use)
					? scriptRule.use
					: [scriptRule.use];
				scriptLoaders = use.flatMap((item) => {
					if (typeof item === 'string') {
						return item;
					}

					return item &&
						typeof item === 'object' &&
						'loader' in item &&
						typeof item.loader === 'string'
						? [item.loader]
						: [];
				});
			}
			return withHelpers;
		};

		const result = await bundleFixture({
			entryPoint: path.join(fixtureDirectory, 'entry.tsx'),
			bundlerOverride,
			rspack: true,
		});

		expect(scriptLoaders[0]).toContain('babel-loader');
		expect(scriptLoaders).not.toContain('builtin:swc-loader');
		expect(result).toContain('BABEL_LOADER_SENTINEL');
		expect(result).toContain('scss-global-sentinel');
		expect(result).toContain('#123456');
		expect(result).toContain('moduleClass');
		expect(result).toContain('#654321');
		expect(result).toContain('.text-red-500');
	},
	{timeout: 60_000},
);

test(
	'Rspack supports a custom JSX import source through the SWC loader',
	async () => {
		const fixtureDirectory = path.join(
			import.meta.dir,
			'fixtures',
			'rspack-specific-overrides',
		);
		const rspackOverride: RspackOverrideFn = (configuration) => ({
			...configuration,
			resolve: {
				...configuration.resolve,
				alias: {
					...configuration.resolve?.alias,
					'custom-jsx-runtime/jsx-runtime': path.join(
						fixtureDirectory,
						'jsx-runtime.ts',
					),
				},
			},
			module: {
				...configuration.module,
				rules: (configuration.module?.rules ?? []).map((rule) => {
					if (!rule || rule === '...' || !Array.isArray(rule.use)) {
						return rule;
					}

					return {
						...rule,
						use: rule.use.map((use) => {
							if (
								typeof use === 'string' ||
								use.loader !== 'builtin:swc-loader'
							) {
								return use;
							}

							const options = use.options as
								| {
										jsc?: {
											transform?: {react?: Record<string, unknown>};
										};
								  }
								| undefined;
							return {
								...use,
								options: {
									...options,
									jsc: {
										...options?.jsc,
										transform: {
											...options?.jsc?.transform,
											react: {
												...options?.jsc?.transform?.react,
												importSource: 'custom-jsx-runtime',
											},
										},
									},
								},
							};
						}),
					};
				}),
			},
		});

		const result = await bundleFixture({
			entryPoint: path.join(fixtureDirectory, 'entry.tsx'),
			rspack: true,
			rspackOverride,
		});

		expect(result).toContain('CUSTOM_JSX_RUNTIME_SENTINEL');
	},
	{timeout: 60_000},
);

test(
	'Webpack and Rspack use their own DefinePlugin implementations',
	async () => {
		const entryPoint = path.join(
			import.meta.dir,
			'fixtures',
			'rspack-specific-overrides',
			'entry.tsx',
		);
		const webpackResult = await bundleFixture({
			entryPoint,
			rspack: false,
			webpackOverride: (configuration) => ({
				...configuration,
				plugins: [
					...(configuration.plugins ?? []),
					new webpack.DefinePlugin({
						BUNDLER_PLUGIN_SENTINEL: JSON.stringify(
							'WEBPACK_DEFINE_PLUGIN_SENTINEL',
						),
					}),
				],
			}),
		});
		const rspackResult = await bundleFixture({
			entryPoint,
			rspack: true,
			rspackOverride: (configuration) => ({
				...configuration,
				plugins: [
					...(configuration.plugins ?? []),
					new RspackDefinePlugin({
						BUNDLER_PLUGIN_SENTINEL: JSON.stringify(
							'RSPACK_DEFINE_PLUGIN_SENTINEL',
						),
					}),
				],
			}),
		});

		expect(webpackResult).toContain('WEBPACK_DEFINE_PLUGIN_SENTINEL');
		expect(rspackResult).toContain('RSPACK_DEFINE_PLUGIN_SENTINEL');
	},
	{timeout: 60_000},
);
