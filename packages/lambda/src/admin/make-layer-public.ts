import {
	AddLayerVersionPermissionCommand,
	PublishLayerVersionCommand,
} from '@aws-sdk/client-lambda';
import {lambda} from 'aws-policies';
import {VERSION} from 'remotion/version';
import {getRegions} from '../api/get-regions';
import {quit} from '../cli/helpers/quit';
import {getLambdaClient} from '../shared/aws-clients';
import type {HostedLayers} from '../shared/hosted-layers';
import type {LambdaArchitecture} from '../shared/validate-architecture';

const runtimes: string[] = ['nodejs14.x'];

const archictures: LambdaArchitecture[] = ['arm64', 'x86_64'];

const layerInfo: HostedLayers = {
	arm64: {
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
	},
	x86_64: {
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
	},
};

const makeLayerPublic = async () => {
	const layers = ['fonts', 'ffmpeg', 'chromium'] as const;
	for (const architecture of archictures) {
		for (const region of getRegions()) {
			for (const layer of layers) {
				const layerName = `remotion-binaries-${layer}-${architecture}`;
				const {Version, LayerArn} = await getLambdaClient(region).send(
					new PublishLayerVersionCommand({
						Content: {
							S3Bucket: 'remotionlambda-binaries-' + region,
							S3Key: `remotion-layer-${layer}-v9-${architecture}.zip`,
						},
						LayerName: layerName,
						LicenseInfo:
							layer === 'chromium'
								? 'Chromium 104, compiled from source. Read Chromium License: https://chromium.googlesource.com/chromium/src/+/refs/heads/main/LICENSE'
								: layer === 'ffmpeg'
								? 'Compiled from FFMPEG source. Read FFMPEG license: https://ffmpeg.org/legal.html'
								: 'Contains Noto Sans font. Read Noto Sans License: https://fonts.google.com/noto/specimen/Noto+Sans/about',
						CompatibleRuntimes: runtimes,
						Description: VERSION,
					})
				);
				await getLambdaClient(region).send(
					new AddLayerVersionPermissionCommand({
						Action: lambda.GetLayerVersion,
						LayerName: layerName,
						Principal: '*',
						VersionNumber: Version,
						StatementId: 'public-layer',
					})
				);
				if (!layerInfo[architecture][region]) {
					layerInfo[architecture][region] = [];
				}

				if (!LayerArn) {
					throw new Error('layerArn is null');
				}

				if (!Version) {
					throw new Error('Version is null');
				}

				layerInfo[architecture][region].push({
					layerArn: LayerArn,
					version: Version,
				});
				console.log({LayerArn, Version});
			}
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
