import {expect, test} from 'bun:test';
import {
	existsSync,
	lstatSync,
	readdirSync,
	readFileSync,
	statSync,
} from 'node:fs';
import path from 'node:path';

const packageRoot = path.resolve(import.meta.dir, '..');
const canonicalSkillsRoot = path.resolve(packageRoot, '..', 'skills', 'skills');
const generatedSkillsRoot = path.join(packageRoot, 'skills');

const getDirectories = (directory: string) => {
	return readdirSync(directory)
		.filter((entry) => statSync(path.join(directory, entry)).isDirectory())
		.sort();
};

const getFiles = ({
	directory,
	expectNoSymlinks,
}: {
	directory: string;
	expectNoSymlinks: boolean;
}): string[] => {
	return readdirSync(directory)
		.sort()
		.flatMap((entry) => {
			const file = path.join(directory, entry);
			if (expectNoSymlinks) {
				expect(lstatSync(file).isSymbolicLink()).toBe(false);
			}

			if (statSync(file).isDirectory()) {
				return getFiles({directory: file, expectNoSymlinks});
			}

			return [file];
		});
};

test('manifest is valid', () => {
	const packageJson = JSON.parse(
		readFileSync(path.join(packageRoot, 'package.json'), 'utf-8'),
	) as Record<string, unknown>;
	const manifest = JSON.parse(
		readFileSync(
			path.join(packageRoot, '.kimi-plugin', 'plugin.json'),
			'utf-8',
		),
	) as Record<string, unknown>;

	expect(manifest.name).toBe('remotion');
	expect(manifest.version).toBe(packageJson.version);
	expect(manifest.skills).toBe('./skills/');
	expect(existsSync(generatedSkillsRoot)).toBe(true);

	for (const unsupportedField of [
		'sessionStart',
		'skillInstructions',
		'mcpServers',
		'hooks',
		'commands',
		'tools',
		'apps',
		'inject',
		'configFile',
	]) {
		expect(unsupportedField in manifest).toBe(false);
	}
});

test('generated skills match the canonical skills', () => {
	expect(getDirectories(generatedSkillsRoot)).toEqual(
		getDirectories(canonicalSkillsRoot),
	);

	const canonicalFiles = getFiles({
		directory: canonicalSkillsRoot,
		expectNoSymlinks: false,
	})
		.filter((file) => !file.endsWith('.tsx'))
		.map((file) => path.relative(canonicalSkillsRoot, file));
	const embeddedSkillNames = getDirectories(
		path.join(canonicalSkillsRoot, 'remotion-best-practices'),
	).filter((skillName) =>
		existsSync(
			path.join(
				canonicalSkillsRoot,
				'remotion-best-practices',
				skillName,
				'SKILL.md',
			),
		),
	);
	const getGeneratedRelativeFile = (relativeFile: string) => {
		const pathParts = relativeFile.split(path.sep);
		if (
			pathParts[0] === 'remotion-best-practices' &&
			embeddedSkillNames.includes(pathParts[1]) &&
			pathParts.at(-1) === 'SKILL.md'
		) {
			pathParts[pathParts.length - 1] = 'REFERENCE.md';
		}

		return pathParts.join(path.sep);
	};
	const generatedFiles = getFiles({
		directory: generatedSkillsRoot,
		expectNoSymlinks: true,
	}).map((file) => path.relative(generatedSkillsRoot, file));

	expect(generatedFiles).toEqual(
		canonicalFiles.map(getGeneratedRelativeFile).sort(),
	);

	for (const relativeFile of canonicalFiles) {
		const canonicalFile = path.join(canonicalSkillsRoot, relativeFile);
		const generatedFile = path.join(
			generatedSkillsRoot,
			getGeneratedRelativeFile(relativeFile),
		);
		if (relativeFile.endsWith('.md')) {
			const pathParts = relativeFile.split(path.sep);
			const canonicalContents = readFileSync(canonicalFile, 'utf-8');
			let expectedContents = canonicalContents;
			if (pathParts[0] === 'remotion-best-practices') {
				expectedContents = expectedContents.replaceAll(
					'../remotion-best-practices/',
					'../',
				);
				for (const skillName of embeddedSkillNames) {
					expectedContents = expectedContents.replaceAll(
						`${skillName}/SKILL.md`,
						`${skillName}/REFERENCE.md`,
					);
				}
			}
			expect(readFileSync(generatedFile, 'utf-8')).toBe(expectedContents);
		} else {
			expect(readFileSync(generatedFile)).toEqual(readFileSync(canonicalFile));
		}
	}
});
