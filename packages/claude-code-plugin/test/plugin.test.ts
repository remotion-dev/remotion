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
