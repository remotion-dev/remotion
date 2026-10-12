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
	'portable and backend-specific overrides work across Rspack and Webpack',
	async () => {
		const fixtureDirectory = path.join(
			import.meta.dir,
			'fixtures',
			'portable-helpers',
		);
		const portableOverridesDirectory = path.join(
			import.meta.dir,
			'fixtures',
			'portable-overrides',
		);
		const customLoader = path.join(
			portableOverridesDirectory,
			'custom-loader.cjs',
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
			return {
				...withHelpers,
				module: {
					...withHelpers.module,
					rules: [
						...(withHelpers.module?.rules ?? []).map((rule) => {
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
			};
		};

		const portableResult = await bundleFixture({
			entryPoint: path.join(fixtureDirectory, 'entry.tsx'),
			bundlerOverride,
			rspack: true,
		});

		expect(scriptLoaders[0]).toContain('babel-loader');
		expect(scriptLoaders).not.toContain('builtin:swc-loader');
		expect(portableResult).toContain('BABEL_LOADER_SENTINEL');
		expect(portableResult).toContain('scss-global-sentinel');
		expect(portableResult).toContain('#123456');
		expect(portableResult).toContain('moduleClass');
		expect(portableResult).toContain('#654321');
		expect(portableResult).toContain('.text-red-500');
		expect(portableResult).toContain('MDX portable override sentinel');
		expect(portableResult).toContain('width: 321px');
		expect(portableResult).toContain('height: 181px');
		expect(portableResult).toContain('CUSTOM_LOADER:custom loader input');

		const rspackSpecificDirectory = path.join(
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
						rspackSpecificDirectory,
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
			plugins: [
				...(configuration.plugins ?? []),
				new RspackDefinePlugin({
					BUNDLER_PLUGIN_SENTINEL: JSON.stringify(
						'RSPACK_DEFINE_PLUGIN_SENTINEL',
					),
				}),
			],
		});

		const rspackResult = await bundleFixture({
			entryPoint: path.join(rspackSpecificDirectory, 'entry.tsx'),
			rspack: true,
			rspackOverride,
		});

		expect(rspackResult).toContain('CUSTOM_JSX_RUNTIME_SENTINEL');
		expect(rspackResult).toContain('RSPACK_DEFINE_PLUGIN_SENTINEL');

		const webpackResult = await bundleFixture({
			entryPoint: path.join(rspackSpecificDirectory, 'entry.tsx'),
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

		expect(webpackResult).toContain('WEBPACK_DEFINE_PLUGIN_SENTINEL');
	},
	{timeout: 60_000},
);
