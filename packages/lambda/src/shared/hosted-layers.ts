import type {AwsRegion} from '../pricing/aws-regions';

export const REMOTION_HOSTED_LAYER_ARN = `arn:aws:lambda:*:678892195805:layer:remotion-binaries-*`;

export type HostedLayers = {
	[region in AwsRegion]: {layerArn: string; version: number}[];
};

export const hostedLayers: HostedLayers = {
	'ap-northeast-1': [],
	'ap-south-1': [],
	'ap-southeast-1': [],
	'ap-southeast-2': [],
	'eu-central-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 31,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 32,
		},
	],
	'eu-west-1': [],
	'eu-west-2': [],
	'us-east-1': [],
	'us-east-2': [],
	'us-west-2': [],
	'af-south-1': [],
	'ap-east-1': [],
	'ap-northeast-2': [],
	'ap-northeast-3': [],
	'ca-central-1': [],
	'eu-north-1': [],
	'eu-south-1': [],
	'eu-west-3': [],
	'me-south-1': [],
	'sa-east-1': [],
	'us-west-1': [],
};

export const v5HostedLayers = hostedLayers;
