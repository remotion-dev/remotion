import {
	EvaluationResult,
	GetUserCommand,
	SimulatePrincipalPolicyCommand,
	SimulatePrincipalPolicyCommandOutput,
} from '@aws-sdk/client-iam';
import {Log} from '../../cli/log';
import {AwsRegion} from '../../pricing/aws-regions';
import {getIamClient} from '../../shared/aws-clients';
import {requiredPermissions} from './required-permissions';

type EvalDecision = 'allowed' | 'explicitDeny' | 'implicitDeny';

type ExplicitEvaluationResult = Omit<EvaluationResult, 'EvalDecision'> & {
	EvalDecision: EvalDecision;
};

const getEmojiForStatus = (decision: EvalDecision) => {
	switch (decision) {
		case 'allowed':
			return '✅';
		default:
			return '❌';
	}
};

const logPermissionOutput = (output: SimulatePrincipalPolicyCommandOutput) => {
	const results = output.EvaluationResults as ExplicitEvaluationResult[];
	for (const result of results) {
		Log.info(
			[getEmojiForStatus(result.EvalDecision), result.EvalActionName].join(' ')
		);
	}
};

export const simulatePermissions = async (options: {region: AwsRegion}) => {
	const user = await getIamClient(options.region).send(new GetUserCommand({}));

	if (!user || !user.User) {
		throw new Error('No valid AWS user detected');
	}

	for (const per of requiredPermissions) {
		logPermissionOutput(
			await getIamClient(options.region).send(
				new SimulatePrincipalPolicyCommand({
					ActionNames: per.actions,
					PolicySourceArn: user.User.Arn,
					ResourceArns: per.resource.map((r) =>
						// eslint-disable-next-line no-template-curly-in-string
						r.replace('${aws:username}', user.User?.UserName as string)
					),
				})
			)
		);
	}
};
