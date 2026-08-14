import {expect, spyOn, test} from 'bun:test';
import {
	GetAWSDefaultServiceQuotaCommand,
	GetServiceQuotaCommand,
	ListRequestedServiceQuotaChangeHistoryByQuotaCommand,
} from '@aws-sdk/client-service-quotas';
import {LambdaClientInternals} from '@remotion/lambda-client';
import {parsedLambdaCli} from '../../cli/args';
import {quotasIncreaseCommand} from '../../cli/commands/quotas/increase';
import {quotasListCommand} from '../../cli/commands/quotas/list';
import {
	doAfter,
	doBefore,
	getProcessWriteOutput,
} from '../integration/console-hooks';

test('quota CLI links use the AWS China console domain', async () => {
	const originalRegion = parsedLambdaCli.region;
	let requestedQuotas = [
		{
			Status: 'CASE_OPENED' as const,
			DesiredValue: 10_000,
			CaseId: 'china-support-case',
		},
	];
	const serviceQuotasClientSpy = spyOn(
		LambdaClientInternals,
		'getServiceQuotasClient',
	).mockReturnValue({
		send: (command: unknown) => {
			if (command instanceof GetServiceQuotaCommand) {
				return Promise.resolve({Quota: {Value: 6_000}});
			}

			if (command instanceof GetAWSDefaultServiceQuotaCommand) {
				return Promise.resolve({Quota: {Value: 1_000}});
			}

			if (
				command instanceof ListRequestedServiceQuotaChangeHistoryByQuotaCommand
			) {
				return Promise.resolve({RequestedQuotas: requestedQuotas});
			}

			return Promise.reject(
				new Error(`Unexpected command: ${String(command)}`),
			);
		},
	} as never);
	const exitSpy = spyOn(process, 'exit').mockImplementation((code) => {
		throw new Error(`process.exit(${code})`);
	});

	parsedLambdaCli.region = 'cn-north-1';
	doBefore();
	const warnings: string[] = [];
	const warnSpy = spyOn(console, 'warn').mockImplementation((...args) => {
		warnings.push(args.join(' '));
	});
	try {
		await quotasListCommand('info');
		requestedQuotas = [];
		await expect(quotasIncreaseCommand('info', null)).rejects.toThrow(
			'process.exit(1)',
		);

		const stdout = getProcessWriteOutput();
		const warningOutput = warnings.join('\n');
		expect(warningOutput).toContain(
			'https://cn-north-1.console.amazonaws.cn/support/home#/case/?displayId=china-support-case',
		);
		expect(stdout).toContain(
			'https://cn-north-1.console.amazonaws.cn/servicequotas/home/services/lambda/quotas/L-B99A9384',
		);
		expect(`${stdout}\n${warningOutput}`).not.toContain(
			'console.aws.amazon.com',
		);
	} finally {
		doAfter();
		parsedLambdaCli.region = originalRegion;
		serviceQuotasClientSpy.mockRestore();
		exitSpy.mockRestore();
		warnSpy.mockRestore();
	}
});
