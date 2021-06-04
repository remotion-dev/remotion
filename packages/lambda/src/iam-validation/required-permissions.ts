import {iam, lambda, s3} from 'aws-policies';

export const requiredPermissions: {
	actions: (s3 | iam | lambda)[];
	resource: string[];
}[] = [
	{
		actions: [iam.GetUser],
		// eslint-disable-next-line no-template-curly-in-string
		resource: ['arn:aws:iam::*:user/${aws:username}'],
	},
	{
		actions: [iam.SimulatePrincipalPolicy],
		resource: ['*'],
	},
	{
		actions: [
			s3.GetObject,
			s3.DeleteObject,
			s3.DeleteBucket,
			s3.PutBucketWebsite,
			s3.ListBucket,
			s3.DeleteBucketWebsite,
		],
		resource: ['arn:aws:s3:::remotion-*'],
	},
	{
		actions: [s3.ListAllMyBuckets],
		resource: ['*'],
	},
	{
		actions: [
			lambda.InvokeFunction,
			lambda.CreateFunction,
			lambda.DeleteFunction,
			lambda.PublishLayerVersion,
			lambda.DeleteLayerVersion,
			lambda.GetLayerVersion,
		],
		resource: ['arn:aws:lambda:*::remotion-*'],
	},
	{
		actions: [lambda.ListLayers, lambda.ListFunctions],
		resource: ['*'],
	},
];
