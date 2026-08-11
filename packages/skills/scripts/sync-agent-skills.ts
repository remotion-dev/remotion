import {
	lstatSync,
	mkdirSync,
	readdirSync,
	readlinkSync,
	symlinkSync,
} from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.SKILLS_REPO_ROOT
	? path.resolve(process.env.SKILLS_REPO_ROOT)
	: path.resolve(__dirname, '..', '..', '..');
const skillsRoot = path.join(repoRoot, 'packages', 'skills', 'skills');
const agentsSkillsRoot = path.join(repoRoot, '.agents', 'skills');
const claudeSkillsRoot = path.join(repoRoot, '.claude', 'skills');
const checkOnly = process.argv.includes('--check');
const issues: string[] = [];

const skillFolders = readdirSync(skillsRoot, {withFileTypes: true})
	.filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
	.map((entry) => entry.name)
	.sort();

for (const skillFolder of skillFolders) {
	const linkedPath = path.join(agentsSkillsRoot, skillFolder);
	const expectedTarget = `../../packages/skills/skills/${skillFolder}`;
	const stats = lstatSync(linkedPath, {throwIfNoEntry: false});

	if (!stats) {
		const message = `Missing ${path.relative(repoRoot, linkedPath)} -> ${expectedTarget}`;
		if (checkOnly) {
			issues.push(message);
		} else {
			symlinkSync(expectedTarget, linkedPath, 'dir');
			console.log(
				`Created ${path.relative(repoRoot, linkedPath)} -> ${expectedTarget}`,
			);
		}
		continue;
	}

	if (!stats.isSymbolicLink()) {
		issues.push(
			`${path.relative(repoRoot, linkedPath)} exists but is not a symlink`,
		);
		continue;
	}

	const actualTarget = readlinkSync(linkedPath);
	if (actualTarget !== expectedTarget) {
		issues.push(
			`${path.relative(repoRoot, linkedPath)} points to ${actualTarget}, expected ${expectedTarget}`,
		);
	}
}

const expectedClaudeTarget = '../.agents/skills';
const claudeSkillsStats = lstatSync(claudeSkillsRoot, {throwIfNoEntry: false});

if (!claudeSkillsStats) {
	const message = `Missing ${path.relative(repoRoot, claudeSkillsRoot)} -> ${expectedClaudeTarget}`;
	if (checkOnly) {
		issues.push(message);
	} else {
		mkdirSync(path.dirname(claudeSkillsRoot), {recursive: true});
		symlinkSync(expectedClaudeTarget, claudeSkillsRoot, 'dir');
		console.log(
			`Created ${path.relative(repoRoot, claudeSkillsRoot)} -> ${expectedClaudeTarget}`,
		);
	}
} else if (!claudeSkillsStats.isSymbolicLink()) {
	issues.push(
		`${path.relative(repoRoot, claudeSkillsRoot)} exists but is not a symlink`,
	);
} else {
	const actualTarget = readlinkSync(claudeSkillsRoot);
	if (actualTarget !== expectedClaudeTarget) {
		issues.push(
			`${path.relative(repoRoot, claudeSkillsRoot)} points to ${actualTarget}, expected ${expectedClaudeTarget}`,
		);
	}
}

if (issues.length > 0) {
	console.error('Skill links are out of sync:');
	for (const issue of issues) {
		console.error(`- ${issue}`);
	}
	process.exit(1);
}

console.log('All skill links are in sync.');
