import {CliInternals} from '@remotion/cli';

import type {GcpRegion} from '../pricing/gcp-regions';

type servicesCommandLineOptions = {
	help: boolean;
	region: GcpRegion;
	['project-id']: string;
	['service-name']: string;
	y: boolean;
	yes: boolean;
	force: boolean;
	['onlyAllocateCpuDuringRequestProcessing']: boolean;
	f: boolean;

	['max-retries']: number;
	['out-name']: string | undefined;
	['output-bucket']: string;
	['output-folder-path']: string;
	webhook: string;
	['render-id-override']: string;
};

export const parsedCloudrunCli =
	CliInternals.minimist<servicesCommandLineOptions>(process.argv.slice(2), {
		boolean: CliInternals.BooleanFlags,
		string: ['_'],
	});

export const forceFlagProvided =
	parsedCloudrunCli.f ||
	parsedCloudrunCli.force ||
	parsedCloudrunCli.yes ||
	parsedCloudrunCli.y;
