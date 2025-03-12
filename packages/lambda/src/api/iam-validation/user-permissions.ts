import {
	LOG_GROUP_PREFIX,
	REMOTION_BUCKET_PREFIX,
	RENDER_FN_PREFIX,
} from '@remotion/lambda-client/constants';
import {REMOTION_HOSTED_LAYER_ARN} from '../../shared/hosted-layers';

export const requiredPermissions: {
	actions: string[];
	resource: string[];
	id: string;
}[] = [
	{
		id: 'HandleQuotas',
		actions: [
			'servicequotas:GetServiceQuota',
			'servicequotas:GetAWSDefaultServiceQuota',
			'servicequotas:RequestServiceQuotaIncrease',
			'servicequotas:ListRequestedServiceQuotaChangeHistoryByQuota',
		],
		resource: ['*'],
	},
	{
		id: 'PermissionValidation',
		actions: ['iam:SimulatePrincipalPolicy'],
		resource: ['*'],
	},
	{
		id: 'LambdaInvokation',
		actions: ['iam:PassRole'],
		resource: ['arn:aws:iam::*:role/remotion-lambda-role'],
	},
	{
		id: 'Storage',
		actions: [
			's3:GetObject',
			's3:DeleteObject',
			's3:PutObjectAcl',
			's3:PutObject',
			's3:CreateBucket',
			's3:ListBucket',
			's3:GetBucketLocation',
			's3:PutBucketAcl',
			's3:DeleteBucket',
			's3:PutBucketOwnershipControls',
			's3:PutBucketPublicAccessBlock',
			's3:PutLifecycleConfiguration',
		],
		resource: [`arn:aws:s3:::${REMOTION_BUCKET_PREFIX}*`],
	},
	{
		id: 'BucketListing',
		actions: ['s3:ListAllMyBuckets'],
		resource: ['*'],
	},
	{
		id: 'FunctionListing',
		actions: ['lambda:ListFunctions', 'lambda:GetFunction'],
		resource: ['*'],
	},
	{
		id: 'FunctionManagement',
		actions: [
			'lambda:InvokeAsync',
			'lambda:InvokeFunction',
			'lambda:CreateFunction',
			'lambda:DeleteFunction',
			'lambda:PutFunctionEventInvokeConfig',
			'lambda:PutRuntimeManagementConfig',
			'lambda:TagResource',
		],
		resource: [`arn:aws:lambda:*:*:function:${RENDER_FN_PREFIX}*`],
	},
	{
		id: 'LogsRetention',
		actions: ['logs:CreateLogGroup', 'logs:PutRetentionPolicy'],
		resource: [
			`arn:aws:logs:*:*:log-group:${LOG_GROUP_PREFIX}${RENDER_FN_PREFIX}*`,
		],
	},
	{
		id: 'FetchBinaries',
		actions: ['lambda:GetLayerVersion'],
		resource: [
			REMOTION_HOSTED_LAYER_ARN,
			'arn:aws:lambda:*:580247275435:layer:LambdaInsightsExtension*',
		],
	},
];
