import {AddLayerVersionPermissionCommand} from '@aws-sdk/client-lambda';
import {lambda} from 'aws-policies';
import {getLambdaClient} from '../shared/aws-clients';

export const makeLayerPublic = async () => {
	await getLambdaClient('eu-central-1').send(
		new AddLayerVersionPermissionCommand({
			Action: lambda.GetLayerVersion,
			LayerName: 'remotion-binaries',
			Principal: '*',
			VersionNumber: 9,
			StatementId: 'public-layer',
		})
	);
};

makeLayerPublic().then(() => {
	console.log('made public');
});
