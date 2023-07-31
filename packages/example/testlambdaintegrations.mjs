import {execSync} from 'child_process';

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
execSync(`python testclient.py`, {
	env: {
		// eslint-disable-next-line no-undef
		...process.env,
		REMOTION_APP_REGION: 'eu-central-1',
		REMOTION_APP_FUNCTION_NAME: functionName.toString('utf8'),
		REMOTION_APP_SERVE_URL: 'testbed-v6',
	},
	cwd: '../lambda-python',
	stdio: 'inherit',
});
