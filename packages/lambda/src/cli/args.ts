import {CliInternals} from '@remotion/cli';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import type {AwsRegion, DeleteAfter, RuntimePreference} from '../client';

import type {Privacy} from '@remotion/serverless';

type LambdaCommandLineOptions = {
	help: boolean;
	region: AwsRegion;
	memory: number;
	disk: number;
	timeout: number;
	['retention-period']: number;
	y: boolean;
	yes: boolean;
	force: boolean;
	f: boolean;
	['default-only']: boolean;

	['site-name']: string | undefined;
	['disable-chunk-optimization']: boolean;
	['save-browser-logs']: boolean;
	['disable-cloudwatch']: boolean;
	[BrowserSafeApis.options.enableLambdaInsights.cliFlag]: boolean;
	['max-retries']?: number;
	['frames-per-lambda']?: number;
	['concurrency-per-lambda']?: number;
	['out-name']: string | undefined;
	['custom-role-arn']: string | undefined;
	privacy: Privacy;
	webhook: string | undefined;
	['webhook-secret']: string | undefined;
	[BrowserSafeApis.options.webhookCustomDataOption.cliFlag]: string | undefined;
	['renderer-function-name']: string | undefined;
	['function-name']: string | undefined;
	['force-bucket-name']: string | undefined;
	[BrowserSafeApis.options.deleteAfterOption.cliFlag]: DeleteAfter | undefined;
	[BrowserSafeApis.options.folderExpiryOption.cliFlag]: boolean | undefined;
	['vpc-subnet-ids']: string | undefined;
	['vpc-security-group-ids']: string | undefined;
	['compatible-only']: boolean;
	['force-path-style']: boolean;
	['runtime-preference']: RuntimePreference;
};

export const parsedLambdaCli = CliInternals.minimist<LambdaCommandLineOptions>(
	process.argv.slice(2),
	{
		boolean: CliInternals.BooleanFlags,
		string: ['_'],
	},
);

export const forceFlagProvided =
	parsedLambdaCli.f ||
	parsedLambdaCli.force ||
	parsedLambdaCli.yes ||
	parsedLambdaCli.y;
