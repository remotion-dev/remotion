import path from 'node:path';
import type {AwsRegion, RequestHandler} from '@remotion/lambda-client';
import {LambdaClientInternals, type AwsProvider} from '@remotion/lambda-client';
import {RenderInternals, type ToOptions} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import {wrapWithErrorHandling} from '@remotion/renderer/error-handling';
import type {
	FullClientSpecifics,
	ProviderSpecifics,
} from '@remotion/serverless';
import {awsFullClientSpecifics} from '../functions/full-client-implementation';
import {
	deploySiteWithBundle,
	type DeploySiteOutput,
	type DeploySiteWithBundleOptions,
} from '../shared/deploy-site-with-bundle';
import {validateBundleDir} from '../shared/validate-bundle-dir';

export type DeploySiteFromBundleOutput = DeploySiteOutput;

type MandatoryParameters = {
	bucketName: string;
	region: AwsRegion;
};

type OptionalParameters = {
	bundleDir: string;
	siteName: string;
	options: DeploySiteWithBundleOptions;
	privacy: 'public' | 'no-acl';
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
} & ToOptions<typeof BrowserSafeApis.optionsMap.deploySiteLambda>;

export type DeploySiteFromBundleInput = MandatoryParameters &
	Partial<OptionalParameters>;

export type InternalDeploySiteFromBundleInput = MandatoryParameters &
	Omit<OptionalParameters, 'bundleDir'> & {
		bundleDir: string | null;
		indent: boolean;
		providerSpecifics: ProviderSpecifics<AwsProvider>;
		fullClientSpecifics: FullClientSpecifics<AwsProvider>;
	};

export const getDefaultBundleDir = () => {
	return path.join(RenderInternals.findRemotionRoot(), 'build');
};

const mandatoryDeploySiteFromBundle = ({
	bucketName,
	bundleDir,
	region,
	siteName,
	options,
	privacy,
	throwIfSiteExists,
	providerSpecifics,
	forcePathStyle,
	fullClientSpecifics,
	requestHandler,
}: InternalDeploySiteFromBundleInput): DeploySiteFromBundleOutput => {
	const resolvedBundleDir = validateBundleDir(
		bundleDir ?? getDefaultBundleDir(),
	);

	return deploySiteWithBundle({
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
		getBundle: () => Promise.resolve(resolvedBundleDir),
	});
};

export const internalDeploySiteFromBundle: (
	input: InternalDeploySiteFromBundleInput,
) => DeploySiteFromBundleOutput = wrapWithErrorHandling(
	mandatoryDeploySiteFromBundle,
);

/*
 * @description Deploys an existing Remotion bundle to an S3 bucket without bundling it again.
 * @see [Documentation](https://remotion.dev/docs/lambda/deploysitefrombundle)
 */
export const deploySiteFromBundle = (args: DeploySiteFromBundleInput) => {
	return internalDeploySiteFromBundle({
		bucketName: args.bucketName,
		bundleDir: args.bundleDir ?? null,
		region: args.region,
		options: args.options ?? {},
		privacy: args.privacy ?? 'public',
		siteName:
			args.siteName ?? LambdaClientInternals.awsImplementation.randomHash(),
		indent: false,
		logLevel: args.logLevel ?? 'info',
		throwIfSiteExists: args.throwIfSiteExists ?? false,
		providerSpecifics: LambdaClientInternals.awsImplementation,
		forcePathStyle: args.forcePathStyle ?? false,
		fullClientSpecifics: awsFullClientSpecifics,
		requestHandler: args.requestHandler ?? null,
	});
};
