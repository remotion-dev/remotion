import {execSync} from 'child_process';

execSync('pnpm run buildlambda', {
	cwd: '../lambda',
});

execSync('pnpm exec remotion lambda functions rmall -f', {
	stdio: 'inherit',
});
execSync(
	'pnpm exec remotion lambda sites create --site-name=testbed-v6 --log=verbose',
	{
		stdio: 'inherit',
	}
);

execSync('pnpm exec remotion lambda functions deploy --memory=3000', {
	stdio: 'inherit',
});
execSync(
	'pnpm exec remotion lambda render testbed-v6 react-svg --log=verbose',
	{
		stdio: 'inherit',
	}
);
execSync(
	'pnpm exec remotion lambda still testbed-v6 huge-payload --log=verbose',
	{
		stdio: 'inherit',
	}
);
execSync(
	`pnpm exec remotion lambda still testbed-v6 140kb-payload --props='${JSON.stringify(
		{
			str: 'a'.repeat(140 * 1000),
			date: 'remotion-date:' + new Date('2020-01-01').toISOString(),
			file: 'nested/mp4.png',
		}
	)}' --log=verbose`,
	{
		stdio: 'inherit',
	}
);

const functionName = execSync(`pnpm exec remotion lambda functions ls -q`);

execSync(`php src/render.php`, {
	env: {
		// eslint-disable-next-line no-undef
		...process.env,
		REMOTION_APP_FUNCTION_NAME: functionName.toString('utf8'),
		REMOTION_APP_SERVE_URL: 'testbed-v6',
	},
	cwd: '../lambda-php-example',
	stdio: 'inherit',
});
