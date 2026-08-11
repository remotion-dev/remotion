// Don't concatenate as we don't want Bun bundler to hardcode this
import path from 'node:path';

const b = '../';
const a = 'remotionlambda-arm64.zip';

export const FUNCTION_ZIP_ARM64 = path.resolve(
	require.resolve(`../` + b),
	'..',
	'..',
	a,
);
