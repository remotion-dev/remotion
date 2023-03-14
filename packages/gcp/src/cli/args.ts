import {CliInternals} from '@remotion/cli';

import type {GcpRegion} from '../pricing/gcp-regions';

type GCPCommandLineOptions = {
	help: boolean;
	region: GcpRegion;
	['project-id']: string;
	['service-name']: string;
	['allow-unauthenticated']: boolean | undefined;
	y: boolean;
	yes: boolean;
	force: boolean;
	f: boolean;

	['max-retries']: number;
	['out-name']: string | undefined;
	['output-bucket']: string;
	['output-folder-path']: string;
};

export const parsedGcpCli = CliInternals.minimist<GCPCommandLineOptions>(
	process.argv.slice(2),
	{
		boolean: CliInternals.BooleanFlags,
	}
);

export const forceFlagProvided =
	parsedGcpCli.f || parsedGcpCli.force || parsedGcpCli.yes || parsedGcpCli.y;
