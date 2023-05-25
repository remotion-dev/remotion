import {GoogleAuth} from 'google-auth-library';
import {permissionsPath} from '../../shared/constants';
import {getCloudStorageClient} from '../helpers/get-cloud-storage-client';

export const logPermissionOutput = (output: SimulationResult) => {
	return [output.decision ? '✅' : '❌', output.permissionName].join(' ');
};

type SimulationResult = {
	decision: true | false;
	permissionName: string;
};

type SimulatePermissionsInput = {
	onSimulation?: (result: SimulationResult) => void;
};

type SimulatePermissionsOutput = {
	results: SimulationResult[];
};

/**
 * @description Simulates calls using the AWS Simulator to validate the correct permissions.
 * @see [Remotion-Documentation](http://remotion.dev/docs/cloudrun/simulatepermissions)
 * @see [Cloudrun-Documentation]https://cloud.google.com/iam/docs/testing-permissions)
 * @param {(result: SimulationResult) => void} options.onSimulation Function to run on each simulation result
 * @returns {Promise<SimulatePermissionsOutput>} See documentation for detailed response structure.
 */
export const simulatePermissions = async (
	options: SimulatePermissionsInput
): Promise<SimulatePermissionsOutput> => {
	const auth = new GoogleAuth({
		credentials: {
			client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
			private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
		},
		scopes: 'https://www.googleapis.com/auth/cloud-platform',
	});
	const client = await auth.getClient();

	const cloudStorageClient = getCloudStorageClient();

	const urlWithoutPrefix = permissionsPath.replace(
		'https://storage.googleapis.com/',
		''
	);
	const firstSlashIndex = urlWithoutPrefix.indexOf('/');

	const bucketName = urlWithoutPrefix.substring(0, firstSlashIndex);
	const filePath = urlWithoutPrefix.substring(firstSlashIndex + 1);

	const file = await cloudStorageClient
		.bucket(bucketName)
		.file(filePath)
		.download();

	const saPermissions = JSON.parse(file[0].toString('utf8'));

	const data = {
		permissions: saPermissions.list,
	};

	const results: SimulationResult[] = [];

	const response: {
		data: {
			permissions: string[];
		};
	} = await client.request({
		url: `https://cloudresourcemanager.googleapis.com/v1/projects/${process.env.REMOTION_GCP_PROJECT_ID}:testIamPermissions`,
		method: 'POST',
		data,
	});

	saPermissions.list.forEach((permission: string) => {
		if (response?.data?.permissions.includes(permission)) {
			const thisResult = {decision: true, permissionName: permission};
			results.push(thisResult);
			options.onSimulation?.(thisResult);
		} else {
			const thisResult = {decision: false, permissionName: permission};
			results.push(thisResult);
			options.onSimulation?.(thisResult);
		}
	});

	return {results};
};
