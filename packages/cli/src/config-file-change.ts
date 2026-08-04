import {parse} from '@babel/parser';
import type {ConfigFileChangeType} from '@remotion/studio-shared';
import type {Config} from './config';

type ConfigMethodName = {
	[Key in keyof typeof Config]: (typeof Config)[Key] extends (
		...args: never[]
	) => unknown
		? Key
		: never;
}[keyof typeof Config] &
	string;

// Keep this exhaustive so every new Config method must declare its Studio lifecycle.
const configMethodLifecycles = {
	overrideBundlerConfig: 'restart',
	overrideDuration: 'runtime',
	overrideFfmpegCommand: 'runtime',
	overrideFps: 'runtime',
	overrideHeight: 'runtime',
	overrideRspackConfig: 'restart',
	overrideWebpackConfig: 'restart',
	overrideWidth: 'runtime',
	setAllowHtmlInCanvasEnabled: 'runtime',
	setAskAIEnabled: 'runtime',
	setAudioBitrate: 'runtime',
	setAudioCodec: 'runtime',
	setAudioLatencyHint: 'reload',
	setBeepOnFinish: 'runtime',
	setBenchmarkConcurrencies: 'runtime',
	setBenchmarkRuns: 'runtime',
	setBinariesDirectory: 'restart',
	setBrowserExecutable: 'runtime',
	setBufferStateDelayInMilliseconds: 'runtime',
	setBundleOutDir: 'runtime',
	setCachingEnabled: 'runtime',
	setChromeMode: 'runtime',
	setChromiumDarkMode: 'runtime',
	setChromiumDisableWebSecurity: 'runtime',
	setChromiumHeadlessMode: 'runtime',
	setChromiumIgnoreCertificateErrors: 'runtime',
	setChromiumMultiProcessOnLinux: 'runtime',
	setChromiumOpenGlRenderer: 'runtime',
	setChromiumUserAgent: 'runtime',
	setCodec: 'runtime',
	setColorSpace: 'runtime',
	setConcurrency: 'runtime',
	setCrf: 'runtime',
	setDefaultCodingAgent: 'runtime',
	setDefaultEditor: 'runtime',
	setDelayRenderTimeoutInMilliseconds: 'runtime',
	setDeleteAfter: 'runtime',
	setDisallowParallelEncoding: 'runtime',
	setDotEnvLocation: 'restart',
	setEnableCrossSiteIsolation: 'restart',
	setEnableFolderExpiry: 'runtime',
	setEncodingBufferSize: 'runtime',
	setEncodingMaxRate: 'runtime',
	setEnforceAudioTrack: 'runtime',
	setEntryPoint: 'restart',
	setEveryNthFrame: 'runtime',
	setExperimentalRspackEnabled: 'restart',
	setForSeamlessAacConcatenation: 'runtime',
	setForceNewStudioEnabled: 'restart',
	setFrameRange: 'runtime',
	setGopSize: 'runtime',
	setHardwareAcceleration: 'runtime',
	setIPv4: 'restart',
	setImageFormat: 'runtime',
	setImageSequence: 'runtime',
	setImageSequencePattern: 'runtime',
	setInteractivityEnabled: 'runtime',
	setJpegQuality: 'runtime',
	setKeyboardShortcutsEnabled: 'runtime',
	setLambdaInsights: 'runtime',
	setLevel: 'restart',
	setLogLevel: 'restart',
	setMaxTimelineTracks: 'runtime',
	setMetadata: 'runtime',
	setMuted: 'runtime',
	setNumberOfGifLoops: 'runtime',
	setNumberOfSharedAudioTags: 'reload',
	setOffthreadVideoCacheSizeInBytes: 'runtime',
	setOutputLocation: 'runtime',
	setOverwriteOutput: 'runtime',
	setPixelFormat: 'runtime',
	setPort: 'restart',
	setPreferLosslessAudio: 'runtime',
	setPreviewSampleRate: 'reload',
	setProResProfile: 'runtime',
	setPublicDir: 'restart',
	setPublicLicenseKey: 'runtime',
	setPublicPath: 'runtime',
	setQuality: 'runtime',
	setRendererPort: 'restart',
	setRepro: 'runtime',
	setRspack: 'restart',
	setSampleRate: 'runtime',
	setScale: 'runtime',
	setShouldOpenBrowser: 'restart',
	setStillImageFormat: 'runtime',
	setStudioPort: 'restart',
	setTimeoutInMilliseconds: 'runtime',
	setVideoBitrate: 'runtime',
	setVideoImageFormat: 'runtime',
	setWebpackPollingInMilliseconds: 'restart',
	setX264Preset: 'runtime',
} satisfies Record<ConfigMethodName, ConfigFileChangeType>;

const getConfigMethodsWithLifecycle = (lifecycle: ConfigFileChangeType) => {
	return new Set(
		Object.entries(configMethodLifecycles)
			.filter(([, value]) => value === lifecycle)
			.map(([methodName]) => methodName),
	);
};

const runtimeConfigMethods = getConfigMethodsWithLifecycle('runtime');
const reloadConfigMethods = getConfigMethodsWithLifecycle('reload');

