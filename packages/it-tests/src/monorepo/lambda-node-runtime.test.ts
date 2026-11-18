import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {FUNCTION_DEPLOYMENT_CONFIG} from '../../../lambda/src/shared/function-deployment-config';

test('Lambda runtime should be matched by set-lambda-env regex', () => {
	const setLambdaEnvPath = path.resolve(
		__dirname,
		'..',
		'..',
		'..',
		'lambda',
		'src',
		'functions',
		'helpers',
		'set-lambda-env.ts',
	);

	const setLambdaEnvSource = readFileSync(setLambdaEnvPath, 'utf-8');

	const regexMatch = setLambdaEnvSource.match(
		/AWS_Lambda_nodejs\(\?:([^)]+)\)/,
	);
	if (!regexMatch) {
		throw new Error(
			'Could not find AWS_EXECUTION_ENV regex in set-lambda-env.ts',
		);
	}

	const allowedVersions = regexMatch[1].split('|');
	const runtimeVersion = FUNCTION_DEPLOYMENT_CONFIG.runtime
		.replace('nodejs', '')
		.replace('.x', '');

	expect(allowedVersions).toContain(runtimeVersion);
});
