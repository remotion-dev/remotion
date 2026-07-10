import {expect, test} from 'bun:test';
import {getCreateVideoHelp} from '../help';
import {FEATURED_TEMPLATES} from '../templates';

test('prints a concise help output for create-video', () => {
	const help = getCreateVideoHelp();

	expect(help).toContain('npx create-video --yes --blank my-video');
	expect(help).toContain('--yes, -y');
	expect(help).toContain('--no-tailwind');
	expect(help).toContain('--tmp');
	expect(help).toContain('--help, -h');
	expect(help).toContain('https://www.remotion.dev/docs/cli/create-video');
	expect(help).toContain('Template flags:\n  --blank\n  --hello-world');

	for (const template of FEATURED_TEMPLATES) {
		expect(help).toContain(`\n  --${template.cliId}`);
	}
});
