import {AwsRegion} from '..';

export const hostedLayers: {
	[key in AwsRegion]: {
		layerArn: string;
		version: number;
	}[];
} = {
	'af-south-1': [
		{
			layerArn:
				'arn:aws:lambda:af-south-1:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:af-south-1:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'ap-east-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-east-1:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'ap-northeast-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-1:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'ap-northeast-2': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-2:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'ap-northeast-3': [
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-northeast-3:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'ap-south-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-south-1:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'ap-southeast-1': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-1:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'ap-southeast-2': [
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ap-southeast-2:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'ca-central-1': [
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:ca-central-1:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'eu-central-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:976210361945:layer:remotion-binaries-remotion',
			version: 22,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 22,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-central-1:976210361945:layer:remotion-binaries-chromium',
			version: 22,
		},
	],
	'eu-north-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-north-1:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'eu-south-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-south-1:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'eu-west-1': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-1:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'eu-west-2': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-2:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'eu-west-3': [
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:eu-west-3:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'me-south-1': [
		{
			layerArn:
				'arn:aws:lambda:me-south-1:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:me-south-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:me-south-1:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'sa-east-1': [
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:976210361945:layer:remotion-binaries-remotion',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 1,
		},
		{
			layerArn:
				'arn:aws:lambda:sa-east-1:976210361945:layer:remotion-binaries-chromium',
			version: 1,
		},
	],
	'us-east-1': [
		{
			layerArn:
				'arn:aws:lambda:us-east-1:976210361945:layer:remotion-binaries-remotion',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-1:976210361945:layer:remotion-binaries-chromium',
			version: 2,
		},
	],
	'us-east-2': [
		{
			layerArn:
				'arn:aws:lambda:us-east-2:976210361945:layer:remotion-binaries-remotion',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:976210361945:layer:remotion-binaries-ffmpeg',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-east-2:976210361945:layer:remotion-binaries-chromium',
			version: 2,
		},
	],
	'us-west-1': [
		{
			layerArn:
				'arn:aws:lambda:us-west-1:976210361945:layer:remotion-binaries-remotion',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:976210361945:layer:remotion-binaries-ffmpeg',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-1:976210361945:layer:remotion-binaries-chromium',
			version: 2,
		},
	],
	'us-west-2': [
		{
			layerArn:
				'arn:aws:lambda:us-west-2:976210361945:layer:remotion-binaries-remotion',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:976210361945:layer:remotion-binaries-ffmpeg',
			version: 2,
		},
		{
			layerArn:
				'arn:aws:lambda:us-west-2:976210361945:layer:remotion-binaries-chromium',
			version: 2,
		},
	],
};
