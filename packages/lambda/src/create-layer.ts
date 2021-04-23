import {LambdaClient, PublishLayerVersionCommand} from '@aws-sdk/client-lambda';

export const createLayer = (
	lambdaClient: LambdaClient,
	name: string,
	key: string
) => {
	return lambdaClient.send(
		new PublishLayerVersionCommand({
			Content: {
				S3Bucket: 'remotion-binaries',
				S3Key: key,
			},
			LayerName: name,
			LicenseInfo: 'https://ffmpeg.org/legal.html',
			CompatibleRuntimes: ['nodejs14.x', 'nodejs12.x', 'nodejs10.x'],
			Description: 'Adds ffmpeg and ffprobe binaries in PATH',
		})
	);
};
