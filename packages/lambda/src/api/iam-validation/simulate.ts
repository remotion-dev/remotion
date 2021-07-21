import {GetUserCommand} from '@aws-sdk/client-iam';
import {Log} from '../../cli/log';
import {AwsRegion} from '../../pricing/aws-regions';
import {getIamClient} from '../../shared/aws-clients';
import {requiredPermissions} from './required-permissions';
import {EvalDecision, simulateRule, SimulationResult} from './simulate-rule';

const getEmojiForStatus = (decision: EvalDecision) => {
	switch (decision) {
		case 'allowed':
			return '✅';
		default:
			return '❌';
	}
};

const logPermissionOutput = (output: SimulationResult[]) => {
	for (const result of output) {
		Log.info([getEmojiForStatus(result.decision), result.name].join(' '));
	}
};

export const simulatePermissions = async (options: {region: AwsRegion}) => {
	const user = await getIamClient(options.region).send(new GetUserCommand({}));

	if (!user || !user.User) {
		throw new Error('No valid AWS user detected');
	}

	for (const per of requiredPermissions) {
		logPermissionOutput(
			await simulateRule({
				actionNames: per.actions,
				arn: user.User.Arn as string,
				region: options.region,
				resource: per.resource,
			})
		);
	}
};
