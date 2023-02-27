import {CliInternals} from '@remotion/cli';

import type {GcpRegion} from '../pricing/gcp-regions';

type GCPCommandLineOptions = {
	help: boolean;
	region: GcpRegion;
	['project-id']: string;
	['remotion-version']: string | undefined;
	['service-name']: string;
	['allow-unauthenticated']: boolean | undefined;
	y: boolean;
	yes: boolean;
	force: boolean;
	f: boolean;
};

export const parsedGcpCli = CliInternals.minimist<GCPCommandLineOptions>(
	process.argv.slice(2),
	{
		boolean: CliInternals.BooleanFlags,
	}
);

export const forceFlagProvided =
	parsedGcpCli.f || parsedGcpCli.force || parsedGcpCli.yes || parsedGcpCli.y;
