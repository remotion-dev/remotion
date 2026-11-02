import {expect, test} from 'bun:test';
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

const packageRoot = path.resolve(import.meta.dir, '..');
const generatedSkillsRoot = path.join(packageRoot, 'skills');
const embeddedRoots = [
	path.join(generatedSkillsRoot, 'remotion-best-practices'),
	path.join(generatedSkillsRoot, 'remotion-best-practices', 'remotion-markup'),
	path.join(generatedSkillsRoot, 'remotion-markup'),
];

test('portable Agent Plugins manifest describes the built package', () => {
	const packageJson = JSON.parse(
		readFileSync(path.join(packageRoot, 'package.json'), 'utf-8'),
	) as Record<string, unknown>;
	const manifest = JSON.parse(
		readFileSync(path.join(packageRoot, 'plugin.json'), 'utf-8'),
	) as Record<string, unknown>;
	const codexManifest = JSON.parse(
		readFileSync(
			path.join(packageRoot, '.codex-plugin', 'plugin.json'),
			'utf-8',
		),
	) as Record<string, unknown>;

	expect(manifest.$schema).toBe(
		'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
	);
	expect(manifest.name).toBe('remotion');
	expect(manifest.version).toBe(packageJson.version);
	expect(codexManifest.version).toBe(packageJson.version);
	for (const pluginManifest of [manifest, codexManifest]) {
		expect(pluginManifest).toMatchObject({
			name: 'remotion',
			author: {name: 'Remotion'},
			license: 'MIT',
		});
		expect(typeof pluginManifest.description).toBe('string');
		expect((pluginManifest.description as string).trim()).not.toBe('');
		expect(Array.isArray(pluginManifest.keywords)).toBe(true);
		expect(pluginManifest.keywords).toContain('remotion');
		for (const field of ['homepage', 'repository']) {
			expect(new URL(pluginManifest[field] as string).protocol).toBe('https:');
		}
	}
	expect(Object.keys(manifest).sort()).toEqual(
		[
			'$schema',
			'author',
			'description',
			'homepage',
			'keywords',
			'license',
			'name',
			'repository',
			'version',
		].sort(),
	);
	expect(existsSync(generatedSkillsRoot)).toBe(true);
	expect(codexManifest).toHaveProperty('interface.displayName', 'Remotion');
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

const expectValidSkills = (skillsRoot: string) => {
	const skillNames = getDirectories(skillsRoot);
	expect(skillNames).toEqual(
		getDirectories(path.join(packageRoot, '..', 'skills', 'skills')),
	);
	expect(skillNames.length).toBeGreaterThan(0);
	for (const skillName of skillNames) {
		const skillFile = path.join(skillsRoot, skillName, 'SKILL.md');
		const contents = readFileSync(skillFile, 'utf-8');
		const sections = contents.match(
			/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/,
		);
		if (!sections) {
			throw new Error(`${skillFile} must start with YAML frontmatter`);
		}

		const frontmatter = Bun.YAML.parse(sections[1]) as Record<string, unknown>;
		expect(frontmatter.name).toBe(skillName);
		expect(typeof frontmatter.description).toBe('string');
		expect(skillName).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
		expect(skillName.length).toBeLessThanOrEqual(64);
		const description = frontmatter.description as string;
		expect(description.trim()).not.toBe('');
		expect(description.length).toBeLessThanOrEqual(1024);
		expect(sections[2].trim()).not.toBe('');
		expect(contents.split(/\r?\n/).length).toBeLessThanOrEqual(500);
	}
};

test('generated Agent Plugin skills have valid metadata and content', () => {
	expectValidSkills(generatedSkillsRoot);
});

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

test('file links stay within each skill directory', () => {
	for (const skillName of getDirectories(generatedSkillsRoot)) {
		const skillRoot = path.join(generatedSkillsRoot, skillName);
		for (const file of getMarkdownFiles(skillRoot)) {
			const contents = readFileSync(file, 'utf-8');
			for (const match of contents.matchAll(/!?\[[^\]]+]\(([^)]+)\)/g)) {
				const target = match[1];
				if (!target.startsWith('./') && !target.startsWith('../')) {
					continue;
				}

				const targetWithoutFragment = target.split('#')[0];
				const relativeTarget = path.relative(
					skillRoot,
					path.resolve(path.dirname(file), targetWithoutFragment),
				);
				expect(relativeTarget).not.toBe('..');
				expect(relativeTarget.startsWith(`..${path.sep}`)).toBe(false);
				expect(path.isAbsolute(relativeTarget)).toBe(false);
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

test('remotion-best-practices opens the preview in the agent browser by default', () => {
	const previewSkill = readFileSync(
		path.join(generatedSkillsRoot, 'remotion-best-practices', 'SKILL.md'),
		'utf-8',
	);

	expect(previewSkill).toContain('start the preview server by default');
	expect(previewSkill).toContain(
		'Open the exact URL in the Codex in-app browser.',
	);
	expect(previewSkill).not.toContain('If you have an in-app browser');
	expect(previewSkill).not.toMatch(/^npx remotion studio$/m);
	expect(previewSkill).not.toContain('tool_search');
	expect(previewSkill).not.toContain('consider starting the preview server');
});

test('Codex troubleshooting does not open the system browser', () => {
	const remotionSkill = readFileSync(
		path.join(generatedSkillsRoot, 'remotion-best-practices', 'SKILL.md'),
		'utf-8',
	);

	expect(remotionSkill).toContain('## Codex troubleshooting');
	expect(remotionSkill).not.toContain('## Agent client troubleshooting');
	expect(remotionSkill).toContain('npx remotion studio --no-open');
	expect(remotionSkill).not.toMatch(/^npx remotion studio$/m);
});

test('portable build has valid skills and omits Codex troubleshooting', () => {
	const cursorSkillsRoot = mkdtempSync(
		path.join(tmpdir(), 'remotion-cursor-plugin-skills-'),
	);
	try {
		const result = Bun.spawnSync({
			cmd: [
				process.execPath,
				'build.mts',
				'--client=cursor',
				`--output=${cursorSkillsRoot}`,
			],
			cwd: packageRoot,
		});
		if (result.exitCode !== 0) {
			throw new Error(result.stderr.toString('utf-8'));
		}

		const remotionSkill = readFileSync(
			path.join(cursorSkillsRoot, 'remotion-best-practices', 'SKILL.md'),
			'utf-8',
		);
		const previewSkill = readFileSync(
			path.join(cursorSkillsRoot, 'remotion-best-practices', 'SKILL.md'),
			'utf-8',
		);
		expect(previewSkill).toContain(
			"Open the exact URL in the agent client's available browser, such as the integrated browser in GitHub Copilot (VS Code) or Cursor.",
		);
		expect(previewSkill).not.toContain('Codex in-app browser');
		expect(remotionSkill).not.toContain('## Codex troubleshooting');
		expect(remotionSkill).not.toContain('## Agent client troubleshooting');
		expectValidSkills(cursorSkillsRoot);
	} finally {
		rmSync(cursorSkillsRoot, {recursive: true});
	}
});

test('skill display names match their slash commands', () => {
	for (const skillName of getDirectories(generatedSkillsRoot)) {
		const openAiConfig = readFileSync(
			path.join(generatedSkillsRoot, skillName, 'agents', 'openai.yaml'),
			'utf-8',
		);
		expect(openAiConfig).toContain(`display_name: '/${skillName}'`);
	}
});
