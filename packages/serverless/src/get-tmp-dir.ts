import type {
	CloudProvider,
	FunctionErrorInfo,
} from '@remotion/serverless-client';
import {errorIsOutOfSpaceError} from '@remotion/serverless-client';
import type {InsideFunctionSpecifics} from './provider-implementation';

export const getTmpDirStateIfENoSp = <Provider extends CloudProvider>(
	err: string,
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>,
): FunctionErrorInfo['tmpDir'] => {
	if (!errorIsOutOfSpaceError(err)) {
		return null;
	}

	const files = insideFunctionSpecifics.getFolderFiles('/tmp');
	return {
		files: files
			.slice(0)
			.sort((a, b) => a.size - b.size)
			.reverse()
			.slice(0, 100),
		total: files.reduce((a, b) => a + b.size, 0),
	};
};
