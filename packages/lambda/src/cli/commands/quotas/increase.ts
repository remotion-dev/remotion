import {
	GetAWSDefaultServiceQuotaCommand,
	GetServiceQuotaCommand,
	ListRequestedServiceQuotaChangeHistoryByQuotaCommand,
	RequestServiceQuotaIncreaseCommand,
} from '@aws-sdk/client-service-quotas';
import {Log} from '@remotion/cli/dist/log';
import {exit} from 'process';
import {QUOTAS_COMMAND} from '.';
import {BINARY_NAME, LAMBDA_CONCURRENCY_LIMIT_QUOTA} from '../../../defaults';
import {getServiceQuotasClient} from '../../../shared/aws-clients';
import {getAwsRegion} from '../../get-aws-region';
import {confirmCli} from '../../helpers/confirm';
import {quit} from '../../helpers/quit';

export const INCREASE_SUBCOMMAND = 'increase';

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
	if (!increaseRecommended) {
		Log.info(
			`Current limit of ${concurrencyCurrent} is already increased over the default (${defaultConcurrency}). Increase it further via the AWS console.`
		);
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
	await getServiceQuotasClient(region).send(
		new RequestServiceQuotaIncreaseCommand({
			QuotaCode: LAMBDA_CONCURRENCY_LIMIT_QUOTA,
			DesiredValue: newLimit,
			ServiceCode: 'lambda',
		})
	);
	Log.info(
		`Requested increase successfully. Run "${BINARY_NAME} ${QUOTAS_COMMAND}" to check whether your request was approved.`
	);
};
