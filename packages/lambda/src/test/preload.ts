import {mock} from 'bun:test';
import path from 'node:path';

// @remotion/lambda-client ships as a single bundle. Resolve it to its sources
// in tests so that individual AWS operations (S3, Lambda invocations, ...) can
// be replaced with in-memory fakes, see ./mocks/fake-aws.ts.
const clientSrc = path.resolve(__dirname, '../../../lambda-client/src');

mock.module('@remotion/lambda-client', () =>
	require(path.join(clientSrc, 'index.ts')),
);
mock.module('@remotion/lambda-client/constants', () =>
	require(path.join(clientSrc, 'constants.ts')),
);
mock.module('@remotion/lambda-client/regions', () =>
	require(path.join(clientSrc, 'regions.ts')),
);

// @remotion/lambda runs on Node and loads the CommonJS build of
// @remotion/renderer. Use the same build in tests: the ESM bundle has
// environment checks (NODE_ENV) inlined at build time.
const rendererCjs = require.resolve('@remotion/renderer');
mock.module('@remotion/renderer', () => require(rendererCjs));
