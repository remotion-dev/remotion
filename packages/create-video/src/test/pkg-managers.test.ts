import {expect, test} from 'bun:test';
import {
	getDevCommand,
	getInstallCommand,
	getRenderCommand,
	getRunCommand,
	getUpgradeCommand,
	selectPackageManager,
} from '../pkg-managers';
import {FEATURED_TEMPLATES} from '../templates';

test('detects Nub and uses Nub commands', () => {
	const previousUserAgent = process.env.npm_config_user_agent;
	const previousExecPath = process.env.npm_execpath;
	const previousArgv = process.env.npm_config_argv;

	try {
		process.env.npm_config_user_agent = 'nub/0.8.2 yarn/1.22.22';
		process.env.npm_execpath = '/path/to/yarn.js';
		process.env.npm_config_argv = JSON.stringify({remain: ['dlx']});

		expect(selectPackageManager()).toBe('nub');

		const blankTemplate = FEATURED_TEMPLATES.find(
			(template) => template.cliId === 'blank',
		);
		if (!blankTemplate) {
			throw new Error('Blank template not found');
		}

		expect([
			getInstallCommand('nub'),
			getDevCommand('nub', blankTemplate),
			getRunCommand('nub'),
			getRenderCommand('nub'),
			getUpgradeCommand('nub'),
		]).toEqual([
			'nub install',
			'nub run dev',
			'nub run',
			'nubx remotion render',
			'nubx remotion upgrade',
		]);
	} finally {
		if (previousUserAgent === undefined) {
			delete process.env.npm_config_user_agent;
		} else {
			process.env.npm_config_user_agent = previousUserAgent;
		}

		if (previousExecPath === undefined) {
			delete process.env.npm_execpath;
		} else {
			process.env.npm_execpath = previousExecPath;
		}

		if (previousArgv === undefined) {
			delete process.env.npm_config_argv;
		} else {
			process.env.npm_config_argv = previousArgv;
		}
	}
});
