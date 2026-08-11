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
	'sa-east-1': [],
	'us-west-1': [],
	'ap-southeast-4': [],
	'ap-southeast-5': [],
	'eu-central-2': [],
};

const getBucketName = (region: AwsRegion) => {
	return `remotionlambda-binaries-${region}`;
};

const parseRegionFlag = (): AwsRegion | null => {
	const arg = process.argv
		.slice(2)
		.find((a) => a.startsWith('--region=') || a === '--region');
	if (!arg) return null;
	if (arg === '--region') {
		const idx = process.argv.indexOf('--region');
		return (process.argv[idx + 1] ?? null) as AwsRegion | null;
	}

	return arg.split('=')[1] as AwsRegion;
};

const parseSkipFlag = (): AwsRegion[] => {
	const arg = process.argv
		.slice(2)
		.find((a) => a.startsWith('--skip=') || a === '--skip');
	if (!arg) return [];
	const value =
		arg === '--skip'
			? (process.argv[process.argv.indexOf('--skip') + 1] ?? '')
			: arg.split('=')[1];
	return value
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean) as AwsRegion[];
};

const makeLayerPublic = async () => {
	const runtimes: Runtime[] = ['nodejs24.x'];

	const layers = [
		'fonts',
		'chromium',
		'emoji-apple',
		'emoji-google',
		'cjk',
	] as const;

	const onlyRegion = parseRegionFlag();
	const skipRegions = parseSkipFlag();
	const regions = onlyRegion
		? [onlyRegion]
		: getRegions().filter((r) => !skipRegions.includes(r));
	if (onlyRegion) {
		console.log(`Filtering to region: ${onlyRegion}`);
	}

	if (skipRegions.length > 0) {
		console.log(`Skipping regions: ${skipRegions.join(', ')}`);
	}

	for (const region of regions) {
		for (const layer of layers) {
			const layerName = `remotion-binaries-${layer}-arm64`;
			const {Version, LayerArn} = await LambdaClientInternals.getLambdaClient(
				region,
				undefined,
				null,
			).send(
				new PublishLayerVersionCommand({
					Content: {
						S3Bucket: getBucketName(region),
						S3Key: `remotion-layer-${layer}-v18-arm64.zip`,
					},
					LayerName: layerName,
					LicenseInfo:
						layer === 'chromium'
							? 'Chromium 149.0.7790.0, compiled from source. Read Chromium License: https://chromium.googlesource.com/chromium/src/+/refs/heads/main/LICENSE'
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
			await LambdaClientInternals.getLambdaClient(
				region,
				undefined,
				undefined,
			).send(
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
