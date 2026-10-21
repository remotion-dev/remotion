import {GetCallerIdentityCommand} from '@aws-sdk/client-sts';
import {getStsClient} from './aws-clients';
import type {GetAccountId} from './aws-operations';
import type {AwsRegion} from './regions';
import {validateAwsRegion} from './validate-aws-region';

export const getAccountIdImplementation: GetAccountId = async (options: {
	region: AwsRegion;
}) => {
	validateAwsRegion(options.region);

	const callerIdentity = await getStsClient(options.region, null).send(
		new GetCallerIdentityCommand({}),
	);

	if (!callerIdentity.Account) {
		throw new Error('Cannot get account ID');
	}

	return callerIdentity.Account;
};
