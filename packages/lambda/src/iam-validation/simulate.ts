import {
	EvaluationResult,
	GetUserCommand,
	SimulatePrincipalPolicyCommand,
	SimulatePrincipalPolicyCommandOutput,
} from '@aws-sdk/client-iam';
import {lambda, s3} from 'aws-policies';
import {iamClient} from '../aws-clients';
import {Log} from '../cli/log';

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

export const simulatePermissions = async () => {
	const user = await iamClient.send(new GetUserCommand({}));

	if (!user || !user.User) {
		throw new Error('No valid AWS user detected');
	}

	logPermissionOutput(
		await iamClient.send(
			new SimulatePrincipalPolicyCommand({
				ActionNames: [s3.GetObject],
				PolicySourceArn: user.User.Arn,
				ResourceArns: ['arn:aws:s3:::remotion-*'],
			})
		)
	);
	logPermissionOutput(
		await iamClient.send(
			new SimulatePrincipalPolicyCommand({
				ActionNames: [s3.ListAllMyBuckets],
				PolicySourceArn: user.User.Arn,
				ResourceArns: ['*'],
			})
		)
	);
	logPermissionOutput(
		await iamClient.send(
			new SimulatePrincipalPolicyCommand({
				ActionNames: [lambda.InvokeFunction],
				PolicySourceArn: user.User.Arn,
				ResourceArns: ['arn:aws:lambda:::remotion-*'],
			})
		)
	);
};
