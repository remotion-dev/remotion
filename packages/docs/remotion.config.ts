import path from 'path';
import {Config} from '@remotion/cli/config';

Config.setPublicDir(path.join(process.cwd(), 'static'));

// Run: cd packages/docs && bun run remotion (default Webpack, no Docusaurus).
// Open http://127.0.0.1:<port>/elements-install-playground, then choose an Element and confirm.
// Public protocol discovery probes localhost:3000–3009; using 127.0.0.1 ensures
// the browser sends the cross-origin Origin header required by discovery.
// Docs already has dependencies, so this does not verify dependency installation
// into a fresh project. Installation edits the composition and copies source beside it.
Config.overrideWebpackConfig((config) => ({
	...config,
	module: {
		...config.module,
		rules: [
			...(config.module?.rules ?? []),
			{
				test: /element-sources\.ts$/,
				use: path.resolve(
					'src/remotion/element-playground/element-sources-loader.mjs',
				),
			},
		],
	},
}));
