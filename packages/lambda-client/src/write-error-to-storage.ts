import type {FileNameAndSize} from './get-files-in-folder';

export type FunctionErrorInfo = {
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

export type EnhancedErrorInfo = FunctionErrorInfo & {
	/**
	 * @deprecated Will always be an empty string.
	 */
	s3Location: string;
	explanation: string | null;
};
