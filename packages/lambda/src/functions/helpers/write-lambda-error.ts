import type {FileNameAndSize} from './get-files-in-folder';
import {getFolderFiles} from './get-files-in-folder';
import {errorIsOutOfSpaceError} from './is-enosp-err';

export type LambdaErrorInfo = {
	type: 'renderer' | 'browser' | 'stitcher' | 'webhook' | 'artifact';
	message: string;
	name: string;
	stack: string;
	frame: number | null;
	chunk: number | null;
	isFatal: boolean;
	attempt: number;
	willRetry: boolean;
	totalAttempts: number;
	tmpDir: {files: FileNameAndSize[]; total: number} | null;
};

export const getTmpDirStateIfENoSp = (
	err: string,
): LambdaErrorInfo['tmpDir'] => {
	if (!errorIsOutOfSpaceError(err)) {
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

export type EnhancedErrorInfo = LambdaErrorInfo & {
	/**
	 * @deprecated Will always be an empty string.
	 */
	s3Location: string;
	explanation: string | null;
};
