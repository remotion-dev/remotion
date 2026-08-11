const fs = require('fs/promises');
const {spawn} = require('child_process');
const {createRequire} = require('module');
const path = require('path');

const docusaurusRequire = createRequire(
	require.resolve('@docusaurus/core/lib/commands/build/buildLocale'),
);

const logger = docusaurusRequire('@docusaurus/logger').default;
const {PerfLogger} = docusaurusRequire('@docusaurus/logger');
const {compile, registerBundlerTracing} = docusaurusRequire(
	'@docusaurus/bundler',
);
const {loadSite} = docusaurusRequire('@docusaurus/core/lib/server/site');
const {createConfigureWebpackUtils, executePluginsConfigureWebpack} =
	docusaurusRequire('@docusaurus/core/lib/webpack/configure');
const {createBuildClientConfig} = docusaurusRequire(
	'@docusaurus/core/lib/webpack/client',
);
const createServerConfig = docusaurusRequire(
	'@docusaurus/core/lib/webpack/server',
).default;
const {executeSSG} = docusaurusRequire('@docusaurus/core/lib/ssg/ssgExecutor');
const clearPath = docusaurusRequire(
	'@docusaurus/core/lib/commands/utils/clearPath',
).default;
const {handleBrokenLinks} = docusaurusRequire(
	'@docusaurus/core/lib/server/brokenLinks',
);

const locale = 'en';
const phases = ['client', 'server', 'ssg'];

const mapValues = (object, mapper) =>
	Object.fromEntries(
		Object.entries(object).map(([key, value]) => [key, mapper(value)]),
	);

const configureDocusaurusEnv = () => {
	process.env.BABEL_ENV = 'production';
	process.env.NODE_ENV = 'production';
	process.env.DOCUSAURUS_CURRENT_LOCALE = locale;
};

const getBuildPaths = (props) => {
	const router = props.siteConfig.future.experimental_router;

	return {
		clientManifestPath: path.join(
			props.generatedFilesDir,
			'client-manifest.json',
		),
		router,
		serverBundlePath:
			router === 'hash'
				? undefined
				: path.join(props.outDir, '__server', 'server.bundle.js'),
	};
};

const loadLowMemorySite = async () => {
	const siteDir = await fs.realpath(process.cwd());

	return PerfLogger.async('Load site', () =>
		loadSite({
			siteDir,
			locale,
			automaticBaseUrlLocalizationDisabled: false,
		}),
	);
};

const createConfigureUtils = async (props) => {
	return createConfigureWebpackUtils({siteConfig: props.siteConfig});
};

const createClientConfig = async ({props, configureWebpackUtils}) => {
	const {plugins} = props;
	const result = await createBuildClientConfig({
		props,
		minify: true,
		faster: props.siteConfig.future.faster,
		configureWebpackUtils,
		bundleAnalyzer: false,
	});

	return {
		clientConfig: executePluginsConfigureWebpack({
			plugins,
			config: result.config,
			isServer: false,
			configureWebpackUtils,
		}),
		clientManifestPath: result.clientManifestPath,
	};
};

const createServerBuild = async ({props, configureWebpackUtils}) => {
	const {plugins} = props;
	const result = await createServerConfig({
		props,
		configureWebpackUtils,
	});
	const serverConfig = executePluginsConfigureWebpack({
		plugins,
		config: result.config,
		isServer: true,
		configureWebpackUtils,
	});

	return {
		serverBundlePath: result.serverBundlePath,
		serverConfig: tuneServerConfigForLowMemory(serverConfig),
	};
};

const tuneServerConfigForLowMemory = (config) => {
	return {
		...config,
		cache: false,
		devtool: false,
		mode: 'none',
		parallelism: Number(
			process.env.REMOTION_DOCS_WEBPACK_SERVER_PARALLELISM ?? 1,
		),
		optimization: {
			...config.optimization,
			chunkIds: 'named',
			concatenateModules: false,
			flagIncludedChunks: false,
			innerGraph: false,
			mangleExports: false,
			mergeDuplicateChunks: false,
			minimize: false,
			moduleIds: 'named',
			providedExports: false,
			realContentHash: false,
			removeAvailableModules: false,
			removeEmptyChunks: false,
			sideEffects: false,
			splitChunks: false,
			usedExports: false,
		},
	};
};

const compileConfigs = async ({
	label,
	props,
	configureWebpackUtils,
	configs,
}) => {
	const cleanupBundlerTracing = await registerBundlerTracing({
		currentBundler: props.currentBundler,
	});

	try {
		await PerfLogger.async(
			`Bundling ${label} with ${props.currentBundler.name}`,
			() =>
				compile({
					configs,
					currentBundler: configureWebpackUtils.currentBundler,
				}),
		);
	} finally {
		await cleanupBundlerTracing();
	}
};

