import type {CloudProvider} from '@remotion/serverless';
import type {
	ServerlessPayloads,
	ServerlessRoutines,
} from '@remotion/serverless/client';

export type CallLambdaOptions<
	T extends ServerlessRoutines,
	Provider extends CloudProvider,
> = {
	functionName: string;
	type: T;
	payload: Omit<ServerlessPayloads<Provider>[T], 'type'>;
	region: Provider['region'];
	timeoutInTest: number;
};
