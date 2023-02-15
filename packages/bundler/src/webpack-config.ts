import {viteCommonjs} from '@originjs/vite-plugin-commonjs';
import {createHash} from 'crypto';
import ReactDOM from 'react-dom';
import type {InlineConfig} from 'vite';
import progress from 'vite-plugin-progress';
import {jsonStringifyWithCircularReferences} from './stringify-with-circular-references';

if (!ReactDOM || !ReactDOM.version) {
	throw new Error('Could not find "react-dom" package. Did you install it?');
}

const reactDomVersion = ReactDOM.version.split('.')[0];
if (reactDomVersion === '0') {
	throw new Error(
		`Version ${reactDomVersion} of "react-dom" is not supported by Remotion`
	);
}

export const viteConfig = ({
	outDir,
	environment,
	remotionRoot,
}: {
	outDir: string;
	environment: 'development' | 'production';
	remotionRoot: string;
}): [string, InlineConfig] => {
	const conf: InlineConfig = {
		plugins: [progress(), viteCommonjs()],
		root: remotionRoot,
		mode: environment,
		envPrefix: 'REMOTION_',
		build: {
			outDir,
			copyPublicDir: false,
		},
	};
	const hash = createHash('md5')
		.update(jsonStringifyWithCircularReferences(conf))
		.digest('hex');

	return [hash, conf];
};
