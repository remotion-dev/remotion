import type {_Object} from '@aws-sdk/client-s3';
import type {RenderMetadata} from '../../defaults';
import {makeTimeoutMessage} from './make-timeout-message';
import type {EnhancedErrorInfo} from './write-lambda-error';

export const makeTimeoutError = ({
	timeoutInMilliseconds,
	missingChunks,
	renderMetadata,
	renderId,
}: {
	timeoutInMilliseconds: number;
	chunks: _Object[];
	renderMetadata: RenderMetadata;
	renderId: string;
	missingChunks: number[];
}): EnhancedErrorInfo => {
	const message = makeTimeoutMessage({
		missingChunks,
		renderMetadata,
		timeoutInMilliseconds,
		renderId,
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
