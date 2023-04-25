import type {AwsRegion} from '../pricing/aws-regions';

export const REMOTION_HOSTED_LAYER_ARN = `arn:aws:lambda:*:678892195805:layer:remotion-binaries-*`;

export type HostedLayers = {
	[region in AwsRegion]: {layerArn: string; version: number}[];
};

export const hostedLayers: HostedLayers = {
	'eu-central-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-fonts-arm64',
			version: 10,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium-arm64',
			version: 13,
		},
	],
};
