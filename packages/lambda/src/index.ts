import type {
	EnhancedErrorInfo,
	FunctionInfo,
	LambdaErrorInfo,
} from '@remotion/serverless';
import type {
	CustomCredentials,
	GetOrCreateBucketInput,
	GetOrCreateBucketOutput,
} from '@remotion/serverless/client';
import {NoReactInternals} from 'remotion/no-react';
import type {DeleteFunctionInput} from './api/delete-function';
import {deleteFunction} from './api/delete-function';
import type {DeleteRenderInput} from './api/delete-render';
import {deleteRender} from './api/delete-render';
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
import type {EstimatePriceInput} from './api/estimate-price';
import {estimatePrice} from './api/estimate-price';
import type {GetAwsClientInput, GetAwsClientOutput} from './api/get-aws-client';
import {getAwsClient} from './api/get-aws-client';
import type {
	GetCompositionsOnLambdaInput,
	GetCompositionsOnLambdaOutput,
} from './api/get-compositions-on-lambda';
import {getCompositionsOnLambda} from './api/get-compositions-on-lambda';
import type {GetFunctionInfoInput} from './api/get-function-info';
import {getFunctionInfo} from './api/get-function-info';
import type {GetFunctionsInput} from './api/get-functions';
import {getFunctions} from './api/get-functions';
import {getOrCreateBucket} from './api/get-or-create-bucket';
import {getRegions} from './api/get-regions';
import type {GetRenderProgressInput} from './api/get-render-progress';
import {getRenderProgress as deprecatedGetRenderProgress} from './api/get-render-progress';
import type {GetSitesInput, GetSitesOutput} from './api/get-sites';
import {getSites as deprecatedGetSites} from './api/get-sites';
import type {
	SimulatePermissionsInput,
	SimulatePermissionsOutput,
} from './api/iam-validation/simulate';
import {simulatePermissions} from './api/iam-validation/simulate';
import {
	getRolePolicy,
	getUserPolicy,
} from './api/iam-validation/suggested-policy';
import {presignUrl as deprecatedPresignUrl} from './api/presign-url';
import type {
	RenderMediaOnLambdaInput,
	RenderMediaOnLambdaOutput,
} from './api/render-media-on-lambda';
import {
	renderMediaOnLambda as deprecatedRenderMediaOnLambda,
	renderVideoOnLambda,
} from './api/render-media-on-lambda';
import type {
	RenderStillOnLambdaInput,
	RenderStillOnLambdaOutput,
} from './api/render-still-on-lambda';
import {renderStillOnLambda as deprecatedRenderStillOnLambda} from './api/render-still-on-lambda';
import {validateWebhookSignature} from './api/validate-webhook-signature';
import {
	LambdaInternals,
	type _InternalAwsProvider,
	type _InternalOverallRenderProgress,
} from './internals';
import type {AwsRegion} from './regions';
import type {RenderProgress} from './shared/constants';

export type {WebhookPayload} from '@remotion/serverless';

/**
 * @deprecated Import this from `@remotion/lambda/client` instead
 */
const renderMediaOnLambda = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? () => {
			throw new Error(
				'renderMediaOnLambda() has moved to `@remotion/lambda/client`. Please import it from there.',
			);
		}
	: deprecatedRenderMediaOnLambda;

/**
 * @deprecated Import this from `@remotion/lambda/client` instead
 */
const getRenderProgress = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? () => {
			throw new Error(
				'getRenderProgress() has moved to `@remotion/lambda/client`. Please import it from there.',
			);
		}
	: deprecatedGetRenderProgress;

/**
 * @deprecated Import this from `@remotion/lambda/client` instead
 */
const renderStillOnLambda = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? () => {
			throw new Error(
				'renderStillOnLambda() has moved to `@remotion/lambda/client`. Please import it from there.',
			);
		}
	: deprecatedRenderStillOnLambda;

/**
 * @deprecated Import this from `@remotion/lambda/client` instead
 */
const presignUrl = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? () => {
			throw new Error(
				'presignUrl() has moved to `@remotion/lambda/client`. Please import it from there.',
			);
		}
	: deprecatedPresignUrl;

/**
 * @deprecated Import this from `@remotion/lambda/client` instead
 */
const getSites = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? () => {
			throw new Error(
				'getSites() has moved to `@remotion/lambda/client`. Please import it from there.',
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
	LambdaErrorInfo,
	RenderMediaOnLambdaInput,
	RenderMediaOnLambdaOutput,
	RenderProgress,
	RenderStillOnLambdaInput,
	RenderStillOnLambdaOutput,
	SimulatePermissionsInput,
	SimulatePermissionsOutput,
};

export {_InternalAwsProvider, _InternalOverallRenderProgress};
