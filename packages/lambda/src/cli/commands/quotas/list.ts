import {
	GetAWSDefaultServiceQuotaCommand,
	GetServiceQuotaCommand,
	ListRequestedServiceQuotaChangeHistoryByQuotaCommand,
} from '@aws-sdk/client-service-quotas';
import {CliInternals} from '@remotion/cli';
import {QUOTAS_COMMAND} from '.';
import {
	BINARY_NAME,
	LAMBDA_BURST_LIMIT_QUOTA,
	LAMBDA_CONCURRENCY_LIMIT_QUOTA,
} from '../../../defaults';
import {getServiceQuotasClient} from '../../../shared/aws-clients';
import {getAwsRegion} from '../../get-aws-region';
import {Log} from '../../log';
import {INCREASE_SUBCOMMAND} from './increase';

export const quotasListCommand = async () => {
	const region = getAwsRegion();
	Log.info(CliInternals.chalk.gray(`Region = ${region}`));
	Log.info();
	const [concurrencyLimit, defaultConcurrencyLimit, burstLimit, changes] =
		await Promise.all([
			getServiceQuotasClient(region, null).send(
				new GetServiceQuotaCommand({
					QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				})
			),
			getServiceQuotasClient(region, null).send(
				new GetAWSDefaultServiceQuotaCommand({
					QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				})
			),
			getServiceQuotasClient(region, null).send(
				new GetAWSDefaultServiceQuotaCommand({
					QuotaCode: LAMBDA_BURST_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				})
			),
			getServiceQuotasClient(region, null).send(
				new ListRequestedServiceQuotaChangeHistoryByQuotaCommand({
					QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				})
			),
		]);

	const openCase = changes.RequestedQuotas?.find(
		(r) => r.Status === 'CASE_OPENED'
	);

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

	if (openCase) {
		Log.warn(
			`A request to increase it to ${openCase.DesiredValue} is pending:`
		);
		Log.warn(
			`https://${region}.console.aws.amazon.com/support/home#/case/?displayId=${openCase.CaseId}`
		);
	}

	Log.info(
		CliInternals.chalk.gray(
			'The maximum amount of Lambda functions which can concurrently execute.'
		)
	);
	Log.info(
		CliInternals.chalk.gray(
			`Run \`npx ${BINARY_NAME} ${QUOTAS_COMMAND} ${INCREASE_SUBCOMMAND}\` to ask AWS to increase your limit.`
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
