import {
	GetAWSDefaultServiceQuotaCommand,
	GetServiceQuotaCommand,
	ListRequestedServiceQuotaChangeHistoryByQuotaCommand,
} from '@aws-sdk/client-service-quotas';
import {CliInternals} from '@remotion/cli';
import {LambdaClientInternals} from '@remotion/lambda-client';
import {
	BINARY_NAME,
	LAMBDA_CONCURRENCY_LIMIT_QUOTA,
} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {QUOTAS_COMMAND} from '.';
import {getAwsRegion} from '../../get-aws-region';
import {Log} from '../../log';
import {INCREASE_SUBCOMMAND} from './increase';

export const quotasListCommand = async (logLevel: LogLevel) => {
	const region = getAwsRegion();
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(`Region = ${region}`),
	);
	Log.info({indent: false, logLevel});
	const [concurrencyLimit, defaultConcurrencyLimit, changes] =
		await Promise.all([
			LambdaClientInternals.getServiceQuotasClient(region).send(
				new GetServiceQuotaCommand({
					QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				}),
			),
			LambdaClientInternals.getServiceQuotasClient(region).send(
				new GetAWSDefaultServiceQuotaCommand({
					QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				}),
			),
			LambdaClientInternals.getServiceQuotasClient(region).send(
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

	const increaseRecommended = concurrencyCurrent <= defaultConcurrency;

	if (increaseRecommended) {
		Log.info(
			{indent: false, logLevel},
			`Concurrency limit: ${concurrencyCurrent} - ${
				increaseRecommended
					? CliInternals.chalk.greenBright('Increase recommended!')
					: ''
			}`,
		);
	} else {
		Log.info(
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

	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			'The maximum amount of Lambda functions which can concurrently execute.',
		),
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			`Run \`npx ${BINARY_NAME} ${QUOTAS_COMMAND} ${INCREASE_SUBCOMMAND}\` to ask AWS to increase your limit.`,
		),
	);
	Log.info({indent: false, logLevel});

	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			'The maximum amount of concurrency increase in 10 seconds',
		),
	);
};
