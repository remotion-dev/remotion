import {expect, test} from 'bun:test';
import type {
	BundlerOverrideFn,
	RspackOverrideFn,
	WebpackOverrideFn,
} from '../override-types';
import {rspackConfig} from '../rspack-config';
import {webpackConfig} from '../webpack-config';

const bundlerOverride: BundlerOverrideFn = (config, {bundler}) => ({
	...config,
	name: `shared-${bundler}`,
});

const webpackOverride: WebpackOverrideFn = (config) => ({
	...config,
	name: `${config.name}-webpack`,
});

const rspackOverride: RspackOverrideFn = (config) => ({
	...config,
	name: `${config.name}-rspack`,
});

const baseOptions = {
	entry: require.resolve('@remotion/studio/renderEntry'),
	userDefinedComponent: require.resolve('@remotion/studio/renderEntry'),
	outDir: null,
	environment: 'production' as const,
	onProgress: () => undefined,
	enableCaching: false,
	maxTimelineTracks: null,
	remotionRoot: process.cwd(),
	keyboardShortcutsEnabled: true,
	bufferStateDelayInMilliseconds: null,
	poll: null,
	askAIEnabled: true,
	interactivityEnabled: true,
	extraPlugins: [],
};

test('applies the shared override before the Webpack override', async () => {
	const [, config] = await webpackConfig({
		...baseOptions,
		bundlerOverride,
		webpackOverride,
	});

	expect(config.name).toBe('shared-webpack-webpack');
});

test('applies the shared override before the Rspack override', async () => {
	const [, config] = await rspackConfig({
		...baseOptions,
		bundlerOverride,
		rspackOverride,
	});

	expect(config.name).toBe('shared-rspack-rspack');
});
