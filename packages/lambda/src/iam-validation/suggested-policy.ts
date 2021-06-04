import {requiredPermissions} from './required-permissions';

export const suggestedPolicy = {
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
