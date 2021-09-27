import {
	AddLayerVersionPermissionCommand,
	PublishLayerVersionCommand,
} from '@aws-sdk/client-lambda';
import {lambda} from 'aws-policies';
import {AwsRegion} from '..';
import {getLambdaClient} from '../shared/aws-clients';
import {CURRENT_VERSION} from '../shared/constants';

const runtimes: string[] = ['nodejs14.x'];
const region: AwsRegion = 'eu-central-1';

export const makeLayerPublic = async () => {
	const layers = ['remotion', 'ffmpeg', 'chromium'];
	for (const layer of layers) {
		console.log({layer});
		const layerName = `remotion-binaries-${layer}`;
		const {Version} = await getLambdaClient(region).send(
			new PublishLayerVersionCommand({
				Content: {
					S3Bucket: 'lambda-remotion-binaries-' + region,
					S3Key: `remotion-layer-${layer}-v1.zip`,
				},
				LayerName: layerName,
				LicenseInfo:
					'https://ffmpeg.org/legal.html / https://chromium.googlesource.com/chromium/src/+/refs/heads/main/LICENSE',
				CompatibleRuntimes: runtimes,
				Description: CURRENT_VERSION,
			})
		);
		await getLambdaClient('eu-central-1').send(
			new AddLayerVersionPermissionCommand({
				Action: lambda.GetLayerVersion,
				LayerName: layerName,
				Principal: '*',
				VersionNumber: Version,
				StatementId: 'public-layer',
			})
		);
	}
};

makeLayerPublic().then(() => {
	console.log('made public');
});
