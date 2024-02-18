import {
	GetAWSDefaultServiceQuotaCommand,
	GetServiceQuotaCommand,
	ListRequestedServiceQuotaChangeHistoryByQuotaCommand,
} from '@aws-sdk/client-service-quotas';
import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
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

export const quotasListCommand = async (logLevel: LogLevel) => {
	const region = getAwsRegion();
	Log.infoAdvanced(
		{indent: false, logLevel},
		CliInternals.chalk.gray(`Region = ${region}`),
	);
	Log.infoAdvanced({indent: false, logLevel});
	const [concurrencyLimit, defaultConcurrencyLimit, burstLimit, changes] =
		await Promise.all([
			getServiceQuotasClient(region).send(
				new GetServiceQuotaCommand({
					QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				}),
			),
			getServiceQuotasClient(region).send(
				new GetAWSDefaultServiceQuotaCommand({
					QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				}),
			),
			getServiceQuotasClient(region).send(
				new GetAWSDefaultServiceQuotaCommand({
					QuotaCode: LAMBDA_BURST_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				}),
			),
			getServiceQuotasClient(region).send(
				new ListRequestedServiceQuotaChangeHistoryByQuotaCommand({
					QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				}),
			),
		]);

	const openCase = changes.RequestedQuotas?.find(
		(r) => r.Status === 'CASE_OPENED',
	);

	const concurrencyCurrent = concurrencyLimit.Quota?.Value as number;
	const defaultConcurrency = defaultConcurrencyLimit.Quota?.Value as number;
	const burstDefault = burstLimit.Quota?.Value as number;

	const increaseRecommended = concurrencyCurrent <= defaultConcurrency;
	const effectiveBurstConcurrency = Math.min(burstDefault, defaultConcurrency);

	if (increaseRecommended) {
		Log.infoAdvanced(
			{indent: false, logLevel},
			`Concurrency limit: ${concurrencyCurrent} - ${
				increaseRecommended
					? CliInternals.chalk.greenBright('Increase recommended!')
					: ''
			}`,
		);
	} else {
		Log.infoAdvanced(
			{indent: false, logLevel},
			`Concurrency limit: ${concurrencyCurrent}`,
		);
	}

	if (openCase) {
		Log.warn(
			{indent: false, logLevel},
			`A request to increase it to ${openCase.DesiredValue} is pending:`,
		);
		Log.warn(
			{indent: false, logLevel},
			`https://${region}.console.aws.amazon.com/support/home#/case/?displayId=${openCase.CaseId}`,
		);
	}

	Log.infoAdvanced(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			'The maximum amount of Lambda functions which can concurrently execute.',
		),
	);
	Log.infoAdvanced(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			`Run \`npx ${BINARY_NAME} ${QUOTAS_COMMAND} ${INCREASE_SUBCOMMAND}\` to ask AWS to increase your limit.`,
		),
	);
	Log.infoAdvanced({indent: false, logLevel});

	if (effectiveBurstConcurrency === burstDefault) {
		Log.infoAdvanced(
			{indent: false, logLevel},
			`Burst concurrency: ${burstDefault}`,
		);
	} else {
		Log.infoAdvanced(
			{indent: false, logLevel},
			`Burst concurrency: ${burstDefault}, but only ${effectiveBurstConcurrency} effective because of concurrency limit`,
		);
	}

	Log.infoAdvanced(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			'The maximum amount of concurrency increase in 10 seconds',
		),
	);
};
