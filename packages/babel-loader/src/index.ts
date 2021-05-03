import {WebpackConfiguration} from 'remotion';

const envPreset = [
	require.resolve('@babel/preset-env'),
	{
		targets: {
			chrome: '85',
		},
	},
] as const;

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;
function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}

export const replaceLoadersWithBabel = (
	conf: WebpackConfiguration
): WebpackConfiguration => {
	return {
		...conf,
		module: {
			...conf.module,
			rules: (conf.module?.rules ?? []).map((rule) => {
				if (rule === '...') {
					return rule;
				}

				if (rule.test?.toString().includes('.tsx')) {
					return {
						test: /\.tsx?$/,
						use: [
							{
								loader: require.resolve('babel-loader'),
								options: {
									presets: [
										envPreset,
										[
											require.resolve('@babel/preset-react'),
											{
												runtime: 'automatic',
											},
										],
										[
											require.resolve('@babel/preset-typescript'),
											{
												runtime: 'automatic',
												isTSX: true,
												allExtensions: true,
											},
										],
									],
									plugins: [
										require.resolve('@babel/plugin-proposal-class-properties'),
										conf.mode === 'development'
											? require.resolve('react-refresh/babel')
											: null,
									].filter(truthy),
								},
							},
							conf.mode === 'development'
								? {
										loader: require.resolve(
											'@webhotelier/webpack-fast-refresh/loader.js'
										),
								  }
								: null,
						].filter(truthy),
					};
				}

				if (rule.test?.toString().includes('.jsx')) {
					return {
						test: /\.jsx?$/,
						loader: require.resolve('babel-loader'),
						options: {
							presets: [
								envPreset,
								[
									require.resolve('@babel/preset-react'),
									{
										runtime: 'automatic',
									},
								],
							],
							plugins: [
								require.resolve('@babel/plugin-proposal-class-properties'),
							],
						},
					};
				}

				return rule;
			}),
		},
	};
};
