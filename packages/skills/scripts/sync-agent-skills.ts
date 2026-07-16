import {lstatSync, readdirSync, readlinkSync, symlinkSync} from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.SKILLS_REPO_ROOT
	? path.resolve(process.env.SKILLS_REPO_ROOT)
	: path.resolve(__dirname, '..', '..', '..');
const skillsRoot = path.join(repoRoot, 'packages', 'skills', 'skills');
const agentsSkillsRoot = path.join(repoRoot, '.agents', 'skills');
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

if (issues.length > 0) {
	console.error('Public skills are not linked into .agents/skills:');
	for (const issue of issues) {
		console.error(`- ${issue}`);
	}
	process.exit(1);
}

console.log('All public skills are linked into .agents/skills.');
