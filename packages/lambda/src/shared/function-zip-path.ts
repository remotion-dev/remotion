import path from 'path';

export const FUNCTION_ZIP_ARM64 = path.join(
	path.resolve(__dirname, '..', '..'),
	`remotionlambda-arm64.zip`
);

export const FUNCTION_ZIP_X86_64 = path.join(
	path.resolve(__dirname, '..', '..'),
	`remotionlambda-x64.zip`
);
