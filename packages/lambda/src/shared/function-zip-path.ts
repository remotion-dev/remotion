// Don't concatenate as we don't want Bun bundler to hardcode this

const a = 'remotionlambda-arm64.zip';

export const FUNCTION_ZIP_ARM64 = require.resolve(`../../` + a);
