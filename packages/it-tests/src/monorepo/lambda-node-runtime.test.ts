import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';

test('Lambda create-function runtime should be matched by set-lambda-env regex', () => {
	const createFunctionPath = path.resolve(
		__dirname,
		'..',
		'..',
		'..',
		'lambda',
		'src',
		'api',
		'create-function.ts',
	);
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

	const createFunctionSource = readFileSync(createFunctionPath, 'utf-8');
	const setLambdaEnvSource = readFileSync(setLambdaEnvPath, 'utf-8');

	const runtimeMatch = createFunctionSource.match(
		/Runtime:\s*'(nodejs\d+\.x)'/,
	);
	if (!runtimeMatch) {
		throw new Error('Could not find Runtime string in create-function.ts');
	}

	const runtime = runtimeMatch[1];

	const regexMatch = setLambdaEnvSource.match(
		/AWS_Lambda_nodejs\(\?:([^)]+)\)/,
	);
	if (!regexMatch) {
		throw new Error(
			'Could not find AWS_EXECUTION_ENV regex in set-lambda-env.ts',
		);
	}

	const allowedVersions = regexMatch[1].split('|');
	const runtimeVersion = runtime.replace('nodejs', '').replace('.x', '');

	expect(allowedVersions).toContain(runtimeVersion);
});
