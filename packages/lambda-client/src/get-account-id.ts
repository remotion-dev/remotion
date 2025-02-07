import {GetCallerIdentityCommand} from '@aws-sdk/client-sts';
import type {GetAccountId} from '@remotion/serverless-client';
import {getStsClient} from './aws-clients';
import type {AwsProvider} from './aws-provider';
import type {AwsRegion} from './regions';
import {validateAwsRegion} from './validate-aws-region';

export const getAccountIdImplementation: GetAccountId<
	AwsProvider
> = async (options: {region: AwsRegion}) => {
	validateAwsRegion(options.region);

	const callerIdentity = await getStsClient(options.region).send(
		new GetCallerIdentityCommand({}),
	);

	if (!callerIdentity.Account) {
		throw new Error('Cannot get account ID');
	}

	return callerIdentity.Account;
};
