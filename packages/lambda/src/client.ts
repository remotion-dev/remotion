import {getCompositionsOnLambda} from './api/get-compositions-on-lambda';
import {getFunctions} from './api/get-functions';
import {getRegions} from './api/get-regions';
import {getRenderProgress} from './api/get-render-progress';
import {getSites} from './api/get-sites';
import {
	getRolePolicy,
	getUserPolicy,
} from './api/iam-validation/suggested-policy';
import type {PresignUrlInput} from './api/presign-url';
import {presignUrl} from './api/presign-url';
import {
	renderMediaOnLambda,
	renderVideoOnLambda,
} from './api/render-media-on-lambda';
import {renderStillOnLambda} from './api/render-still-on-lambda';
import {validateWebhookSignature} from './api/validate-webhook-signature';
import type {AwsRegion} from './pricing/aws-regions';
import type {RenderProgress} from './shared/constants';
import type {WebhookPayload} from './shared/invoke-webhook';

export {
	renderVideoOnLambda,
	renderMediaOnLambda,
	renderStillOnLambda,
	getRenderProgress,
	getFunctions,
	validateWebhookSignature,
	getCompositionsOnLambda,
	presignUrl,
	getSites,
	getRolePolicy,
	getUserPolicy,
	getRegions,
};
export type {AwsRegion, RenderProgress, WebhookPayload, PresignUrlInput};
