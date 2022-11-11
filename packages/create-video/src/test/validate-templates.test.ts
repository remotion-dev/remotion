import got from 'got';
import {expect, test} from 'vitest';
import type {Template} from '../templates';
import {FEATURED_TEMPLATES} from '../templates';

const getFileForTemplate = (template: Template, file: string) => {
	return `https://raw.githubusercontent.com/${template.org}/${template.repoName}/${template.defaultBranch}/${file}`;
};

for (const template of FEATURED_TEMPLATES) {
	test(template.shortName + ' should have a valid package.json', async () => {
		const packageLockJson = getFileForTemplate(template, 'package.json');

		const res = await got(packageLockJson, {
			throwHttpErrors: false,
		});
		expect(res.statusCode).toBe(200);
		const body = JSON.parse(res.body);
		expect(body.dependencies.remotion).toMatch(/^\^3/);
		expect(body.dependencies['@remotion/cli']).toMatch(/^\^3/);
		expect(body.dependencies.react).toMatch(/^\^?18/);
		expect(body.dependencies['react-dom']).toMatch(/^\^?18/);

		expect(body.devDependencies.prettier).toMatch(/^\^?2/);
		expect(body.devDependencies.eslint).toMatch(/^\^?8/);
		const eitherPluginOrConfig =
			body.devDependencies['@remotion/eslint-config']?.match(/^\^3/) ||
			body.devDependencies['@remotion/eslint-plugin']?.match(/^\^3/);

		expect(eitherPluginOrConfig).toBeTruthy();

		if (!template.shortName.includes('JavaScript')) {
			expect(body.devDependencies.typescript).toMatch(/^\^?4/);
		}
	});

	test(
		template.shortName + ' should not have a package-lock.json',
		async () => {
			const packageLockJson = getFileForTemplate(template, 'package-lock.json');

			const res = await got(packageLockJson, {
				throwHttpErrors: false,
			});
			expect(res.statusCode).toBe(404);
		}
	);

	test(template.shortName + ' should not have a yarn.lock', async () => {
		const packageLockJson = getFileForTemplate(template, 'yarn.lock');

		const res = await got(packageLockJson, {
			throwHttpErrors: false,
		});
		expect(res.statusCode).toBe(404);
	});

	test(template.shortName + ' should not have a pnpm-lock.yaml', async () => {
		const packageLockJson = getFileForTemplate(template, 'pnpm-lock.yaml');

		const res = await got(packageLockJson, {
			throwHttpErrors: false,
		});
		expect(res.statusCode).toBe(404);
	});
}
