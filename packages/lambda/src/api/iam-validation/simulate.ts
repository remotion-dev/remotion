import {GetCallerIdentityCommand} from '@aws-sdk/client-sts';
import type {AwsRegion, RequestHandler} from '@remotion/lambda-client';
import {LambdaClientInternals} from '@remotion/lambda-client';
import {resolveCallerArnForSimulation} from './resolve-caller-arn';
import type {EvalDecision, SimulationResult} from './simulate-rule';
import {simulateRule} from './simulate-rule';
import {getRequiredPermissions} from './user-permissions';

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
	requestHandler?: RequestHandler;
};

export type SimulatePermissionsOutput = {
	results: SimulationResult[];
};

/*
 * @description Simulates calls using the AWS Simulator to validate the correct permissions.
 * @see [Documentation](https://remotion.dev/docs/lambda/simulatepermissions)
 */
export const simulatePermissions = async (
	options: SimulatePermissionsInput,
): Promise<SimulatePermissionsOutput> => {
	const callerIdentity = await LambdaClientInternals.getStsClient(
		options.region,
		options.requestHandler,
	).send(new GetCallerIdentityCommand({}));

	if (!callerIdentity?.Arn) {
		throw new Error('No valid AWS Caller Identity detected');
	}

	const {partition: regionPartition} =
		LambdaClientInternals.getAwsRegionMetadata(options.region);
	const callerArn = resolveCallerArnForSimulation({
		callerIdentityArn: callerIdentity.Arn,
		region: options.region,
		regionPartition,
	});

	const results: SimulationResult[] = [];

	for (const per of getRequiredPermissions(regionPartition)) {
		const result = await simulateRule({
			actionNames: per.actions,
			arn: callerArn,
			region: options.region,
			resource: per.resource,
			retries: 2,
			requestHandler: options.requestHandler,
		});
		for (const res of result) {
			results.push(res);
			options.onSimulation?.(res);
		}
	}

	return {results};
};
