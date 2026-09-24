import {expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {patchReadmeMd} from '../patch-readme';
import {FEATURED_TEMPLATES} from '../templates';

const stargazer = FEATURED_TEMPLATES.find((t) => t.cliId === 'stargazer');
if (!stargazer) {
	throw new Error('stargazer template not found');
}

test('Patches a template readme named readme.md', () => {
	const projectRoot = fs.mkdtempSync(
		path.join(os.tmpdir(), 'create-video-readme-'),
	);

	try {
		fs.writeFileSync(
			path.join(projectRoot, 'readme.md'),
			'# Stargazer\n\nnpm install\n\nnpx remotion render\n',
		);

		patchReadmeMd(projectRoot, 'pnpm', stargazer);

		expect(fs.readdirSync(projectRoot)).toEqual(['readme.md']);
		expect(fs.readFileSync(path.join(projectRoot, 'readme.md'), 'utf8')).toBe(
			'# Stargazer\n\npnpm i\n\npnpm exec remotion render\n',
		);
	} finally {
		fs.rmSync(projectRoot, {recursive: true, force: true});
	}
});

test('Skips a template without a readme', () => {
	const projectRoot = fs.mkdtempSync(
		path.join(os.tmpdir(), 'create-video-readme-'),
	);

	try {
		fs.writeFileSync(path.join(projectRoot, 'package.json'), '{}');

		patchReadmeMd(projectRoot, 'pnpm', stargazer);

		expect(fs.readdirSync(projectRoot)).toEqual(['package.json']);
	} finally {
		fs.rmSync(projectRoot, {recursive: true, force: true});
	}
});
