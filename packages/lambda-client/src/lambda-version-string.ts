import {VERSION} from '@remotion/serverless-client';

export const LAMBDA_VERSION_STRING = VERSION.replace(/\./g, '-')
	.replace(/\+/g, '-')
	.substring(0, 10);
