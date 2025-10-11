import type {
	AwsRegion,
	CustomCredentials,
	DeleteFunctionInput,
	DeleteRenderInput,
	EnhancedErrorInfo,
	EstimatePriceInput,
	GetAwsClientInput,
	GetAwsClientOutput,
	GetCompositionsOnLambdaInput,
	GetCompositionsOnLambdaOutput,
	GetFunctionsInput,
	GetOrCreateBucketInput,
	GetOrCreateBucketOutput,
	GetRenderProgressInput,
	GetSitesInput,
	GetSitesOutput,
	RenderMediaOnLambdaInput,
	RenderMediaOnLambdaOutput,
	RenderProgress,
	RenderStillOnLambdaInput,
	RenderStillOnLambdaOutput,
} from '@remotion/lambda-client';
import {
	deleteFunction,
	deleteRender,
	getRenderProgress as deprecatedGetRenderProgress,
	getSites as deprecatedGetSites,
	presignUrl as deprecatedPresignUrl,
	renderMediaOnLambda as deprecatedRenderMediaOnLambda,
	renderStillOnLambda as deprecatedRenderStillOnLambda,
	estimatePrice,
	getAwsClient,
	getCompositionsOnLambda,
	getFunctions,
	renderVideoOnLambda,
	validateWebhookSignature,
} from '@remotion/lambda-client';
import type {FunctionInfo} from '@remotion/serverless';
import {NoReactInternals} from 'remotion/no-react';
import type {DeleteSiteInput, DeleteSiteOutput} from './api/delete-site';
import {deleteSite} from './api/delete-site';
import type {
	DeployFunctionInput,
	DeployFunctionOutput,
} from './api/deploy-function';
import {deployFunction} from './api/deploy-function';
import type {DeploySiteInput, DeploySiteOutput} from './api/deploy-site';
import {deploySite} from './api/deploy-site';
import type {
	DownloadMediaInput,
	DownloadMediaOutput,
} from './api/download-media';
import {downloadMedia} from './api/download-media';
import type {GetFunctionInfoInput} from './api/get-function-info';
import {getFunctionInfo} from './api/get-function-info';
import {getOrCreateBucket} from './api/get-or-create-bucket';
import {getRegions} from './api/get-regions';
import type {
	SimulatePermissionsInput,
	SimulatePermissionsOutput,
} from './api/iam-validation/simulate';
import {simulatePermissions} from './api/iam-validation/simulate';
import {
	getRolePolicy,
	getUserPolicy,
} from './api/iam-validation/suggested-policy';
import {
	LambdaInternals,
	type _InternalOverallRenderProgress,
} from './internals';

export type {WebhookPayload} from '@remotion/lambda-client';

/**
 * @deprecated Import this from `@remotion/lambda-client` instead
 */
const renderMediaOnLambda = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? () => {
			throw new Error(
				'renderMediaOnLambda() has moved to `@remotion/lambda-client`. Please import it from there.',
			);
		}
	: deprecatedRenderMediaOnLambda;

/**
 * @deprecated Import this from `@remotion/lambda-client` instead
 */
const getRenderProgress = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? () => {
			throw new Error(
				'getRenderProgress() has moved to `@remotion/lambda-client`. Please import it from there.',
			);
		}
	: deprecatedGetRenderProgress;

/**
 * @deprecated Import this from `@remotion/lambda-client` instead
 */
const renderStillOnLambda = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? () => {
			throw new Error(
				'renderStillOnLambda() has moved to `@remotion/lambda-client`. Please import it from there.',
			);
		}
	: deprecatedRenderStillOnLambda;

/**
 * @deprecated Import this from `@remotion/lambda-client` instead
 */
const presignUrl = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? () => {
			throw new Error(
				'presignUrl() has moved to `@remotion/lambda-client`. Please import it from there.',
			);
		}
	: deprecatedPresignUrl;

/**
 * @deprecated Import this from `@remotion/lambda-client` instead
 */
const getSites = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? () => {
			throw new Error(
				'getSites() has moved to `@remotion/lambda-client`. Please import it from there.',
			);
		}
	: deprecatedGetSites;

export {
	deleteFunction,
	deleteRender,
	deleteSite,
	deployFunction,
	deploySite,
	downloadMedia,
	estimatePrice,
	getAwsClient,
	getCompositionsOnLambda,
	getFunctionInfo,
	getFunctions,
	getOrCreateBucket,
	getRegions,
	getRenderProgress,
	getRolePolicy,
	getSites,
	getUserPolicy,
	LambdaInternals,
	presignUrl,
	renderMediaOnLambda,
	renderStillOnLambda,
	renderVideoOnLambda,
	simulatePermissions,
	validateWebhookSignature,
};
export type {
	AwsRegion,
	CustomCredentials,
	DeleteFunctionInput,
	DeleteRenderInput,
	DeleteSiteInput,
	DeleteSiteOutput,
	DeployFunctionInput,
	DeployFunctionOutput,
	DeploySiteInput,
	DeploySiteOutput,
	DownloadMediaInput,
	DownloadMediaOutput,
	EnhancedErrorInfo,
	EstimatePriceInput,
	FunctionInfo,
	GetAwsClientInput,
	GetAwsClientOutput,
	GetCompositionsOnLambdaInput,
	GetCompositionsOnLambdaOutput,
	GetFunctionInfoInput,
	GetFunctionsInput,
	GetOrCreateBucketInput,
	GetOrCreateBucketOutput,
	GetRenderProgressInput,
	GetSitesInput,
	GetSitesOutput,
	RenderMediaOnLambdaInput,
	RenderMediaOnLambdaOutput,
	RenderProgress,
	RenderStillOnLambdaInput,
	RenderStillOnLambdaOutput,
	SimulatePermissionsInput,
	SimulatePermissionsOutput,
};

export {_InternalOverallRenderProgress};
