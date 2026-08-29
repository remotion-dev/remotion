import {Config} from '@remotion/cli/config';
import {createRequire} from 'node:module';

const projectRequire = createRequire(process.cwd() + '/package.json');

Config.setRspack(true);
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

Config.overrideRspackConfig((config) => {
	return {
		...config,
		resolve: {
			...config.resolve,
			alias: {
				...config.resolve?.alias,
				'@code-hike/lighter': projectRequire.resolve(
					'@code-hike/lighter/dist/index.esm.mjs',
				),
				https: false,
			},
		},
		ignoreWarnings: [
			...(config.ignoreWarnings ?? []),
			/Critical dependency: the request of a dependency is an expression/,
		],
	};
});
