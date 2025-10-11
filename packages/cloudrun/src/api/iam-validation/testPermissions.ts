import fs from 'fs';
import path from 'path';
import {getProjectId} from '../../functions/helpers/is-in-cloud-task';
import {getResourceManagerClient} from '../helpers/get-resource-manager-client';

export const logPermissionOutput = (output: TestResult) => {
	return [output.decision ? '✅' : '❌', output.permissionName].join(' ');
};

type TestResult = {
	decision: true | false;
	permissionName: string;
};

type TestPermissionsInput = {
	onTest: (result: TestResult) => void;
};

type TestPermissionsOutput = {
	results: TestResult[];
};

/*
 * @description Makes a call to the Test Iam Permissions method of the Resource Manager API in GCP, which returns the list of permissions the Service Account has on the GCP Project. This is then validated against the list of permissions required for the version of Remotion.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/testpermissions)
 */
export const testPermissions = async (
	params?: TestPermissionsInput,
): Promise<TestPermissionsOutput> => {
	const resourceManagerClient = getResourceManagerClient();

	const saPermissions = JSON.parse(
		fs.readFileSync(
			path.join(__dirname, '../../shared/sa-permissions.json'),
			'utf-8',
		),
	);

	const permissionList: string[] = saPermissions.list.map(
		(permission: {name: string; reason: string}) => permission.name,
	);

	const response = await resourceManagerClient.testIamPermissions({
		resource: `projects/${getProjectId()}`,
		permissions: permissionList,
	});

	const returnedPermissions = response[0].permissions;

	if (!returnedPermissions) {
		throw new Error(
			'No permissions returned from the testIamPermissions call.',
		);
	}

	const results: TestResult[] = [];

	saPermissions.list.forEach((permission: {name: string; reason: string}) => {
		if (returnedPermissions.includes(permission.name)) {
			const thisResult = {decision: true, permissionName: permission.name};
			results.push(thisResult);
			params?.onTest(thisResult);
		} else {
			const thisResult = {decision: false, permissionName: permission.name};
			results.push(thisResult);
			params?.onTest(thisResult);
		}
	});

	return {results};
};
