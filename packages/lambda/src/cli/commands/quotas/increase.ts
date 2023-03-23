import {
	GetAWSDefaultServiceQuotaCommand,
	GetServiceQuotaCommand,
	ListRequestedServiceQuotaChangeHistoryByQuotaCommand,
	RequestServiceQuotaIncreaseCommand,
} from '@aws-sdk/client-service-quotas';
import {exit} from 'process';
import {QUOTAS_COMMAND} from '.';
import type {AwsRegion} from '../../../client';
import {BINARY_NAME, LAMBDA_CONCURRENCY_LIMIT_QUOTA} from '../../../defaults';
import {getServiceQuotasClient} from '../../../shared/aws-clients';
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

export const quotasIncreaseCommand = async () => {
	const region = getAwsRegion();

	const [concurrencyLimit, defaultConcurrencyLimit, changes] =
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
				new ListRequestedServiceQuotaChangeHistoryByQuotaCommand({
					QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
					ServiceCode: 'lambda',
				})
			),
		]);

	const openCase = changes.RequestedQuotas?.find(
		(r) => r.Status === 'CASE_OPENED'
	);
	if (openCase) {
		Log.warn(
			`A request to increase it to ${openCase.DesiredValue} is already pending:`
		);
		Log.warn(
			`https://${region}.console.aws.amazon.com/support/home#/case/?displayId=${openCase.CaseId}`
		);
		exit(1);
	}

	const concurrencyCurrent = concurrencyLimit.Quota?.Value as number;
	const defaultConcurrency = defaultConcurrencyLimit.Quota?.Value as number;
	const increaseRecommended = concurrencyCurrent <= defaultConcurrency;
	if (!increaseRecommended && !forceFlagProvided) {
		Log.error(
			`Current limit of ${concurrencyCurrent} is already increased over the default (${defaultConcurrency}).`
		);
		Log.info('You can force the increase with the --force flag.');
		Log.info(
			'You are more likely to get an increase if you attach a reason. Go so by going to the AWS console:'
		);
		Log.info(makeQuotaUrl({quotaId: LAMBDA_CONCURRENCY_LIMIT_QUOTA, region}));
		quit(1);
	}

	const newLimit = Math.floor(concurrencyCurrent / 5000) * 5000 + 5000;
	Log.info(
		`Sending request to AWS to increase concurrency limit from ${concurrencyCurrent} to ${newLimit}.`
	);
	await confirmCli({
		allowForceFlag: true,
		delMessage: 'Send? (Y/n)',
	});
	try {
		await getServiceQuotasClient(region).send(
			new RequestServiceQuotaIncreaseCommand({
				QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
				DesiredValue: newLimit,
				ServiceCode: 'lambda',
			})
		);
	} catch (err) {
		if ((err as Error).name === 'DependencyAccessDeniedException') {
			Log.error(
				'Could not request increase because this is a sub-account of another AWS account.'
			);
			Log.error(
				`Please go to ${makeQuotaUrl({
					quotaId: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
					region,
				})} to request the increase via the AWS console.`
			);
			return;
		}

		throw err;
	}

	Log.info(
		`Requested increase successfully. Run "${BINARY_NAME} ${QUOTAS_COMMAND}" to check whether your request was approved.`
	);
};
