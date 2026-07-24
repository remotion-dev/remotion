import fs from 'node:fs';
import {
	type BundlerOverrideFn,
	type GitSource,
	type RspackOverrideFn,
	type WebpackOverrideFn,
} from '@remotion/bundler';
import type {AwsRegion, RequestHandler} from '@remotion/lambda-client';
import {LambdaClientInternals, type AwsProvider} from '@remotion/lambda-client';
import {getSitesKey} from '@remotion/lambda-client/constants';
import type {ToOptions} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import {wrapWithErrorHandling} from '@remotion/renderer/error-handling';
import type {
	FullClientSpecifics,
	ProviderSpecifics,
	UploadDirProgress,
} from '@remotion/serverless';
import {NoReactInternals} from 'remotion/no-react';
import {awsFullClientSpecifics} from '../functions/full-client-implementation';
import {
	deploySiteWithBundle,
	type DeploySiteOutput,
} from '../shared/deploy-site-with-bundle';
import type {DeploySiteFromBundleInput} from './deploy-site-from-bundle';
import {deploySiteFromBundle} from './deploy-site-from-bundle';

export type {DeploySiteOutput};

type MandatoryParameters = {
	entryPoint: string;
	bucketName: string;
	region: AwsRegion;
};

type OptionalParameters = {
	siteName: string;
	options: {
		onBundleProgress?: (progress: number) => void;
		onUploadProgress?: (upload: UploadDirProgress) => void;
		onDiffingProgress?: (bytes: number, done: boolean) => void;
		bundlerOverride?: BundlerOverrideFn;
		rspackOverride?: RspackOverrideFn;
		webpackOverride?: WebpackOverrideFn;
		ignoreRegisterRootWarning?: boolean;
		enableCaching?: boolean;
		publicDir?: string | null;
		rootDir?: string;
		bypassBucketNameValidation?: boolean;
		keyboardShortcutsEnabled?: boolean;
		askAIEnabled?: boolean;
		interactivityEnabled?: boolean;
		rspack?: boolean;
	};
	privacy: 'public' | 'no-acl';
	gitSource: GitSource | null;
	indent: boolean;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
} & ToOptions<typeof BrowserSafeApis.optionsMap.deploySiteLambda>;

/**
 * @deprecated In Remotion v5, build the project using `bundle()` and pass the resulting `bundleDir` to `deploySite()`.
 */
export type LegacyDeploySiteInput = MandatoryParameters &
	Partial<OptionalParameters> & {
		bundleDir?: never;
	};

export type DeploySiteWithBundleInput = DeploySiteFromBundleInput & {
	entryPoint?: never;
};

export type DeploySiteInputForVersion<EnableV5BreakingChanges extends boolean> =
	EnableV5BreakingChanges extends true
		? DeploySiteWithBundleInput
		: LegacyDeploySiteInput | DeploySiteWithBundleInput;

export type DeploySiteInput = DeploySiteInputForVersion<
	typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES
>;

export const resolveDeploySiteMode = (
	args: {entryPoint?: unknown; bundleDir?: unknown},
	enableV5BreakingChanges: boolean,
): 'bundle-dir' | 'entry-point' => {
	const hasBundleDir = Object.prototype.hasOwnProperty.call(args, 'bundleDir');
	const hasEntryPoint = Object.prototype.hasOwnProperty.call(
		args,
		'entryPoint',
	);

	if (hasBundleDir === hasEntryPoint) {
		throw new TypeError(
			'Pass exactly one of `bundleDir` or `entryPoint` to deploySite().',
		);
	}

	if (hasBundleDir) {
		if (typeof args.bundleDir !== 'string') {
			throw new TypeError('`bundleDir` must be a string.');
		}

		return 'bundle-dir';
	}

	if (typeof args.entryPoint !== 'string') {
		throw new TypeError('`entryPoint` must be a string.');
	}

	if (enableV5BreakingChanges) {
		throw new TypeError(
			'In Remotion v5, deploySite() does not bundle projects. Call bundle() from `@remotion/bundler` first and pass the resulting directory as `bundleDir`.',
		);
	}

	return 'entry-point';
};

