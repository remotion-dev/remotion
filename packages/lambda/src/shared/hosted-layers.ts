import {AwsRegion} from '../pricing/aws-regions';

export const REMOTION_HOSTED_LAYER_ARN = `arn:aws:lambda:*:678892195805:layer:remotion-binaries-*`;

export const hostedLayers: {
	[key in AwsRegion]: {
		layerArn: string;
		version: number;
	}[];
} = {
	'ap-northeast-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-remotion',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-ffmpeg',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-chromium',
			version: 5,
		},
	],
	'ap-south-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-remotion',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-ffmpeg',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-chromium',
			version: 5,
		},
	],
	'ap-southeast-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-remotion',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-ffmpeg',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-chromium',
			version: 5,
		},
	],
	'ap-southeast-2': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-remotion',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-ffmpeg',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-chromium',
			version: 5,
		},
	],
	'eu-central-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-remotion',
			version: 12,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-ffmpeg',
			version: 12,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium',
			version: 12,
		},
	],
	'eu-west-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-remotion',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-ffmpeg',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-chromium',
			version: 5,
		},
	],
	'eu-west-2': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-remotion',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-ffmpeg',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-chromium',
			version: 5,
		},
	],
	'us-east-1': [
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-remotion',
			version: 12,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-ffmpeg',
			version: 10,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-chromium',
			version: 8,
		},
	],
	'us-east-2': [
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-remotion',
			version: 7,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-ffmpeg',
			version: 7,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-chromium',
			version: 7,
		},
	],
	'us-west-2': [
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-remotion',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-ffmpeg',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-chromium',
			version: 5,
		},
	],
};
