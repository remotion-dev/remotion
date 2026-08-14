import type {AwsPartition} from '@remotion/lambda-client';
import {
	LAMBDA_INSIGHTS_PREFIX,
	LOG_GROUP_PREFIX,
	REMOTION_BUCKET_PREFIX,
	RENDER_FN_PREFIX,
} from '@remotion/lambda-client/constants';

export type RolePermission = {
	actions: string[];
	resource: string[];
};

export const getRolePermissions = (
	partition: AwsPartition,
): RolePermission[] => [
	{
		actions: ['s3:ListAllMyBuckets'],
		resource: ['*'],
	},
	{
		actions: [
			's3:CreateBucket',
			's3:ListBucket',
			's3:PutBucketAcl',
			's3:GetObject',
			's3:DeleteObject',
			's3:PutObjectAcl',
			's3:PutObject',
			's3:GetBucketLocation',
		],
		resource: [`arn:${partition}:s3:::${REMOTION_BUCKET_PREFIX}*`],
	},
	{
		actions: ['lambda:InvokeFunction'],
		resource: [`arn:${partition}:lambda:*:*:function:${RENDER_FN_PREFIX}*`],
	},
	{
		actions: ['logs:CreateLogGroup'],
		resource: [`arn:${partition}:logs:*:*:log-group:${LAMBDA_INSIGHTS_PREFIX}`],
	},
	{
		actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
		resource: [
			`arn:${partition}:logs:*:*:log-group:${LOG_GROUP_PREFIX}${RENDER_FN_PREFIX}*`,
			`arn:${partition}:logs:*:*:log-group:${LAMBDA_INSIGHTS_PREFIX}:*`,
		],
	},
];

export const rolePermissions = getRolePermissions('aws');
