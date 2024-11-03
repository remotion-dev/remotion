import {execSync} from 'child_process';

execSync('bun run make', {
	cwd: '../lambda',
	stdio: 'inherit',
});

execSync('bunx remotion lambda functions rmall -f', {
	stdio: 'inherit',
});

execSync(
	'pnpm exec remotion lambda sites create --site-name=testbed-v6 --enable-folder-expiry=true --log=verbose',
	{
		stdio: 'inherit',
	},
);

execSync('pnpm exec remotion lambda functions deploy --memory=3000', {
	stdio: 'inherit',
});

execSync(
	'pnpm exec remotion lambda render testbed-v6 react-svg --log=verbose --delete-after="1-day"',
	{
		stdio: 'inherit',
	},
);

execSync(
	'pnpm exec remotion lambda still testbed-v6 huge-payload --log=verbose',
	{
		stdio: 'inherit',
	},
);
execSync(
	`pnpm exec remotion lambda still testbed-v6 140kb-payload --props='${JSON.stringify(
		{
			str: 'a'.repeat(140 * 1000),
			date: 'remotion-date:' + new Date('2020-01-01').toISOString(),
			file: 'nested/mp4.png',
		},
	)}' --log=verbose`,
	{
		stdio: 'inherit',
	},
);

await import('./testlambdaintegrations.mjs');
await import('./testlambdaperformance.mjs');
