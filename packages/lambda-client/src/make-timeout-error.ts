import {makeTimeoutMessage} from './make-timeout-message';
import type {AwsRegion} from './regions';
import type {RenderMetadata} from './render-metadata';
import type {EnhancedErrorInfo} from './write-error-to-storage';

export const makeTimeoutError = ({
	timeoutInMilliseconds,
	missingChunks,
	renderMetadata,
	renderId,
	functionName,
	region,
}: {
	timeoutInMilliseconds: number;
	renderMetadata: RenderMetadata;
	renderId: string;
	missingChunks: number[];
	functionName: string;
	region: AwsRegion;
}): EnhancedErrorInfo => {
	const message = makeTimeoutMessage({
		missingChunks,
		renderMetadata,
		timeoutInMilliseconds,
		renderId,
		functionName,
		region,
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
