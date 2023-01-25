import {GetCallerIdentityCommand} from '@aws-sdk/client-sts';
import type {AwsRegion} from '../pricing/aws-regions';
import {getStsClient} from './aws-clients';
import {validateAwsRegion} from './validate-aws-region';

export const getAccountId = async (options: {region: AwsRegion}) => {
	validateAwsRegion(options.region);

	const callerIdentity = await getStsClient(options.region).send(new GetCallerIdentityCommand({}));

	if (!callerIdentity.Account) {
		throw new Error('Cannot get account ID');
	}

	return callerIdentity.Account;
};
