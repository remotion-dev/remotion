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
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 8,
			},
		],
		'ap-south-1': [
			{
				layerArn:
					'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 8,
			},
		],
		'ap-southeast-1': [
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 8,
			},
		],
		'ap-southeast-2': [
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 8,
			},
		],
		'eu-central-1': [
			{
				layerArn:
					'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 8,
			},
		],
		'eu-west-1': [
			{
				layerArn:
					'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 8,
			},
		],
		'eu-west-2': [
			{
				layerArn:
					'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 8,
			},
		],
		'us-east-1': [
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 9,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 17,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 17,
			},
		],
		'us-east-2': [
			{
				layerArn:
					'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 8,
			},
		],
		'us-west-2': [
			{
				layerArn:
					'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 8,
			},
		],
		'af-south-1': [
			{
				layerArn:
					'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 1,
			},
		],
		'ap-east-1': [
			{
				layerArn:
					'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 1,
			},
		],
		'ap-northeast-2': [
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 1,
			},
		],
		'ap-northeast-3': [
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 1,
			},
		],
		'ca-central-1': [
			{
				layerArn:
					'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 1,
			},
		],
		'eu-north-1': [
			{
				layerArn:
					'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 1,
			},
		],
		'eu-south-1': [
			{
				layerArn:
					'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 1,
			},
		],
		'eu-west-3': [
			{
				layerArn:
					'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 1,
			},
		],
		'me-south-1': [
			{
				layerArn:
					'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 1,
			},
		],
		'sa-east-1': [
			{
				layerArn:
					'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 1,
			},
		],
		'us-west-1': [
			{
				layerArn:
					'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-fonts-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 1,
			},
		],
	},
	x86_64: {
		'ap-northeast-1': [
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 8,
			},
		],
		'ap-south-1': [
			{
				layerArn:
					'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-south-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 8,
			},
		],
		'ap-southeast-1': [
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 8,
			},
		],
		'ap-southeast-2': [
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-southeast-2:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 8,
			},
		],
		'eu-central-1': [
			{
				layerArn:
					'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 8,
			},
		],
		'eu-west-1': [
			{
				layerArn:
					'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 8,
			},
		],
		'eu-west-2': [
			{
				layerArn:
					'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-2:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 8,
			},
		],
		'us-east-1': [
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 9,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 17,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 17,
			},
		],
		'us-east-2': [
			{
				layerArn:
					'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-2:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 8,
			},
		],
		'us-west-2': [
			{
				layerArn:
					'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 8,
			},
			{
				layerArn:
					'arn:aws:lambda:us-west-2:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 8,
			},
		],
		'af-south-1': [
			{
				layerArn:
					'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:af-south-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 1,
			},
		],
		'ap-east-1': [
			{
				layerArn:
					'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-east-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 1,
			},
		],
		'ap-northeast-2': [
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-2:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 1,
			},
		],
		'ap-northeast-3': [
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ap-northeast-3:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 1,
			},
		],
		'ca-central-1': [
			{
				layerArn:
					'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:ca-central-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 1,
			},
		],
		'eu-north-1': [
			{
				layerArn:
					'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-north-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 1,
			},
		],
		'eu-south-1': [
			{
				layerArn:
					'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-south-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 1,
			},
		],
		'eu-west-3': [
			{
				layerArn:
					'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:eu-west-3:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 1,
			},
		],
		'me-south-1': [
			{
				layerArn:
					'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:me-south-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 1,
			},
		],
		'sa-east-1': [
			{
				layerArn:
					'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:sa-east-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 1,
			},
		],
		'us-west-1': [
			{
				layerArn:
					'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-fonts-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 1,
			},
			{
				layerArn:
					'arn:aws:lambda:us-west-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 1,
			},
		],
	},
};