const ignoredAstProperties = new Set([
	'comments',
	'end',
	'errors',
	'extra',
	'loc',
	'start',
]);

const getStaticPropertyName = (node: unknown): string | null => {
	if (!node || typeof node !== 'object') {
		return null;
	}

	const candidate = node as {type?: string; name?: string; value?: unknown};
	if (candidate.type === 'Identifier') {
		return candidate.name ?? null;
	}

	if (candidate.type === 'StringLiteral') {
		return typeof candidate.value === 'string' ? candidate.value : null;
	}

	return null;
};

const getConfigMethodName = (node: unknown): string | null => {
	if (!node || typeof node !== 'object') {
		return null;
	}

	const callExpression = node as {
		type?: string;
		callee?: unknown;
	};
	if (
		callExpression.type !== 'CallExpression' ||
		!callExpression.callee ||
		typeof callExpression.callee !== 'object'
	) {
		return null;
	}

	const callee = callExpression.callee as {
		type?: string;
		object?: unknown;
		property?: unknown;
	};
	if (callee.type !== 'MemberExpression') {
		return null;
	}

	const methodName = getStaticPropertyName(callee.property);
	if (!methodName || !callee.object || typeof callee.object !== 'object') {
		return null;
	}

	const configObject = callee.object as {
		type?: string;
		property?: unknown;
		name?: string;
	};
	if (
		(configObject.type === 'Identifier' && configObject.name === 'Config') ||
		(configObject.type === 'MemberExpression' &&
			getStaticPropertyName(configObject.property) === 'Config')
	) {
		return methodName;
	}

	return null;
};

const isConfigRequire = (node: unknown) => {
	if (!node || typeof node !== 'object') {
		return false;
	}

	const declarator = node as {type?: string; init?: unknown};
	if (
		declarator.type !== 'VariableDeclarator' ||
		!declarator.init ||
		typeof declarator.init !== 'object'
	) {
		return false;
	}

	const init = declarator.init as {
		type?: string;
		callee?: unknown;
		arguments?: unknown[];
	};
	if (
		init.type !== 'CallExpression' ||
		!init.callee ||
		typeof init.callee !== 'object' ||
		(init.callee as {type?: string; name?: string}).type !== 'Identifier' ||
		(init.callee as {type?: string; name?: string}).name !== 'require' ||
		init.arguments?.length !== 1
	) {
		return false;
	}

	const source = init.arguments[0] as {type?: string; value?: unknown};
	return (
		source?.type === 'StringLiteral' && source.value === '@remotion/cli/config'
	);
};

const makeConfigFingerprint = ({
	code,
	ignoredConfigMethods,
}: {
	code: string;
	ignoredConfigMethods: Set<string>;
}) => {
	const ast = parse(code, {sourceType: 'unambiguous'});
	const omit = Symbol('omit');

	const normalize = (value: unknown): unknown => {
		if (Array.isArray(value)) {
			return value
				.map(normalize)
				.filter((normalizedValue) => normalizedValue !== omit);
		}

		if (!value || typeof value !== 'object') {
			return value;
		}

		const node = value as {
			type?: string;
			declarations?: unknown[];
			expression?: unknown;
		};
		const expressionConfigMethodName = getConfigMethodName(node.expression);
		if (
			node.type === 'ExpressionStatement' &&
			expressionConfigMethodName &&
			ignoredConfigMethods.has(expressionConfigMethodName)
		) {
			return omit;
		}

		if (
			node.type === 'VariableDeclaration' &&
			node.declarations?.length &&
			node.declarations.every(isConfigRequire)
		) {
			return omit;
		}

		const configMethodName = getConfigMethodName(value);
		if (configMethodName && ignoredConfigMethods.has(configMethodName)) {
			return {type: 'IgnoredConfigCall'};
		}

		return Object.fromEntries(
			Object.entries(value)
				.filter(([key]) => !ignoredAstProperties.has(key))
				.map(([key, child]) => [key, normalize(child)]),
		);
	};

	return JSON.stringify(normalize(ast));
};

export type ConfigFileFingerprints = {
	reload: string;
	restart: string;
};

export const makeConfigFileFingerprints = (
	code: string,
): ConfigFileFingerprints => {
	return {
		reload: makeConfigFingerprint({
			code,
			ignoredConfigMethods: runtimeConfigMethods,
		}),
		restart: makeConfigFingerprint({
			code,
			ignoredConfigMethods: new Set([
				...runtimeConfigMethods,
				...reloadConfigMethods,
			]),
		}),
	};
};

export const classifyConfigFileChange = ({
	currentCode,
	startupFingerprints,
}: {
	currentCode: string;
	startupFingerprints: ConfigFileFingerprints;
}): ConfigFileChangeType => {
	const currentFingerprints = makeConfigFileFingerprints(currentCode);
	if (currentFingerprints.restart !== startupFingerprints.restart) {
		return 'restart';
	}

	if (currentFingerprints.reload !== startupFingerprints.reload) {
		return 'reload';
	}

	return 'runtime';
};
