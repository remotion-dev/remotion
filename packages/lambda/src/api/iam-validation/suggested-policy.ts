import {rolePermissions} from './role-permissions';
import {requiredPermissions} from './user-permissions';

const suggestedPolicy = {
	Version: '2012-10-17',
	Statement: [
		...requiredPermissions.map((per) => {
			return {
				Sid: per.id,
				Effect: 'Allow',
				Action: per.actions,
				Resource: per.resource,
			};
		}),
	],
};

const suggestedRolePolicy = {
	Version: '2012-10-17',
	Statement: [
		...rolePermissions.map((per, i) => {
			return {
				Sid: String(i),
				Effect: 'Allow',
				Action: per.actions,
				Resource: per.resource,
			};
		}),
	],
};

/*
 * @description Returns an inline JSON policy to be assigned to the AWS user whose credentials are being used for executing CLI commands or calling Node.JS functions.
 * @see [Documentation](https://remotion.dev/docs/lambda/getuserpolicy)
 */

export const getUserPolicy = () => JSON.stringify(suggestedPolicy, null, 2);

export const ROLE_NAME = 'remotion-lambda-role';

/*
 * @description Returns an inline JSON policy to be assigned to the 'remotion-lambda-role' role that needs to be created in your AWS account.
 * @see [Documentation](https://remotion.dev/docs/lambda/getrolepolicy)
 */
export const getRolePolicy = () => JSON.stringify(suggestedRolePolicy, null, 2);
