import {AwsRegion} from '../pricing/aws-regions';
import {LambdaArchitecture} from './validate-architecture';

export const REMOTION_HOSTED_LAYER_ARN = `arn:aws:lambda:*:678892195805:layer:remotion-binaries-*`;

export type HostedLayers = {
	[architecture in LambdaArchitecture]: {
		[region in AwsRegion]: {layerArn: string; version: number}[];
	};
};

export const hostedLayers: HostedLayers = {
	arm64: {
		'ap-northeast-1': [],
		'ap-south-1': [],
		'ap-southeast-1': [],
		'ap-southeast-2': [],
		'eu-central-1': [],
		'eu-west-1': [],
		'eu-west-2': [],
		'us-east-1': [
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-remotion-arm64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-ffmpeg-arm64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-chromium-arm64',
				version: 4,
			},
		],
		'us-east-2': [],
		'us-west-2': [],
	},
	x86_64: {
		'ap-northeast-1': [],
		'ap-south-1': [],
		'ap-southeast-1': [],
		'ap-southeast-2': [],
		'eu-central-1': [],
		'eu-west-1': [],
		'eu-west-2': [],
		'us-east-1': [
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-remotion-x86_64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-ffmpeg-x86_64',
				version: 4,
			},
			{
				layerArn:
					'arn:aws:lambda:us-east-1:678892195805:layer:remotion-binaries-chromium-x86_64',
				version: 4,
			},
		],
		'us-east-2': [],
		'us-west-2': [],
	},
};
