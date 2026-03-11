import {describe, expect, it} from 'bun:test';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {INTERNAL_TEMPLATES} from './internal-templates';

type InternalTemplate = (typeof INTERNAL_TEMPLATES)[number];

const getFileForTemplate = (template: InternalTemplate, file: string) => {
	return path.join(process.cwd(), '..', template.templateInMonorepo, file);
};

const findFile = async (options: string[]) => {
	let entryPoint: string | null = null;
	let contents: string | null = null;
	for (const point of options) {
		if (existsSync(point)) {
			entryPoint = point;
			contents = readFileSync(point, 'utf-8');
			break;
		}
	}

	return {entryPoint, contents};
};

describe('Internal templates should be valid', () => {
	for (const template of INTERNAL_TEMPLATES) {
		it(`${template.shortName} should have a valid package.json`, async () => {
			const packageJson = getFileForTemplate(template, 'package.json');
			const res = readFileSync(packageJson, 'utf8');
			const body = JSON.parse(res);

			expect(body.private).toBe(true);
			expect(body.name).toStartWith('template-');
			expect(body.main).toBe('.vite/build/main.js');
			expect(body.dependencies.remotion).toBe('workspace:*');
			expect(body.dependencies['@remotion/cli']).toBe('workspace:*');
			expect(body.dependencies['@remotion/bundler']).toBe('workspace:*');
			expect(body.dependencies['@remotion/renderer']).toBe('workspace:*');
			expect(body.dependencies.react).toMatch(/^\^?19/);
			expect(body.dependencies['react-dom']).toMatch(/^\^?19/);
			expect(body.devDependencies['@electron-forge/cli']).toBeTruthy();
			expect(body.devDependencies['@electron-forge/plugin-vite']).toBeTruthy();

			const scripts = body.scripts;
			expect(scripts.dev).toBe('electron-forge start');
			expect(scripts.studio).toBe('remotion studio');
			expect(scripts.build).toBe('electron-forge package');
			expect(scripts.lint).toInclude('tsc --noEmit');
		});

		it(`${template.shortName} should not have any lockfiles`, async () => {
			expect(
				existsSync(getFileForTemplate(template, 'package-lock.json')),
			).toBe(false);
			expect(existsSync(getFileForTemplate(template, 'yarn.lock'))).toBe(false);
			expect(existsSync(getFileForTemplate(template, 'pnpm-lock.yaml'))).toBe(
				false,
			);
			expect(existsSync(getFileForTemplate(template, 'bun.lockb'))).toBe(false);
			expect(existsSync(getFileForTemplate(template, 'bun.lock'))).toBe(false);
		});

		it(`${template.shortName} should have a standard entry point`, async () => {
			const {contents, entryPoint} = await findFile([
				getFileForTemplate(template, 'src/index.ts'),
				getFileForTemplate(template, 'remotion/index.ts'),
				getFileForTemplate(template, 'src/remotion/index.ts'),
			]);
			expect(entryPoint).toBeTruthy();
			expect(contents).toMatch(/RemotionRoot/);
		});

		it(`${template.shortName} should have a standard Root file`, async () => {
			const {contents, entryPoint} = await findFile([
				getFileForTemplate(template, 'src/Root.tsx'),
				getFileForTemplate(template, 'remotion/Root.tsx'),
				getFileForTemplate(template, 'src/remotion/Root.tsx'),
			]);
			expect(entryPoint).toBeTruthy();
			expect(contents).toMatch(/export const RemotionRoot/);
		});

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

		it(`${template.shortName} should have Electron Forge Vite files`, async () => {
			expect(existsSync(getFileForTemplate(template, 'forge.config.ts'))).toBe(
				true,
			);
			expect(existsSync(getFileForTemplate(template, 'forge.env.d.ts'))).toBe(
				true,
			);
			expect(
				existsSync(getFileForTemplate(template, 'vite.main.config.ts')),
			).toBe(true);
			expect(
				existsSync(getFileForTemplate(template, 'vite.preload.config.ts')),
			).toBe(true);
			expect(
				existsSync(getFileForTemplate(template, 'vite.renderer.config.ts')),
			).toBe(true);
			expect(existsSync(getFileForTemplate(template, 'src/main.ts'))).toBe(
				true,
			);
			expect(existsSync(getFileForTemplate(template, 'src/preload.ts'))).toBe(
				true,
			);
			expect(
				existsSync(getFileForTemplate(template, 'src/remotion-bundle.ts')),
			).toBe(true);
			expect(existsSync(getFileForTemplate(template, 'src/renderer.ts'))).toBe(
				true,
			);
			expect(existsSync(getFileForTemplate(template, 'index.html'))).toBe(true);
		});

		it(`${template.shortName} should prebuild the Remotion bundle during packaging`, async () => {
			const forgeConfig = readFileSync(
				getFileForTemplate(template, 'forge.config.ts'),
				'utf8',
			);
			expect(forgeConfig).toContain('packageAfterCopy');
			expect(forgeConfig).toContain('getPrebuiltRemotionBundlePath');
		});

		it(`${template.shortName} should use good tsconfig values`, async () => {
			const tsconfig = getFileForTemplate(template, 'tsconfig.json');
			const contents = readFileSync(tsconfig, 'utf8');
			const parsed = JSON.parse(contents);

			expect(parsed.compilerOptions.noUnusedLocals).toBe(true);
			expect(parsed.exclude).toContain('remotion.config.ts');
		});

		it(`${template.shortName} should reference commands`, async () => {
			const readme = readFileSync(
				getFileForTemplate(template, 'README.md'),
				'utf8',
			);
			expect(readme).toInclude('npm run dev');
			expect(readme).toInclude('npm run studio');
			expect(readme).toInclude('npx remotion render');
			expect(readme).toInclude('npx remotion upgrade');
		});

		it(`${template.shortName} should be registered in tsconfig.json`, async () => {
			const tsconfig = path.join(process.cwd(), '..', '..', 'tsconfig.json');
			const contents = readFileSync(tsconfig, 'utf8');
			const parsed = JSON.parse(contents);
			const references = parsed.references.map((r: {path: string}) =>
				r.path.replace('./packages/', ''),
			);

			expect(references).toContain(template.templateInMonorepo);
		});
	}
});
