import {CliInternals} from '@remotion/cli';
import minimist from 'minimist';
import {AwsRegion} from '../pricing/aws-regions';
import {Privacy} from '../shared/constants';
import {LambdaArchitecture} from '../shared/validate-architecture';

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

	['site-name']: string | undefined;
	['disable-chunk-optimization']: boolean;
	['save-browser-logs']: boolean;
	['disable-cloudwatch']: boolean;
	['max-retries']: number;
	['out-name']: string | undefined;
	['architecture']: LambdaArchitecture;
	privacy: Privacy;
};

export const parsedLambdaCli = minimist<LambdaCommandLineOptions>(
	process.argv.slice(2),
	{
		boolean: CliInternals.BooleanFlags,
	}
);

export const forceFlagProvided =
	parsedLambdaCli.f ||
	parsedLambdaCli.force ||
	parsedLambdaCli.yes ||
	parsedLambdaCli.y;
