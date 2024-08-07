import {describe, expect, it} from 'bun:test';
import {CreateVideoInternals, Template} from 'create-video';

const {FEATURED_TEMPLATES} = CreateVideoInternals;

const getFileForTemplate = (template: Template, file: string) => {
	return `https://github.com/${template.org}/${template.repoName}/raw/${template.defaultBranch}/${file}`;
};

const findFile = async (options: string[]) => {
	let entryPoint: string | null = null;
	let contents: string | null = null;
	for (const point of options) {
		const res = await fetch(point);
		if (res.ok) {
			entryPoint = point;
			contents = await res.text();
			break;
		}
	}

	return {entryPoint, contents};
};

describe('Templates should be valid', () => {
	for (const template of FEATURED_TEMPLATES) {
		it(template.shortName + ' should have a valid package.json', async () => {
			const packageJson = getFileForTemplate(template, 'package.json');

			const res = await fetch(packageJson, {});

			expect(res.ok).toBe(true);
			const body = await res.json();

			if (
				!template.shortName.includes('Remix') &&
				!template.shortName.includes('Next') &&
				!template.shortName.includes('Still')
			) {
				expect(body.scripts.build).toMatch(/render/);
				expect(body.scripts.build).not.toContain('index');
			}

			expect(body.dependencies.remotion).toMatch(/^\^?4/);
			expect(body.dependencies['@remotion/cli']).toMatch(/^\^?4/);
			expect(body.dependencies.react).toMatch(/^\^?18/);
			expect(body.dependencies['react-dom']).toMatch(/^\^?18/);

			if (body.dependencies['zod']) {
				expect(body.dependencies['zod']).toBe('3.22.3');
			}
			if (body.dependencies['@types/web']) {
				expect(body.dependencies['@types/web']).toInclude('0.0.143');
			}

			expect(body.devDependencies.prettier).toMatch(/^\^?((3).\d.\d)/);

			if (!template.shortName.includes('JavaScript')) {
				expect(body.devDependencies.eslint).toMatch(/^\^?(8|9).\d+/);
				expect(body.devDependencies.typescript).toMatch(/^\^?((5).\d.\d)/);
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const eitherPluginOrConfig =
					body.devDependencies['@remotion/eslint-config']?.match(/^\^?4/) ||
					body.devDependencies['@remotion/eslint-plugin']?.match(/^\^?4/);
				expect(eitherPluginOrConfig).toBeTruthy();
			}
		});

		it(
			template.shortName + ' should not have a package-lock.json',
			async () => {
				const packageLockJson = getFileForTemplate(
					template,
					'package-lock.json',
				);

				const res = await fetch(packageLockJson);
				expect(res.status).toBe(404);
			},
		);

		it(template.shortName + ' should not have a yarn.lock', async () => {
			const packageLockJson = getFileForTemplate(template, 'yarn.lock');

			const res = await fetch(packageLockJson, {});
			expect(res.status).toBe(404);
		});

		it(template.shortName + ' should not have a pnpm-lock.yaml', async () => {
			const packageLockJson = getFileForTemplate(template, 'pnpm-lock.yaml');

			const res = await fetch(packageLockJson, {});
			expect(res.status).toBe(404);
		});

		it(template.shortName + ' should not have a bun.lockb', async () => {
			const packageLockJson = getFileForTemplate(template, 'bun.lockb');

			const res = await fetch(packageLockJson, {});

			expect(res.status).toBe(404);
		});

		it(template.shortName + ' should have a standard entry point', async () => {
			const {contents, entryPoint} = await findFile([
				getFileForTemplate(template, 'src/index.ts'),
				getFileForTemplate(template, 'src/index.js'),
				getFileForTemplate(template, 'remotion/index.ts'),
				getFileForTemplate(template, 'app/remotion/index.ts'),
			]);
			expect(entryPoint).toBeTruthy();
			expect(contents).toMatch(/RemotionRoot/);
		});

		it(
			template.shortName + ' should not have a standard Root file',
			async () => {
				const {contents, entryPoint} = await findFile([
					getFileForTemplate(template, 'src/Root.tsx'),
					getFileForTemplate(template, 'src/Root.jsx'),
					getFileForTemplate(template, 'remotion/Root.tsx'),
					getFileForTemplate(template, 'app/remotion/Root.tsx'),
				]);
				expect(entryPoint).toBeTruthy();
				expect(contents).toMatch(/export const RemotionRoot/);
			},
		);

		it(
			template.shortName + ' should not have a standard Root file',
			async () => {
				const {contents, entryPoint} = await findFile([
					getFileForTemplate(template, 'src/Root.tsx'),
					getFileForTemplate(template, 'src/Root.jsx'),
					getFileForTemplate(template, 'remotion/Root.tsx'),
					getFileForTemplate(template, 'app/remotion/Root.tsx'),
				]);
				expect(entryPoint).toBeTruthy();
				expect(contents).toMatch(/export const RemotionRoot/);
			},
		);

		it(`${template.shortName} should use the new config file format`, async () => {
			const {contents, entryPoint} = await findFile([
				getFileForTemplate(template, 'remotion.config.ts'),
				getFileForTemplate(template, 'remotion.config.js'),
			]);
			expect(entryPoint).toBeTruthy();
			expect(contents).not.toContain('Config.Rendering');
			expect(contents).not.toContain('Config.Bundling');
			expect(contents).not.toContain('Config.Log');
			expect(contents).not.toContain('Config.Puppeteer');
			expect(contents).not.toContain('Config.Output');
			expect(contents).not.toContain('Config.Preview');
		});
		it(template.shortName + ' should use noUnusedLocals', async () => {
			if (template.shortName.includes('JavaScript')) {
				return;
			}

			const {contents} = await findFile([
				getFileForTemplate(template, 'tsconfig.json'),
			]);
			expect(contents).toInclude('noUnusedLocals');
		});
		it(template.shortName + ' should have a good .vscode setting', async () => {
			const {contents} = await findFile([
				getFileForTemplate(template, '.vscode/settings.json'),
			]);
			const json = JSON.parse(contents as string);
			expect(json['editor.codeActionsOnSave']).toBe(undefined);
		});
	}
});
