import {CliInternals} from '@remotion/cli';

import type {GcpRegion} from '../pricing/gcp-regions';

type GCPCommandLineOptions = {
	region: GcpRegion;
	['project-id']: string;
	['remotion-version']: string | undefined;
	['service-name']: string;
	['allow-unauthenticated']: boolean | undefined;
};

export const parsedGcpCli = CliInternals.minimist<GCPCommandLineOptions>(
	process.argv.slice(2),
	{
		boolean: CliInternals.BooleanFlags,
	}
);
