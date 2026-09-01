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

test('enables incremental chunk graphs for Rspack development builds', async () => {
	const [, config] = await rspackConfig({
		...baseOptions,
		environment: 'development',
		bundlerOverride: (configuration) => configuration,
		rspackOverride: (configuration) => configuration,
	});

	expect(config.experiments?.incremental).toEqual({buildChunkGraph: true});
});

test('includes React Scan only in an explicitly enabled development bundle', async () => {
	const previousEndpoint = process.env.REMOTION_REACT_SCAN_ENDPOINT;
	const previousEntryPoint = process.env.REMOTION_REACT_SCAN_ENTRY_POINT;
	const previousSessionId = process.env.REMOTION_REACT_SCAN_SESSION_ID;
	process.env.REMOTION_REACT_SCAN_ENDPOINT =
		'http://127.0.0.1:4321/ingest/test';
	process.env.REMOTION_REACT_SCAN_ENTRY_POINT =
		'/internal/react-scan/client.ts';
	process.env.REMOTION_REACT_SCAN_SESSION_ID = 'test';

	try {
		const [, productionWebpackConfig] = await webpackConfig({
			...baseOptions,
			bundlerOverride: (config) => config,
			webpackOverride: (config) => config,
		});
		const [, productionRspackConfig] = await rspackConfig({
			...baseOptions,
			bundlerOverride: (config) => config,
			rspackOverride: (config) => config,
		});
		const [, developmentWebpackConfig] = await webpackConfig({
			...baseOptions,
			bundlerOverride: (config) => config,
			environment: 'development',
			webpackOverride: (config) => config,
		});
		const [, developmentRspackConfig] = await rspackConfig({
			...baseOptions,
			bundlerOverride: (config) => config,
			environment: 'development',
			rspackOverride: (config) => config,
		});

		for (const config of [productionWebpackConfig, productionRspackConfig]) {
			expect(Array.isArray(config.entry)).toBe(true);
			expect(
				(config.entry as string[]).some((entry) =>
					entry.includes('react-scan'),
				),
			).toBe(false);
		}

		for (const config of [
			productionWebpackConfig,
			productionRspackConfig,
			developmentWebpackConfig,
			developmentRspackConfig,
		]) {
			expect(Array.isArray(config.entry)).toBe(true);
			expect(
				(config.entry as string[]).some((entry) =>
					entry.includes('setup-sequence-stack-traces'),
				),
			).toBe(true);
		}

		for (const config of [developmentWebpackConfig, developmentRspackConfig]) {
			expect(Array.isArray(config.entry)).toBe(true);
			expect(
				(config.entry as string[]).some((entry) =>
					entry.includes('react-scan'),
				),
			).toBe(true);
		}
	} finally {
		if (previousEndpoint === undefined) {
			delete process.env.REMOTION_REACT_SCAN_ENDPOINT;
		} else {
			process.env.REMOTION_REACT_SCAN_ENDPOINT = previousEndpoint;
		}

		if (previousEntryPoint === undefined) {
			delete process.env.REMOTION_REACT_SCAN_ENTRY_POINT;
		} else {
			process.env.REMOTION_REACT_SCAN_ENTRY_POINT = previousEntryPoint;
		}

		if (previousSessionId === undefined) {
			delete process.env.REMOTION_REACT_SCAN_SESSION_ID;
		} else {
			process.env.REMOTION_REACT_SCAN_SESSION_ID = previousSessionId;
		}
	}
});
