import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
	blankTemplateFiles,
	createBlankTemplateProject,
} from '../templates/blank';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const templateBlankDir = join(packageDir, '..', 'template-blank');

const readTemplateFile = (...pathParts: string[]) =>
	readFileSync(join(templateBlankDir, ...pathParts), 'utf-8').replace(
		/\r\n/g,
		'\n',
	);

test('blank template virtual files match the source template', () => {
	expect(readTemplateFile('src', 'index.ts')).toBe(
		blankTemplateFiles['/project/src/index.ts'],
	);
	expect(readTemplateFile('src', 'Root.tsx')).toBe(
		blankTemplateFiles['/project/src/Root.tsx'],
	);
	expect(readTemplateFile('src', 'Composition.tsx')).toBe(
		blankTemplateFiles['/project/src/Composition.tsx'],
	);
	expect(readTemplateFile('package.json')).toBe(
		blankTemplateFiles['/project/package.json'],
	);
	expect(readTemplateFile('tsconfig.json')).toBe(
		blankTemplateFiles['/project/tsconfig.json'],
	);
});

test('createBlankTemplateProject points to the virtual entry point', () => {
	expect(createBlankTemplateProject()).toEqual({
		rootDir: '/project',
		entryPoint: '/project/src/index.ts',
		files: {...blankTemplateFiles},
	});
});
