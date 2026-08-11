import type {AwsRegion} from '@remotion/lambda-client';

export const REMOTION_HOSTED_LAYER_ARN = `arn:aws:lambda:*:678892195805:layer:remotion-binaries-*`;

export type AwsLayer = {
	layerArn: string;
	version: number;
};

export type HostedLayers = {
	[region in AwsRegion]: AwsLayer[];
};

export const hostedLayers: HostedLayers = {
	'ap-northeast-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 26,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 30,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'ap-south-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 26,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 30,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'ap-southeast-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 26,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 30,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'ap-southeast-2': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 26,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 30,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'eu-central-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 64,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 64,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 26,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 26,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 26,
		},
	],
	'eu-west-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 27,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 30,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'eu-west-2': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 26,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 30,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'us-east-1': [
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 31,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 39,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'us-east-2': [
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 26,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 30,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'us-west-2': [
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 26,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 30,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'af-south-1': [
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'ap-east-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'ap-northeast-2': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'ap-northeast-3': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'ca-central-1': [
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 22,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 22,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 13,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 13,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 13,
		},
	],
	'eu-north-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'eu-south-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'eu-west-3': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'sa-east-1': [
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 22,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 22,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 13,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 13,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 13,
		},
	],
	'us-west-1': [
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 23,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 14,
		},
	],
	'ap-southeast-4': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-4:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-4:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-4:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 10,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-4:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 10,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-4:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 10,
		},
	],
	'ap-southeast-5': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-5:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 10,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-5:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 10,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-5:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 10,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-5:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 10,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-5:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 10,
		},
	],
	'eu-central-2': [
		{
			layerArn:
				'arn:aws:lambda:eu-central-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 10,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 10,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-2:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 10,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-2:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 10,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-2:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 10,
		},
	],
};
