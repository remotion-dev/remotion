import {GetCallerIdentityCommand} from '@aws-sdk/client-sts';
import type {AwsRegion} from '../../pricing/aws-regions';
import {getStsClient} from '../../shared/aws-clients';
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
 * @see [Documentation](http://remotion.dev/docs/lambda/simulatepermissions)
 * @param {AwsRegion} options.region The region which you would like to validate
 * @param {(result: SimulationResult) => void} options.onSimulation The region which you would like to validate
 * @returns {Promise<SimulatePermissionsOutput>} See documentation for detailed response structure.
 */
export const simulatePermissions = async (
	options: SimulatePermissionsInput
): Promise<SimulatePermissionsOutput> => {
	const callerIdentity = await getStsClient(options.region).send(
		new GetCallerIdentityCommand({})
	);

	if (!callerIdentity?.Arn) {
		throw new Error('No valid AWS Caller Identity detected');
	}

	const callerIdentityArnComponents = callerIdentity.Arn.match(
		/arn:aws:([^:]+)::(\d+):([^/]+)(.*)/
	);
	if (!callerIdentityArnComponents) {
		throw new Error('Unknown AWS Caller Identity ARN detected');
	}

	const callerIdentityArnType = callerIdentityArnComponents[1];

	let callerArn;
	if (
		callerIdentityArnType === 'iam' &&
		callerIdentityArnComponents[3] === 'user'
	) {
		callerArn = callerIdentity.Arn as string;
	} else if (
		callerIdentityArnType === 'sts' &&
		callerIdentityArnComponents[3] === 'assumed-role'
	) {
		const assumedRoleComponents =
			callerIdentityArnComponents[4].match(/\/([^/]+)\/(.*)/);
		if (!assumedRoleComponents) {
			throw new Error(
				'Unsupported AWS Caller Identity as Assumed-Role ARN detected'
			);
		}

		callerArn = `arn:aws:iam::${callerIdentityArnComponents[2]}:role/${assumedRoleComponents[1]}`;
	} else {
		throw new Error('Unsupported AWS Caller Identity ARN detected');
	}

	const results: SimulationResult[] = [];

	for (const per of requiredPermissions) {
		const result = await simulateRule({
			actionNames: per.actions,
			arn: callerArn,
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
