import {
	GetAWSDefaultServiceQuotaCommand,
	GetServiceQuotaCommand,
} from '@aws-sdk/client-service-quotas';
import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {
	LAMBDA_BURST_LIMIT_QUOTA,
	LAMBDA_CONCURRENCY_LIMIT_QUOTA,
} from '../../../defaults';
import {getServiceQuotasClient} from '../../../shared/aws-clients';
import {getAwsRegion} from '../../get-aws-region';

export const QUOTAS_COMMAND = 'quotas';

export const quotasCommand = async () => {
	const region = getAwsRegion();
	Log.info(CliInternals.chalk.gray(`Region = ${region}`));
	Log.info();
	const [concurrencyLimit, defaultConcurrencyLimit, burstLimit] =
		await Promise.all([
			getServiceQuotasClient(region).send(
				new GetServiceQuotaCommand({
					QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				})
			),
			getServiceQuotasClient(region).send(
				new GetAWSDefaultServiceQuotaCommand({
					QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				})
			),
			getServiceQuotasClient(region).send(
				new GetAWSDefaultServiceQuotaCommand({
					QuotaCode: LAMBDA_BURST_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				})
			),
		]);

	const concurrencyCurrent = concurrencyLimit.Quota?.Value as number;
	const defaultConcurrency = defaultConcurrencyLimit.Quota?.Value as number;
	const burstDefault = burstLimit.Quota?.Value as number;

	const increaseRecommended = concurrencyCurrent <= defaultConcurrency;
	const effectiveBurstConcurrency = Math.min(burstDefault, defaultConcurrency);

	if (increaseRecommended) {
		Log.info(
			`Concurrency limit: ${concurrencyCurrent} - ${
				increaseRecommended
					? CliInternals.chalk.greenBright('Increase recommended!')
					: ''
			}`
		);
	} else {
		Log.info(`Concurrency limit: ${concurrencyCurrent}`);
	}

	Log.info(
		CliInternals.chalk.gray(
			'The maximum amount of Lambda functions which can concurrently execute'
		)
	);
	Log.info();

	if (effectiveBurstConcurrency === burstDefault) {
		Log.info(`Burst concurrency: ${burstDefault}`);
	} else {
		Log.info(
			`Burst concurrency: ${burstDefault}, but only ${effectiveBurstConcurrency} effective because of concurrency limit`
		);
	}

	Log.info(
		CliInternals.chalk.gray(
			'The maximum amount of Lambda functions that can spawn in a short amount of time'
		)
	);
};
