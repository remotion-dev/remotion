import {makeTimeoutMessage} from './make-timeout-message';
import type {ProviderSpecifics} from './provider-implementation';
import type {RenderMetadata} from './render-metadata';
import type {CloudProvider} from './types';
import type {EnhancedErrorInfo} from './write-error-to-storage';

export const makeTimeoutError = <Provider extends CloudProvider>({
	timeoutInMilliseconds,
	missingChunks,
	renderMetadata,
	renderId,
	functionName,
	region,
	providerSpecifics,
}: {
	timeoutInMilliseconds: number;
	renderMetadata: RenderMetadata<Provider>;
	renderId: string;
	missingChunks: number[];
	functionName: string;
	region: Provider['region'];
	providerSpecifics: ProviderSpecifics<Provider>;
}): EnhancedErrorInfo => {
	const message = makeTimeoutMessage({
		missingChunks,
		renderMetadata,
		timeoutInMilliseconds,
		renderId,
		functionName,
		region,
		providerSpecifics,
	});

	const error = new Error(message);

	return {
		attempt: 1,
		chunk: null,
		explanation: null,
		frame: null,
		isFatal: true,
		s3Location: '',
		stack: error.stack as string,
		tmpDir: null,
		totalAttempts: 1,
		type: 'stitcher',
		willRetry: false,
		message,
		name: 'TimeoutError',
	};
};
