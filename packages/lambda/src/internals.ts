import type {AwsRegion, RuntimePreference} from '@remotion/lambda-client';
import type {LogLevel} from '@remotion/renderer';
import type {
	DeploySiteOutput,
	InternalDeploySiteInput,
} from './api/deploy-site';
import {internalDeploySite} from './api/deploy-site';
import {executeCommand} from './cli/index';
import {getLayers} from './shared/get-layers';
import type {AwsLayer} from './shared/hosted-layers';

export const LambdaInternals: {
	executeCommand: (
		args: string[],
		remotionRoot: string,
		logLevel: LogLevel,
	) => Promise<void>;
	internalDeploySite: (input: InternalDeploySiteInput) => DeploySiteOutput;
	getLayers: (options: {
		option: RuntimePreference;
		region: AwsRegion;
	}) => AwsLayer[];
} = {
	executeCommand,
	internalDeploySite,
	getLayers,
};

export type {OverallRenderProgress as _InternalOverallRenderProgress} from '@remotion/lambda-client';
