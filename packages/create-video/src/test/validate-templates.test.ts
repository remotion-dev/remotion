import got from 'got';
import {expect, test} from 'vitest';
import type {Template} from '../templates';
import {FEATURED_TEMPLATES} from '../templates';

const getFileForTemplate = (template: Template, file: string) => {
	return `https://raw.githubusercontent.com/${template.org}/${template.repoName}/${template.defaultBranch}/${file}`;
};

for (const template of FEATURED_TEMPLATES) {
	test(template.shortName + ' should have a package.json', async () => {
		const packageLockJson = getFileForTemplate(template, 'package.json');

		const res = await got(packageLockJson, {
			throwHttpErrors: false,
		});
		expect(res.statusCode).toBe(200);
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
