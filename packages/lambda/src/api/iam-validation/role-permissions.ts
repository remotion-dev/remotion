import {
	LAMBDA_INSIGHTS_PREFIX,
	LOG_GROUP_PREFIX,
	REMOTION_BUCKET_PREFIX,
	RENDER_FN_PREFIX,
} from '@remotion/lambda-client/constants';

export const rolePermissions: {
	actions: string[];
	resource: string[];
}[] = [
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
		resource: [`arn:aws:s3:::${REMOTION_BUCKET_PREFIX}*`],
	},
	{
		actions: ['lambda:InvokeFunction'],
		resource: [`arn:aws:lambda:*:*:function:${RENDER_FN_PREFIX}*`],
	},
	{
		actions: ['logs:CreateLogGroup'],
		resource: [`arn:aws:logs:*:*:log-group:${LAMBDA_INSIGHTS_PREFIX}`],
	},
	{
		actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
		resource: [
			`arn:aws:logs:*:*:log-group:${LOG_GROUP_PREFIX}${RENDER_FN_PREFIX}*`,
			`arn:aws:logs:*:*:log-group:${LAMBDA_INSIGHTS_PREFIX}:*`,
		],
	},
];
