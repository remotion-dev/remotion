import {expect, test} from 'bun:test';
import execa from 'execa';
import path from 'path';

test('Should be able to call pnpm exec remotion lambda', async () => {
	const task = await execa('pnpm', ['exec', 'remotion', 'lambda'], {
		cwd: path.join(process.cwd(), '..', 'example'),
	});
	expect(task.stdout).toContain('Available commands');
});

test('Should be able to get user policy without authentication', async () => {
	const task = await execa(
		'pnpm',
		['exec', 'remotion', 'lambda', 'policies', 'user'],
		{
			cwd: path.join(process.cwd(), '..', 'example'),
		},
	);
	expect(task.stdout).toContain('iam:SimulatePrincipalPolicy');
});

test('Should be able to get role policy without authentication', async () => {
	const task = await execa(
		'pnpm',
		['exec', 'remotion', 'lambda', 'policies', 'role'],
		{
			cwd: path.join(process.cwd(), '..', 'example'),
		},
	);
	expect(task.stdout).toContain('s3:ListAllMyBuckets');
});