const mandatoryDeploySite = async ({
	bucketName,
	entryPoint,
	siteName,
	options,
	region,
	privacy,
	gitSource,
	throwIfSiteExists,
	providerSpecifics,
	forcePathStyle,
	fullClientSpecifics,
	requestHandler,
}: MandatoryParameters &
	OptionalParameters & {
		providerSpecifics: ProviderSpecifics<AwsProvider>;
		fullClientSpecifics: FullClientSpecifics<AwsProvider>;
	}): DeploySiteOutput => {
	let generatedBundleDir: string | null = null;

	const result = await deploySiteWithBundle({
		bucketName,
		region,
		siteName,
		options,
		privacy,
		throwIfSiteExists,
		providerSpecifics,
		forcePathStyle,
		fullClientSpecifics,
		requestHandler,
		getBundle: async () => {
			generatedBundleDir = await fullClientSpecifics.bundleSite({
				publicPath: `/${getSitesKey(siteName)}/`,
				bundlerOverride: options.bundlerOverride ?? ((f) => f),
				rspackOverride: options.rspackOverride ?? ((f) => f),
				webpackOverride: options.webpackOverride ?? ((f) => f),
				enableCaching: options.enableCaching ?? true,
				publicDir: options.publicDir ?? null,
				rootDir: options.rootDir ?? null,
				ignoreRegisterRootWarning: options.ignoreRegisterRootWarning ?? false,
				onProgress: options.onBundleProgress ?? (() => undefined),
				entryPoint,
				gitSource,
				bufferStateDelayInMilliseconds: null,
				maxTimelineTracks: null,
				onDirectoryCreated: () => undefined,
				onPublicDirCopyProgress: () => undefined,
				onSymlinkDetected: () => undefined,
				outDir: null,
				askAIEnabled: options.askAIEnabled ?? true,
				interactivityEnabled: options.interactivityEnabled ?? true,
				audioLatencyHint: null,
				keyboardShortcutsEnabled: options.keyboardShortcutsEnabled ?? true,
				renderDefaults: null,
				rspack: options.rspack ?? false,
				symlinkPublicDir: false,
			});

			return generatedBundleDir;
		},
	});

	if (generatedBundleDir && fs.existsSync(generatedBundleDir)) {
		fs.rmSync(generatedBundleDir, {
			recursive: true,
		});
	}

	return result;
};

export type InternalDeploySiteInput = MandatoryParameters &
	OptionalParameters & {
		providerSpecifics: ProviderSpecifics<AwsProvider>;
		fullClientSpecifics: FullClientSpecifics<AwsProvider>;
	};

export const internalDeploySite: (
	input: InternalDeploySiteInput,
) => DeploySiteOutput = wrapWithErrorHandling(mandatoryDeploySite);

/*
 * @description Deploys a Remotion bundle to an S3 bucket for rendering on AWS Lambda. In Remotion v4, an entry point may be passed instead to bundle and deploy in one step.
 * @see [Documentation](https://remotion.dev/docs/lambda/deploysite)
 */
export const deploySite = (args: DeploySiteInput) => {
	const mode = resolveDeploySiteMode(
		args,
		NoReactInternals.ENABLE_V5_BREAKING_CHANGES,
	);

	if (mode === 'bundle-dir') {
		return deploySiteFromBundle(args as DeploySiteWithBundleInput);
	}

	const legacyArgs = args as unknown as LegacyDeploySiteInput;
	return internalDeploySite({
		bucketName: legacyArgs.bucketName,
		entryPoint: legacyArgs.entryPoint,
		region: legacyArgs.region,
		gitSource: legacyArgs.gitSource ?? null,
		options: legacyArgs.options ?? {},
		privacy: legacyArgs.privacy ?? 'public',
		siteName:
			legacyArgs.siteName ??
			LambdaClientInternals.awsImplementation.randomHash(),
		indent: false,
		logLevel: 'info',
		throwIfSiteExists: legacyArgs.throwIfSiteExists ?? false,
		providerSpecifics: LambdaClientInternals.awsImplementation,
		forcePathStyle: legacyArgs.forcePathStyle ?? false,
		fullClientSpecifics: awsFullClientSpecifics,
		requestHandler: legacyArgs.requestHandler ?? null,
	});
};
