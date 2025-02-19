import {SimulatePrincipalPolicyCommand} from '@aws-sdk/client-iam';
import type {AwsRegion} from '@remotion/lambda-client';
import {LambdaClientInternals} from '@remotion/lambda-client';

export type EvalDecision = 'allowed' | 'explicitDeny' | 'implicitDeny';

export type SimulationResult = {
	decision: EvalDecision;
	name: string;
};

export const simulateRule = async (options: {
	region: AwsRegion;
	actionNames: string[];
	arn: string;
	resource: string[];
	retries: number;
}): Promise<SimulationResult[]> => {
	try {
		const res = await LambdaClientInternals.getIamClient(options.region).send(
			new SimulatePrincipalPolicyCommand({
				ActionNames: options.actionNames,
				PolicySourceArn: options.arn,
				ResourceArns: options.resource,
			}),
		);

		return (res.EvaluationResults ?? []).map((pol): SimulationResult => {
			return {
				decision: pol.EvalDecision as EvalDecision,
				name: pol.EvalActionName as string,
			};
		});
	} catch (err) {
		// Sometimes the AWS Rate limit hits. In that case we retry up to two times
		// after waiting for 2 seconds.
		if (options.retries <= 0) {
			throw err;
		}

		await new Promise((resolve) => {
			setTimeout(resolve, 2000);
		});
		return simulateRule({...options, retries: options.retries - 1});
	}
};
