import {requiredPermissions} from './required-permissions';
import {rolePermissions} from './role-permissions';

const suggestedPolicy = {
	Version: '2012-10-17',
	Statement: [
		...requiredPermissions.map((per, i) => {
			return {
				Sid: String(i),
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

export const getUserPolicy = () => suggestedPolicy;
export const getRolePolicy = () => suggestedRolePolicy;
