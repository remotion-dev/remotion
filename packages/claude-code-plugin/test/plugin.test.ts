import {expect, test} from 'bun:test';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';

const packageRoot = path.resolve(import.meta.dir, '..');
const generatedSkillsRoot = path.join(packageRoot, 'skills');
const embeddedRoots = [
	path.join(generatedSkillsRoot, 'remotion-best-practices'),
	path.join(generatedSkillsRoot, 'remotion-best-practices', 'remotion-markup'),
	path.join(generatedSkillsRoot, 'remotion-markup'),
];

test('built plugin has valid metadata and distributable files', () => {
	const packageJson = JSON.parse(
		readFileSync(path.join(packageRoot, 'package.json'), 'utf-8'),
	) as Record<string, unknown>;
	const manifest = JSON.parse(
		readFileSync(
			path.join(packageRoot, '.claude-plugin', 'plugin.json'),
			'utf-8',
		),
	) as Record<string, unknown>;

	expect(manifest.version).toBe(packageJson.version);
	expect(manifest.skills).toBe('./skills/');
	expect(manifest.icon).toBeUndefined();
	const icon = readFileSync(
		path.join(packageRoot, '.claude-plugin', 'icon.png'),
	);
	expect(icon.subarray(0, 8)).toEqual(
		Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
	);
	const iconWidth = icon.readUInt32BE(16);
	expect(icon.readUInt32BE(20)).toBe(iconWidth);
	expect(iconWidth).toBeGreaterThanOrEqual(512);
	expect(iconWidth).toBeLessThanOrEqual(2048);
	expect(icon.length).toBeLessThan(2 * 1024 * 1024);

	const files = ['.claude-plugin', 'skills'].flatMap((directory) =>
		readdirSync(path.join(packageRoot, directory), {
			recursive: true,
			encoding: 'utf8',
		})
			.map((file) => path.join(packageRoot, directory, file))
			.filter((file) => statSync(file).isFile()),
	);
	files.push(path.join(packageRoot, 'README.md'));
	expect(files.length).toBeLessThanOrEqual(512);
	const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico'];
	for (const file of files) {
		const extension = path.extname(file);
		expect([
			'.md',
			'.markdown',
			'.txt',
			'.text',
			'.json',
			'.yaml',
			'.yml',
			...imageExtensions,
		]).toContain(extension);
		if (imageExtensions.includes(extension)) {
			continue;
		}

		const contents = readFileSync(file);
		const text = new TextDecoder('utf-8', {fatal: true}).decode(contents);
		expect(text).not.toContain('\0');
		expect(text.startsWith('#!')).toBe(false);
		expect(contents.length).toBeLessThanOrEqual(256 * 1024);
	}
});

const getDirectories = (directory: string) => {
	return readdirSync(directory)
		.filter((entry) => statSync(path.join(directory, entry)).isDirectory())
		.sort();
};

const getMarkdownFiles = (directory: string): string[] => {
	return readdirSync(directory).flatMap((entry) => {
		const file = path.join(directory, entry);
		if (statSync(file).isDirectory()) {
			return getMarkdownFiles(file);
		}

		return file.endsWith('.md') ? [file] : [];
	});
};

test('only top-level skills use the discovery filename', () => {
	const topLevelSkillNames = getDirectories(generatedSkillsRoot);
	for (const skillName of topLevelSkillNames) {
		expect(
			existsSync(path.join(generatedSkillsRoot, skillName, 'SKILL.md')),
		).toBe(true);
	}

	const discoveredSkills = getMarkdownFiles(generatedSkillsRoot)
		.filter((file) => path.basename(file) === 'SKILL.md')
		.map((file) => path.relative(generatedSkillsRoot, file))
		.sort();
	expect(discoveredSkills).toEqual(
		topLevelSkillNames.map((skillName) => path.join(skillName, 'SKILL.md')),
	);

	for (const embeddedRoot of embeddedRoots) {
		const embeddedSkillNames = getDirectories(embeddedRoot).filter(
			(skillName) =>
				existsSync(path.join(embeddedRoot, skillName, 'REFERENCE.md')),
		);
		for (const skillName of embeddedSkillNames) {
			expect(existsSync(path.join(embeddedRoot, skillName, 'SKILL.md'))).toBe(
				false,
			);
			expect(
				existsSync(path.join(embeddedRoot, skillName, 'REFERENCE.md')),
			).toBe(true);
		}
	}
});

test('links to embedded skills use the renamed file', () => {
	for (const embeddedRoot of embeddedRoots) {
		for (const file of getMarkdownFiles(embeddedRoot)) {
			const contents = readFileSync(file, 'utf-8');
			for (const skillName of getDirectories(embeddedRoot)) {
				expect(contents).not.toContain(`${skillName}/SKILL.md`);
			}
		}
	}
});

test('maps is available from either standalone parent skill', () => {
	for (const parentSkill of ['remotion-best-practices', 'remotion-markup']) {
		const parentRoot = path.join(generatedSkillsRoot, parentSkill);
		expect(readFileSync(path.join(parentRoot, 'SKILL.md'), 'utf-8')).toContain(
			'(./remotion-maps/REFERENCE.md)',
		);
		expect(
			existsSync(path.join(parentRoot, 'remotion-maps', 'REFERENCE.md')),
		).toBe(true);
	}
});
