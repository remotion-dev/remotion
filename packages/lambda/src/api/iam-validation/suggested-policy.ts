import type {AwsPartition} from '@remotion/lambda-client';
import {getRolePermissions} from './role-permissions';
import {getRequiredPermissions} from './user-permissions';

export type GetPolicyOptions = {
	partition?: AwsPartition;
};

const makePolicy = (partition: AwsPartition) => ({
	Version: '2012-10-17',
	Statement: getRequiredPermissions(partition).map((per) => {
		return {
			Sid: per.id,
			Effect: 'Allow',
			Action: per.actions,
			Resource: per.resource,
		};
	}),
});

const makeRolePolicy = (partition: AwsPartition) => ({
	Version: '2012-10-17',
	Statement: getRolePermissions(partition).map((per, i) => {
		return {
			Sid: String(i),
			Effect: 'Allow',
			Action: per.actions,
			Resource: per.resource,
		};
	}),
});

/*
 * @description Returns an inline JSON policy to be assigned to the AWS user whose credentials are being used for executing CLI commands or calling Node.JS functions.
 * @see [Documentation](https://remotion.dev/docs/lambda/getuserpolicy)
 */
export const getUserPolicy = (options?: GetPolicyOptions) =>
	JSON.stringify(makePolicy(options?.partition ?? 'aws'), null, 2);

export const ROLE_NAME = 'remotion-lambda-role';

/*
 * @description Returns an inline JSON policy to be assigned to the 'remotion-lambda-role' role that needs to be created in your AWS account.
 * @see [Documentation](https://remotion.dev/docs/lambda/getrolepolicy)
 */
export const getRolePolicy = (options?: GetPolicyOptions) =>
	JSON.stringify(makeRolePolicy(options?.partition ?? 'aws'), null, 2);
