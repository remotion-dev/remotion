import {expect, test} from 'bun:test';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';

const packageRoot = path.resolve(import.meta.dir, '..');
const generatedSkillsRoot = path.join(packageRoot, 'skills');
const embeddedRoot = path.join(generatedSkillsRoot, 'remotion-best-practices');

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

	const embeddedSkillNames = getDirectories(embeddedRoot).filter((skillName) =>
		topLevelSkillNames.includes(skillName),
	);
	for (const skillName of embeddedSkillNames) {
		expect(existsSync(path.join(embeddedRoot, skillName, 'SKILL.md'))).toBe(
			false,
		);
		expect(existsSync(path.join(embeddedRoot, skillName, 'REFERENCE.md'))).toBe(
			true,
		);
	}
});

test('links to embedded skills use the renamed file', () => {
	for (const file of getMarkdownFiles(embeddedRoot)) {
		const contents = readFileSync(file, 'utf-8');
		for (const skillName of getDirectories(embeddedRoot)) {
			expect(contents).not.toContain(`${skillName}/SKILL.md`);
		}
	}
});
