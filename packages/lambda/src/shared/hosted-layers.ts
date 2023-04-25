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
			version: 7,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
	],
	'ap-south-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 7,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
	],
	'ap-southeast-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 7,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
	],
	'ap-southeast-2': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 7,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
	],
	'eu-central-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 14,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 16,
		},
	],
	'eu-west-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 7,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
	],
	'eu-west-2': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 7,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
	],
	'us-east-1': [
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 12,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 18,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 20,
		},
	],
	'us-east-2': [
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 7,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
	],
	'us-west-2': [
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 7,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 9,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 11,
		},
	],
	'af-south-1': [
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 4,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 4,
		},
	],
	'ap-east-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 4,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 4,
		},
	],
	'ap-northeast-2': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 4,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 4,
		},
	],
	'ap-northeast-3': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 4,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 4,
		},
	],
	'ca-central-1': [
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 4,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 4,
		},
	],
	'eu-north-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 4,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 4,
		},
	],
	'eu-south-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 4,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 4,
		},
	],
	'eu-west-3': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 4,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 4,
		},
	],
	'me-south-1': [
		{
			layerArn:
				'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 4,
		},
		{
			layerArn:
				'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 4,
		},
	],
	'sa-east-1': [
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 4,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 4,
		},
	],
	'us-west-1': [
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 4,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 4,
		},
	],
};
