import type {AwsRegion} from '../pricing/aws-regions';

export const REMOTION_HOSTED_LAYER_ARN = `arn:aws:lambda:*:678892195805:layer:remotion-binaries-*`;

export type HostedLayers = {
	[region in AwsRegion]: {layerArn: string; version: number}[];
};
export const hostedLayers: HostedLayers = {
	'ap-northeast-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 8,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 12,
		},
	],
	'ap-south-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 8,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 12,
		},
	],
	'ap-southeast-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 8,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 12,
		},
	],
	'ap-southeast-2': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 8,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 12,
		},
	],
	'eu-central-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 17,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 18,
		},
	],
	'eu-west-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 12,
		},
	],
	'eu-west-2': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 8,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 12,
		},
	],
	'us-east-1': [
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 13,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 21,
		},
	],
	'us-east-2': [
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 8,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 12,
		},
	],
	'us-west-2': [
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 8,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 12,
		},
	],
	'af-south-1': [
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 5,
		},
	],
	'ap-east-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 5,
		},
	],
	'ap-northeast-2': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 5,
		},
	],
	'ap-northeast-3': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 5,
		},
	],
	'ca-central-1': [
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 5,
		},
	],
	'eu-north-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 5,
		},
	],
	'eu-south-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 5,
		},
	],
	'eu-west-3': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 5,
		},
	],
	'me-south-1': [
		{
			layerArn:
				'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 5,
		},
	],
	'sa-east-1': [
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 5,
		},
	],
	'us-west-1': [
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 5,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 5,
		},
	],
};

export const v5HostedLayers: HostedLayers = {
	'ap-northeast-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 13,
		},
	],
	'ap-south-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 13,
		},
	],
	'ap-southeast-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 13,
		},
	],
	'ap-southeast-2': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 13,
		},
	],
	'eu-central-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 32,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 33,
		},
	],
	'eu-west-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 10,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 13,
		},
	],
	'eu-west-2': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 13,
		},
	],
	'us-east-1': [
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 22,
		},
	],
	'us-east-2': [
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 13,
		},
	],
	'us-west-2': [
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 13,
		},
	],
	'af-south-1': [
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 6,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 6,
		},
	],
	'ap-east-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 6,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 6,
		},
	],
	'ap-northeast-2': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 6,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 6,
		},
	],
	'ap-northeast-3': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 6,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 6,
		},
	],
	'ca-central-1': [
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 6,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 6,
		},
	],
	'eu-north-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 6,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 6,
		},
	],
	'eu-south-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 6,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 6,
		},
	],
	'eu-west-3': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 6,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 6,
		},
	],
	'me-south-1': [
		{
			layerArn:
				'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 6,
		},
		{
			layerArn:
				'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 6,
		},
	],
	'sa-east-1': [
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 6,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 6,
		},
	],
	'us-west-1': [
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 6,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 6,
		},
	],
};
