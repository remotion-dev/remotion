import type {Runtime} from '@aws-sdk/client-lambda';
import {
	AddLayerVersionPermissionCommand,
	PublishLayerVersionCommand,
} from '@aws-sdk/client-lambda';
import {LambdaClientInternals, type AwsRegion} from '@remotion/lambda-client';
import {VERSION} from 'remotion/version';
import {getRegions} from '../api/get-regions';
import {quit} from '../cli/helpers/quit';
import type {HostedLayers} from '../shared/hosted-layers';

const layerInfo: HostedLayers = {
	'ap-northeast-1': [],
	'ap-south-1': [],
	'ap-southeast-1': [],
	'ap-southeast-2': [],
	'eu-central-1': [],
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
	'ap-southeast-4': [],
	'ap-southeast-5': [],
	'eu-central-2': [],
};

const getBucketName = (region: AwsRegion) => {
	return `remotionlambda-binaries-${region}`;
};

const makeLayerPublic = async () => {
	const runtimes: Runtime[] = ['nodejs20.x'];

	const layers = [
		'fonts',
		'chromium',
		'emoji-apple',
		'emoji-google',
		'cjk',
	] as const;
	for (const region of getRegions()) {
		for (const layer of layers) {
			const layerName = `remotion-binaries-${layer}-arm64`;
			const {Version, LayerArn} = await LambdaClientInternals.getLambdaClient(
				region,
			).send(
				new PublishLayerVersionCommand({
					Content: {
						S3Bucket: getBucketName(region),
						S3Key: `remotion-layer-${layer}-v12-arm64.zip`,
					},
					LayerName: layerName,
					LicenseInfo:
						layer === 'chromium'
							? 'Chromium 123.0.6312.86, compiled from source. Read Chromium License: https://chromium.googlesource.com/chromium/src/+/refs/heads/main/LICENSE'
							: layer === 'emoji-apple'
								? 'Apple Emojis (https://github.com/samuelngs/apple-emoji-linux). For educational purposes only - Apple is a trademark of Apple Inc., registered in the U.S. and other countries.'
								: layer === 'emoji-google'
									? 'Google Emojis (https://github.com/googlefonts/noto-emoji)'
									: layer === 'cjk'
										? 'Noto Sans (Chinese, Japanese, Korean)'
										: 'Contains Noto Sans font. Read Noto Sans License: https://fonts.google.com/noto/specimen/Noto+Sans/about',
					CompatibleRuntimes: runtimes,
					Description: VERSION,
				}),
			);
			await LambdaClientInternals.getLambdaClient(region).send(
				new AddLayerVersionPermissionCommand({
					Action: 'lambda:GetLayerVersion',
					LayerName: layerName,
					Principal: '*',
					VersionNumber: Version,
					StatementId: 'public-layer',
				}),
			);
			if (!layerInfo[region as AwsRegion]) {
				layerInfo[region as AwsRegion] = [];
			}

			if (!LayerArn) {
				throw new Error('layerArn is null');
			}

			if (!Version) {
				throw new Error('Version is null');
			}

			layerInfo[region].push({
				layerArn: LayerArn,
				version: Version,
			});
			console.log({LayerArn, Version});
		}
	}
};

makeLayerPublic()
	.then(() => {
		console.log('\n\n\n\n\n');
		console.log(JSON.stringify(layerInfo, null, 2));
	})
	.catch((err) => {
		console.log(err);
		quit(1);
	});
