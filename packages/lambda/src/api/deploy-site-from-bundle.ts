import {
	LambdaClientInternals,
	type AwsRegion,
	type RequestHandler,
} from '@remotion/lambda-client';
import type {ToOptions} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import {wrapWithErrorHandling} from '@remotion/renderer/error-handling';
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
	bundleDir: string;
};

type OptionalParameters = {
	siteName: string;
	options: DeploySiteWithBundleOptions;
	privacy: 'public' | 'no-acl';
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
} & ToOptions<typeof BrowserSafeApis.optionsMap.deploySiteLambda>;

export type DeploySiteFromBundleInput = MandatoryParameters &
	Partial<OptionalParameters>;

export type InternalDeploySiteFromBundleInput = MandatoryParameters &
	OptionalParameters & {
		indent: boolean;
	};

const mandatoryDeploySiteFromBundle = ({
	bucketName,
	bundleDir,
	region,
	siteName,
	options,
	privacy,
	throwIfSiteExists,
	forcePathStyle,
	requestHandler,
}: InternalDeploySiteFromBundleInput): DeploySiteFromBundleOutput => {
	const resolvedBundleDir = validateBundleDir(bundleDir);

	return deploySiteWithBundle({
		bucketName,
		region,
		siteName,
		options,
		privacy,
		throwIfSiteExists,
		forcePathStyle,
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
		bundleDir: args.bundleDir,
		region: args.region,
		options: args.options ?? {},
		privacy: args.privacy ?? 'public',
		siteName: args.siteName ?? LambdaClientInternals.randomHashImplementation(),
		indent: false,
		logLevel: args.logLevel ?? 'info',
		throwIfSiteExists: args.throwIfSiteExists ?? false,
		forcePathStyle: args.forcePathStyle ?? false,
		requestHandler: args.requestHandler ?? null,
	});
};