const runClientPhase = async () => {
	logger.info`name=${`[${locale}]`} Building client bundle in low-memory mode...`;

	const site = await loadLowMemorySite();
	const {props} = site;
	const configureWebpackUtils = await createConfigureUtils(props);
	const {clientConfig} = await PerfLogger.async(
		`Creating ${props.currentBundler.name} client bundler config`,
		() =>
			Promise.all([
				createClientConfig({props, configureWebpackUtils}),
				clearPath(props.outDir),
			]).then(([client]) => client),
	);

	await compileConfigs({
		label: 'client',
		props,
		configureWebpackUtils,
		configs: [clientConfig],
	});
};

const runServerPhase = async () => {
	const site = await loadLowMemorySite();
	const {props} = site;
	const {router} = getBuildPaths(props);

	if (router === 'hash') {
		logger.info`Skipping server bundle for hash router.`;
		return;
	}

	logger.info`name=${`[${locale}]`} Building server bundle in low-memory mode...`;

	const configureWebpackUtils = await createConfigureUtils(props);
	const {serverConfig} = await PerfLogger.async(
		`Creating ${props.currentBundler.name} server bundler config`,
		() => createServerBuild({props, configureWebpackUtils}),
	);

	await compileConfigs({
		label: 'server',
		props,
		configureWebpackUtils,
		configs: [serverConfig],
	});
};

const cleanupServerBundle = async (serverBundlePath) => {
	if (!serverBundlePath) {
		return;
	}

	if (process.env.DOCUSAURUS_KEEP_SERVER_BUNDLE === 'true') {
		logger.warn(
			"Will NOT delete server bundle because DOCUSAURUS_KEEP_SERVER_BUNDLE='true'",
		);
		return;
	}

	await PerfLogger.async('Deleting server bundle', async () => {
		await fs.rm(path.dirname(serverBundlePath), {
			recursive: true,
			force: true,
		});
	});
};

const executePluginsPostBuild = async ({plugins, props, collectedData}) => {
	const head = props.siteConfig.future.v4.removeLegacyPostBuildHeadAttribute
		? {}
		: mapValues(collectedData, (data) => data.metadata.helmet);
	const routesBuildMetadata = mapValues(
		collectedData,
		(data) => data.metadata.public,
	);

	await Promise.all(
		plugins.map(async (plugin) => {
			if (!plugin.postBuild) {
				return;
			}

			await plugin.postBuild({
				...props,
				head,
				routesBuildMetadata,
				content: plugin.content,
			});
		}),
	);
};

const executeBrokenLinksCheck = async ({props, collectedData}) => {
	const collectedLinks = mapValues(collectedData, (data) => ({
		links: data.links,
		anchors: data.anchors,
	}));

	await handleBrokenLinks({
		collectedLinks,
		routes: props.routes,
		onBrokenLinks: props.siteConfig.onBrokenLinks,
		onBrokenAnchors: props.siteConfig.onBrokenAnchors,
	});
};

const runSsgPhase = async () => {
	logger.info`name=${`[${locale}]`} Generating static HTML in low-memory mode...`;

	const site = await loadLowMemorySite();
	const {props} = site;
	const {clientManifestPath, router, serverBundlePath} = getBuildPaths(props);

	const {collectedData} = await PerfLogger.async('SSG', () =>
		executeSSG({
			props,
			serverBundlePath,
			clientManifestPath,
			router,
		}),
	);

	await cleanupServerBundle(serverBundlePath);

	await PerfLogger.async('postBuild()', () =>
		executePluginsPostBuild({plugins: props.plugins, props, collectedData}),
	);
	await PerfLogger.async('Broken links checker', () =>
		executeBrokenLinksCheck({props, collectedData}),
	);

	logger.success`Generated static files in path=${path.relative(
		process.cwd(),
		props.outDir,
	)}.`;
	logger.info`Use code=${'npm run serve'} command to test your build locally.`;
};

const runPhaseInSubprocess = (phase) => {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, ['--expose-gc', __filename, phase], {
			env: process.env,
			stdio: 'inherit',
		});

		child.on('error', reject);
		child.on('exit', (code, signal) => {
			if (code === 0) {
				resolve();
				return;
			}

			reject(
				new Error(
					`Docusaurus low-memory ${phase} phase exited with code ${code}, signal ${signal}`,
				),
			);
		});
	});
};

const runAllPhases = async () => {
	logger.info`name=${`[${locale}]`} Creating an optimized production build...`;

	for (const phase of phases) {
		await runPhaseInSubprocess(phase);
	}
};

const main = async () => {
	configureDocusaurusEnv();

	const phase = process.argv[2] ?? 'all';

	if (phase === 'all') {
		await runAllPhases();
		return;
	}

	switch (phase) {
		case 'client':
			await runClientPhase();
			return;
		case 'server':
			await runServerPhase();
			return;
		case 'ssg':
			await runSsgPhase();
			return;
		default:
			throw new Error(
				`Unknown low-memory Docusaurus phase "${phase}". Expected all, ${phases.join(
					', ',
				)}.`,
			);
	}
};

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
