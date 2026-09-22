import {expect, test} from 'bun:test';
import {getCloudrunHelp} from '../cli/help';

const commandHelpPages = [
	{args: [], documentation: '/docs/cloudrun/cli', option: null},
	{
		args: ['render'],
		documentation: '/docs/cloudrun/cli/render',
		option: '--service-name',
	},
	{
		args: ['still'],
		documentation: '/docs/cloudrun/cli/still',
		option: '--image-format',
	},
	{
		args: ['services'],
		documentation: '/docs/cloudrun/cli/services',
		option: null,
	},
	{
		args: ['services', 'deploy'],
		documentation: '/docs/cloudrun/cli/services/deploy',
		option: '--memoryLimit',
	},
	{
		args: ['services', 'ls'],
		documentation: '/docs/cloudrun/cli/services/ls',
		option: '--quiet',
	},
	{
		args: ['services', 'rm'],
		documentation: '/docs/cloudrun/cli/services/rm',
		option: '--yes',
	},
	{
		args: ['services', 'rmall'],
		documentation: '/docs/cloudrun/cli/services/rmall',
		option: '--yes',
	},
	{args: ['sites'], documentation: '/docs/cloudrun/cli/sites', option: null},
	{
		args: ['sites', 'create'],
		documentation: '/docs/cloudrun/cli/sites/create',
		option: '--site-name',
	},
	{
		args: ['sites', 'ls'],
		documentation: '/docs/cloudrun/cli/sites/ls',
		option: '--all-regions',
	},
	{
		args: ['sites', 'rm'],
		documentation: '/docs/cloudrun/cli/sites/rm',
		option: '--yes',
	},
	{
		args: ['sites', 'rmall'],
		documentation: '/docs/cloudrun/cli/sites/rmall',
		option: '--all-regions',
	},
	{
		args: ['permissions'],
		documentation: '/docs/cloudrun/cli/permissions',
		option: null,
	},
	{
		args: ['regions'],
		documentation: '/docs/cloudrun/cli/regions',
		option: null,
	},
] as const;

test('defines help for every Cloud Run command', () => {
	for (const {args, documentation, option} of commandHelpPages) {
		const lines = getCloudrunHelp(args);
		const output = lines.join('\n');
		const command = `remotion cloudrun${args.length === 0 ? '' : ` ${args.join(' ')}`}`;

		expect(output).toContain(command);
		expect(output).toContain(`https://www.remotion.dev${documentation}`);
		expect(output).toContain('Options:');
		const helpLine = lines.find((line) => line.includes('--help'));
		expect(helpLine).toContain('Show this help.');

		if (option) {
			const optionLine = lines.find((line) => line.includes(option));
			expect(optionLine).toBeDefined();
			expect(optionLine?.length).toBeGreaterThan(option.length + 2);
		}
	}

	const renderHelp = getCloudrunHelp(['render']).join('\n');
	expect(renderHelp).toContain('--buffer-size <value>');
	expect(renderHelp).toContain('--browser-executable <value>');
	expect(renderHelp).toContain('--config <value>');
	expect(renderHelp).toContain('--port <value>');
	expect(renderHelp).toContain('--quiet, -q');

	const stillHelp = getCloudrunHelp(['still']).join('\n');
	expect(stillHelp).toContain('--frame <value>');
	expect(stillHelp).toContain('--height <value>');
	expect(stillHelp).toContain('--config <value>');
	expect(stillHelp).toContain('--port <value>');
	expect(stillHelp).not.toContain('--offthreadvideo-video-threads');

	const createSiteHelp = getCloudrunHelp(['sites', 'create']).join('\n');
	expect(createSiteHelp).toContain('--config <value>');
	expect(createSiteHelp).toContain('--bundle-cache');
	expect(createSiteHelp).toContain('--disable-ask-ai');
	expect(createSiteHelp).toContain('--privacy <public|private|no-acl>');
	expect(createSiteHelp).toContain('Set the privacy of the deployed site.');
	expect(createSiteHelp).not.toContain(
		'Set the privacy of the rendered output.',
	);

	for (const args of [
		['services', 'rm'],
		['services', 'rmall'],
		['sites', 'rm'],
		['sites', 'rmall'],
	]) {
		expect(getCloudrunHelp(args).join('\n')).toContain('--force, -f');
	}

	for (const args of [
		['services', 'rm'],
		['services', 'rmall'],
		['sites', 'rm'],
	]) {
		expect(getCloudrunHelp(args).join('\n')).toContain('--quiet, -q');
	}

	expect(getCloudrunHelp(['sites', 'rmall']).join('\n')).not.toContain(
		'--quiet, -q',
	);
});
