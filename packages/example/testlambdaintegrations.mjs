import {execSync} from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const functionName = execSync(`pnpm exec remotion lambda functions ls -q`)
	.toString('utf8')
	.trim()
	.split(' ')[0];

console.log('=== Ruby (Still) ===');

execSync(`ruby lib/test_render_spec_media.rb`, {
	env: {
		// eslint-disable-next-line no-undef
		...process.env,
		REMOTION_APP_REGION: 'eu-central-1',
		REMOTION_APP_FUNCTION_NAME: functionName,
		REMOTION_APP_SERVE_URL: 'testbed-v6',
	},
	cwd: '../lambda-ruby',
	stdio: 'inherit',
});
