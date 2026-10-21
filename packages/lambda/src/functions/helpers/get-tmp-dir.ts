import {
	LambdaClientInternals,
	type FunctionErrorInfo,
} from '@remotion/lambda-client';
import {getFolderFiles} from './get-folder-files';

export const getTmpDirStateIfENoSp = (
	err: string,
): FunctionErrorInfo['tmpDir'] => {
	if (!LambdaClientInternals.errorIsOutOfSpaceError(err)) {
		return null;
	}

	const files = getFolderFiles('/tmp');
	return {
		files: files
			.slice(0)
			.sort((a, b) => a.size - b.size)
			.reverse()
			.slice(0, 100),
		total: files.reduce((a, b) => a + b.size, 0),
	};
};
