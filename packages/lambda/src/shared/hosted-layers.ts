import type {AwsRegion} from '../regions';

export const REMOTION_HOSTED_LAYER_ARN = `arn:aws:lambda:*:678892195805:layer:remotion-binaries-*`;

export type HostedLayers = {
	[region in AwsRegion]: {layerArn: string; version: number}[];
};
export const hostedLayers: HostedLayers = {
	'ap-northeast-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 18,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'ap-south-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 18,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'ap-southeast-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 18,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'ap-southeast-2': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 18,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'eu-central-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 38,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 39,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'eu-west-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 15,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 18,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'eu-west-2': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 18,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'us-east-1': [
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 19,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 27,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'us-east-2': [
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 18,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'us-west-2': [
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 18,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'af-south-1': [
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'ap-east-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'ap-northeast-2': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'ap-northeast-3': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'ca-central-1': [
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'eu-north-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'eu-south-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'eu-west-3': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'me-south-1': [
		{
			layerArn:
				'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'sa-east-1': [
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
	'us-west-1': [
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-emoji-apple-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-emoji-google-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-cjk-arm64',
			version: 2,
		},
	],
};
