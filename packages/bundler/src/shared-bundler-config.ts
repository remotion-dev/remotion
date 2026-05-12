import {createHash} from 'node:crypto';
import path from 'node:path';
import ReactDOM from 'react-dom';
import {NoReactInternals} from 'remotion/no-react';
import {jsonStringifyWithCircularReferences} from './stringify-with-circular-references';
import {getWebpackCacheName} from './webpack-cache';

if (!ReactDOM?.version) {
	throw new Error('Could not find "react-dom" package. Did you install it?');
}

const reactDomVersion = ReactDOM.version.split('.')[0];
if (reactDomVersion === '0') {
	throw new Error(
		`Version ${reactDomVersion} of "react-dom" is not supported by Remotion`,
	);
}

export const shouldUseReactDomClient =
	NoReactInternals.ENABLE_V5_BREAKING_CHANGES
		? true
		: parseInt(reactDomVersion, 10) >= 18;

export const getResolveConfig = () => ({
	extensions: ['.ts', '.tsx', '.web.js', '.js', '.jsx', '.mjs', '.cjs'],
	alias: {
		// Only one version of react
		'react/jsx-runtime': require.resolve('react/jsx-runtime'),
		'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
		react: require.resolve('react'),
		// Needed to not fail on this: https://github.com/remotion-dev/remotion/issues/5045
		'remotion/no-react': path.resolve(
			require.resolve('remotion'),
			'..',
			'..',
			'esm',
			'no-react.mjs',
		),
		'remotion/version': path.resolve(
			require.resolve('remotion'),
			'..',
			'..',
			'esm',
			'version.mjs',
		),
		remotion: path.resolve(
			require.resolve('remotion'),
			'..',
			'..',
			'esm',
			'index.mjs',
		),

		'@remotion/media-parser/worker': path.resolve(
			require.resolve('@remotion/media-parser'),
			'..',
			'esm',
			'worker.mjs',
		),
		// test visual controls before removing this
		'@remotion/studio': require.resolve('@remotion/studio'),
		[path.join(
			require.resolve('@remotion/studio'),
			'..',
			'audio-waveform-worker.mjs',
		)]: path.join(
			require.resolve('@remotion/studio'),
			'..',
			'esm',
			'audio-waveform-worker.mjs',
		),
		'react-dom/client': shouldUseReactDomClient
			? require.resolve('react-dom/client')
			: require.resolve('react-dom'),
	},
});

export const getOutputConfig = (environment: 'development' | 'production') => ({
	hashFunction: 'xxhash64' as const,
	filename: NoReactInternals.bundleName,
	devtoolModuleFilenameTemplate: '[resource-path]',
	assetModuleFilename:
		environment === 'development' ? '[path][name][ext]' : '[hash][ext]',
});

export const getBaseConfig = (
	environment: 'development' | 'production',
	poll: number | null,
) => {
	const isBun = typeof Bun !== 'undefined';

	return {
		optimization: {
			minimize: false,
		},
		experiments: {
			lazyCompilation: isBun
				? false
				: environment === 'production'
					? false
					: {
							entries: false,
						},
		},
		watchOptions: {
			poll: poll ?? undefined,
			aggregateTimeout: 0,
			ignored: ['**/.git/**', '**/.turbo/**', '**/node_modules/**'],
		},
		// Higher source map quality in development to power line numbers for stack traces
		devtool:
			environment === 'development'
				? ('source-map' as const)
				: ('cheap-module-source-map' as const),
	};
};

export const getSharedModuleRules = () => [
	{
		test: /\.css$/i,
		use: [
			require.resolve('style-loader'),
			require.resolve('../css-loader/index.js'),
		],
		type: 'javascript/auto' as const,
	},
	{
		test: /\.(png|svg|jpg|jpeg|webp|gif|bmp|webm|mp4|mov|mp3|m4a|wav|aac)$/,
		type: 'asset/resource' as const,
	},
	{
		test: /\.(woff(2)?|otf|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
		type: 'asset/resource' as const,
	},
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const computeHashAndFinalConfig = <T extends {output?: any}>(
	conf: T,
	options: {
		enableCaching: boolean;
		environment: 'development' | 'production';
		outDir: string | null;
		remotionRoot: string;
	},
): [string, T] => {
	const hash = createHash('md5')
		.update(jsonStringifyWithCircularReferences(conf))
		.digest('hex');
	return [
		hash,
		{
			...conf,
			cache: options.enableCaching
				? {
						type: 'filesystem',
						name: getWebpackCacheName(options.environment, hash),
						version: hash,
					}
				: false,
			output: {
				...conf.output,
				...(options.outDir ? {path: options.outDir} : {}),
			},
			context: options.remotionRoot,
		},
	];
};
