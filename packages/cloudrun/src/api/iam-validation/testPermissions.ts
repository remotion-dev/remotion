import fs from 'fs';
import {GoogleAuth} from 'google-auth-library';
import path from 'path';

export const logPermissionOutput = (output: TestResult) => {
	return [output.decision ? '✅' : '❌', output.permissionName].join(' ');
};

type TestResult = {
	decision: true | false;
	permissionName: string;
};

type TestPermissionsInput = {
	onTest?: (result: TestResult) => void;
};

type TestPermissionsOutput = {
	results: TestResult[];
};

/**
 * @description Test the permissions on the service account match the permissions required.
 * @see [Remotion-Documentation](http://remotion.dev/docs/cloudrun/testpermissions)
 * @see [Cloudrun-Documentation](https://cloud.google.com/resource-manager/reference/rest/v1/projects/testIamPermissions)
 * @param {(result: TestResult) => void} options.onTest Function to run on each test result
 * @returns {Promise<TestPermissionsOutput>} Returns array of TestResult objects
 */
export const testPermissions = async (
	options: TestPermissionsInput
): Promise<TestPermissionsOutput> => {
	const auth = new GoogleAuth({
		credentials: {
			client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
			private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
		},
		scopes: 'https://www.googleapis.com/auth/cloud-platform',
	});
	const client = await auth.getClient();

	const saPermissions = JSON.parse(
		fs.readFileSync(
			path.join(__dirname, '../../shared/sa-permissions.json'),
			'utf-8'
		)
	);

	const data = {
		permissions: saPermissions.list,
	};

	const results: TestResult[] = [];

	// The service account, which calls the testIamPermissions method, receives a list of permissions that match the permissions specified in the request.

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
			options.onTest?.(thisResult);
		} else {
			const thisResult = {decision: false, permissionName: permission};
			results.push(thisResult);
			options.onTest?.(thisResult);
		}
	});

	return {results};
};
