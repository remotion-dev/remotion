import type {AwsRegion} from '../pricing/aws-regions';
import type {LambdaArchitecture} from './validate-architecture';

export const REMOTION_HOSTED_LAYER_ARN = `arn:aws:lambda:*:678892195805:layer:remotion-binaries-*`;

export type HostedLayers = {
	[architecture in LambdaArchitecture]: {
		[region in AwsRegion]: {layerArn: string; version: number}[];
	};
};

export const hostedLayers: HostedLayers = {
	arm64: {
		'ap-northeast-1': [
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 7,
			},
		],
		'ap-south-1': [
			{
				layerArn:
					'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 7,
			},
		],
		'ap-southeast-1': [
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 7,
			},
		],
		'ap-southeast-2': [
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 7,
			},
		],
		'eu-central-1': [
			{
				layerArn:
					'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 7,
			},
		],
		'eu-west-1': [
			{
				layerArn:
					'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 7,
			},
		],
		'eu-west-2': [
			{
				layerArn:
					'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 7,
			},
		],
		'us-east-1': [
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 15,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 15,
			},
		],
		'us-east-2': [
			{
				layerArn:
					'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 7,
			},
		],
		'us-west-2': [
			{
				layerArn:
					'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 7,
			},
		],
	},
	x86_64: {
		'ap-northeast-1': [
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 7,
			},
		],
		'ap-south-1': [
			{
				layerArn:
					'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 7,
			},
		],
		'ap-southeast-1': [
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 7,
			},
		],
		'ap-southeast-2': [
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 7,
			},
		],
		'eu-central-1': [
			{
				layerArn:
					'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 7,
			},
		],
		'eu-west-1': [
			{
				layerArn:
					'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 7,
			},
		],
		'eu-west-2': [
			{
				layerArn:
					'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 7,
			},
		],
		'us-east-1': [
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 15,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 15,
			},
		],
		'us-east-2': [
			{
				layerArn:
					'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 7,
			},
		],
		'us-west-2': [
			{
				layerArn:
					'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 3,
			},
			{
				layerArn:
					'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 7,
			},
			{
				layerArn:
					'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 7,
			},
		],
	},
};
