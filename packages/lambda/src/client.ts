import type {DeleteRenderInput} from './api/delete-render';
import {deleteRender} from './api/delete-render';
import {getCompositionsOnLambda} from './api/get-compositions-on-lambda';
import {getFunctions} from './api/get-functions';
import type {GetRenderProgressInput} from './api/get-render-progress';
import {getRenderProgress} from './api/get-render-progress';
import {getSites} from './api/get-sites';
import type {PresignUrlInput} from './api/presign-url';
import {presignUrl} from './api/presign-url';
import type {
	RenderMediaOnLambdaInput,
	RenderMediaOnLambdaOutput,
} from './api/render-media-on-lambda';
import {
	renderMediaOnLambda,
	renderVideoOnLambda,
} from './api/render-media-on-lambda';
import type {
	RenderStillOnLambdaInput,
	RenderStillOnLambdaOutput,
} from './api/render-still-on-lambda';
import {renderStillOnLambda} from './api/render-still-on-lambda';
import type {SpeculateFunctionNameInput} from './api/speculate-function-name';
import {speculateFunctionName} from './api/speculate-function-name';
import {validateWebhookSignature} from './api/validate-webhook-signature';
import type {RenderProgress} from './shared/constants';
import type {WebhookPayload} from './shared/invoke-webhook';

export {CustomCredentials, DeleteAfter} from '@remotion/serverless/client';
export {
	GetAwsClientInput,
	GetAwsClientOutput,
	getAwsClient,
} from './api/get-aws-client';
export type {AwsRegion} from './regions';
export {
	deleteRender,
	getCompositionsOnLambda,
	getFunctions,
	getRenderProgress,
	getSites,
	presignUrl,
	renderMediaOnLambda,
	renderStillOnLambda,
	renderVideoOnLambda,
	speculateFunctionName,
	validateWebhookSignature,
};
export type {
	DeleteRenderInput,
	GetRenderProgressInput,
	PresignUrlInput,
	RenderMediaOnLambdaInput,
	RenderMediaOnLambdaOutput,
	RenderProgress,
	RenderStillOnLambdaInput,
	RenderStillOnLambdaOutput,
	SpeculateFunctionNameInput,
	WebhookPayload,
};
