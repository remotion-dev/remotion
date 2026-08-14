import type {AwsPartition, AwsRegion} from '@remotion/lambda-client';

export const resolveCallerArnForSimulation = ({
	callerIdentityArn,
	region,
	regionPartition,
}: {
	callerIdentityArn: string;
	region: AwsRegion;
	regionPartition: AwsPartition;
}): string => {
	const components = callerIdentityArn.match(
		/^arn:([^:]+):([^:]+)::(\d+):([^/]+)(.*)$/,
	);
	if (!components) {
		throw new Error('Unknown AWS Caller Identity ARN detected');
	}

	const callerPartition = components[1];
	if (callerPartition !== regionPartition) {
		throw new Error(
			`AWS Caller Identity partition ${callerPartition} does not match region ${region}, which uses partition ${regionPartition}.`,
		);
	}

	const service = components[2];
	const accountId = components[3];
	const resourceType = components[4];
	if (service === 'iam' && resourceType === 'user') {
		return callerIdentityArn;
	}

	if (service === 'sts' && resourceType === 'assumed-role') {
		const assumedRoleComponents = components[5].match(/^\/([^/]+)\/(.*)$/);
		if (!assumedRoleComponents) {
			throw new Error(
				'Unsupported AWS Caller Identity as Assumed-Role ARN detected',
			);
		}

		return `arn:${callerPartition}:iam::${accountId}:role/${assumedRoleComponents[1]}`;
	}

	throw new Error('Unsupported AWS Caller Identity ARN detected');
};
