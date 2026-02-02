import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';

test('Lambda create-function runtime should be matched by aws-provider regex', () => {
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
	const awsProviderPath = path.resolve(
		__dirname,
		'..',
		'..',
		'..',
		'lambda-client',
		'src',
		'aws-provider.ts',
	);

	const createFunctionSource = readFileSync(createFunctionPath, 'utf-8');
	const awsProviderSource = readFileSync(awsProviderPath, 'utf-8');

	const runtimeMatch = createFunctionSource.match(
		/Runtime:\s*'(nodejs\d+\.x)'/,
	);
	if (!runtimeMatch) {
		throw new Error(
			'Could not find Runtime string in create-function.ts',
		);
	}

	const runtime = runtimeMatch[1];

	const regexMatch = awsProviderSource.match(
		/AWS_Lambda_nodejs\(\?:([^)]+)\)/,
	);
	if (!regexMatch) {
		throw new Error(
			'Could not find AWS_EXECUTION_ENV regex in aws-provider.ts',
		);
	}

	const allowedVersions = regexMatch[1].split('|');
	const runtimeVersion = runtime.replace('nodejs', '').replace('.x', '');

	expect(allowedVersions).toContain(runtimeVersion);
});
