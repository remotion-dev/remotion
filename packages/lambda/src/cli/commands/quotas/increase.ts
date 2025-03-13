import {
	GetAWSDefaultServiceQuotaCommand,
	GetServiceQuotaCommand,
	ListRequestedServiceQuotaChangeHistoryByQuotaCommand,
	RequestServiceQuotaIncreaseCommand,
} from '@aws-sdk/client-service-quotas';
import {AwsRegion, LambdaClientInternals} from '@remotion/lambda-client';
import {
	BINARY_NAME,
	LAMBDA_CONCURRENCY_LIMIT_QUOTA,
} from '@remotion/lambda-client/constants';
import type {LogLevel, LogOptions} from '@remotion/renderer';
import {exit} from 'node:process';
import {QUOTAS_COMMAND} from '.';
import {forceFlagProvided} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import {confirmCli} from '../../helpers/confirm';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const INCREASE_SUBCOMMAND = 'increase';

const makeQuotaUrl = ({
	region,
	quotaId,
}: {
	region: AwsRegion;
	quotaId: string;
}) => {
	return `https://${region}.console.aws.amazon.com/servicequotas/home/services/lambda/quotas/${quotaId}`;
};

export const quotasIncreaseCommand = async (logLevel: LogLevel) => {
	const region = getAwsRegion();

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
	if (openCase) {
		const logOptions: LogOptions = {
			indent: false,
			logLevel,
		};
		Log.warn(
			logOptions,
			`A request to increase it to ${openCase.DesiredValue} is already pending:`,
		);
		Log.warn(
			logOptions,
			`https://${region}.console.aws.amazon.com/support/home#/case/?displayId=${openCase.CaseId}`,
		);
		exit(1);
	}

	const concurrencyCurrent = concurrencyLimit.Quota?.Value as number;
	const defaultConcurrency = defaultConcurrencyLimit.Quota?.Value as number;
	const increaseRecommended = concurrencyCurrent <= defaultConcurrency;
	if (!increaseRecommended && !forceFlagProvided) {
		Log.error(
			{indent: false, logLevel},
			`Current limit of ${concurrencyCurrent} is already increased over the default (${defaultConcurrency}).`,
		);
		Log.info(
			{indent: false, logLevel},
			'You can force the increase with the --force flag.',
		);
		Log.info(
			{indent: false, logLevel},
			'You are more likely to get an increase if you attach a reason. Go so by going to the AWS console:',
		);
		Log.info(
			{indent: false, logLevel},
			makeQuotaUrl({quotaId: LAMBDA_CONCURRENCY_LIMIT_QUOTA, region}),
		);
		quit(1);
	}

	const newLimit = Math.floor(concurrencyCurrent / 5000) * 5000 + 5000;
	Log.info(
		{indent: false, logLevel},
		`Sending request to AWS to increase concurrency limit from ${concurrencyCurrent} to ${newLimit}.`,
	);
	if (
		!(await confirmCli({
			allowForceFlag: true,
			delMessage: 'Send? (Y/n)',
		}))
	) {
		quit(1);
	}

	try {
		await LambdaClientInternals.getServiceQuotasClient(region).send(
			new RequestServiceQuotaIncreaseCommand({
				QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
				DesiredValue: newLimit,
				ServiceCode: 'lambda',
			}),
		);
	} catch (err) {
		if ((err as Error).name === 'DependencyAccessDeniedException') {
			Log.error(
				{indent: false, logLevel},
				'Could not request increase because this is a sub-account of another AWS account.',
			);
			Log.error(
				{indent: false, logLevel},
				`Please go to ${makeQuotaUrl({
					quotaId: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
					region,
				})} to request the increase via the AWS console.`,
			);
			return;
		}

		throw err;
	}

	Log.info(
		{indent: false, logLevel},
		`Requested increase successfully. Run "${BINARY_NAME} ${QUOTAS_COMMAND}" to check whether your request was approved.`,
	);
};
