import {GetUserCommand} from '@aws-sdk/client-iam';
import type {AwsRegion} from '../../pricing/aws-regions';
import {getIamClient} from '../../shared/aws-clients';
import type {EvalDecision, SimulationResult} from './simulate-rule';
import {simulateRule} from './simulate-rule';
import {requiredPermissions} from './user-permissions';

const getEmojiForStatus = (decision: EvalDecision) => {
	switch (decision) {
		case 'allowed':
			return '✅';
		default:
			return '❌';
	}
};

export const logPermissionOutput = (output: SimulationResult) => {
	return [getEmojiForStatus(output.decision), output.name].join(' ');
};

export type SimulatePermissionsInput = {
	region: AwsRegion;
	onSimulation?: (result: SimulationResult) => void;
};

export type SimulatePermissionsOutput = {
	results: SimulationResult[];
};

/**
 * @description Simulates calls using the AWS Simulator to validate the correct permissions.
 * @link http://remotion.dev/docs/lambda/simulatepermissions
 * @param {AwsRegion} options.region The region which you would like to validate
 * @param {(result: SimulationResult) => void} options.onSimulation The region which you would like to validate
 * @returns {Promise<SimulatePermissionsOutput>} See documentation for detailed response structure.
 */
export const simulatePermissions = async (
	options: SimulatePermissionsInput
): Promise<SimulatePermissionsOutput> => {
	const user = await getIamClient(options.region).send(new GetUserCommand({}));

	if (!user || !user.User) {
		throw new Error('No valid AWS user detected');
	}

	const results: SimulationResult[] = [];

	for (const per of requiredPermissions) {
		const result = await simulateRule({
			actionNames: per.actions,
			arn: user.User.Arn as string,
			region: options.region,
			resource: per.resource,
			retries: 2,
		});
		for (const res of result) {
			results.push(res);
			options.onSimulation?.(res);
		}
	}

	return {results};
};
