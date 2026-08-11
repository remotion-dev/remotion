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
import {awsFullClientSpecifics} from '../functions/full-client-implementation';
import {
	deploySiteWithBundle,
	type DeploySiteOutput,
} from '../shared/deploy-site-with-bundle';

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

export type DeploySiteInput = MandatoryParameters & Partial<OptionalParameters>;

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

	let deploymentOutcome:
		| {type: 'success'; result: Awaited<DeploySiteOutput>}
		| {type: 'failure'; error: unknown};

	try {
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
				const bundleDir = await fullClientSpecifics.bundleSite({
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
					onDirectoryCreated: (directory) => {
						generatedBundleDir = directory;
					},
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

				generatedBundleDir = bundleDir;
				return bundleDir;
			},
		});
		deploymentOutcome = {type: 'success', result};
	} catch (error) {
		deploymentOutcome = {type: 'failure', error};
	}

	let cleanupFailed = false;
	let cleanupError: unknown;
	if (generatedBundleDir !== null) {
		try {
			fs.rmSync(generatedBundleDir, {
				force: true,
				recursive: true,
			});
		} catch (error) {
			cleanupFailed = true;
			cleanupError = error;
		}
	}

	if (deploymentOutcome.type === 'failure') {
		if (cleanupFailed) {
			throw new AggregateError(
				[deploymentOutcome.error, cleanupError],
				'Deploying the site failed, and removing the generated bundle also failed.',
				{cause: deploymentOutcome.error},
			);
		}

		throw deploymentOutcome.error;
	}

	if (cleanupFailed) {
		throw cleanupError;
	}

	return deploymentOutcome.result;
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
 * @description Bundles a Remotion project and deploys it to an S3 bucket for rendering on AWS Lambda.
 * @see [Documentation](https://remotion.dev/docs/lambda/deploysite)
 */
export const deploySite = (args: DeploySiteInput) => {
	return internalDeploySite({
		bucketName: args.bucketName,
		entryPoint: args.entryPoint,
		region: args.region,
		gitSource: args.gitSource ?? null,
		options: args.options ?? {},
		privacy: args.privacy ?? 'public',
		siteName:
			args.siteName ?? LambdaClientInternals.awsImplementation.randomHash(),
		indent: false,
		logLevel: 'info',
		throwIfSiteExists: args.throwIfSiteExists ?? false,
		providerSpecifics: LambdaClientInternals.awsImplementation,
		forcePathStyle: args.forcePathStyle ?? false,
		fullClientSpecifics: awsFullClientSpecifics,
		requestHandler: args.requestHandler ?? null,
	});
};
