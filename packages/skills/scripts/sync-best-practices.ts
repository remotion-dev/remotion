import {
	existsSync,
	lstatSync,
	readdirSync,
	readFileSync,
	readlinkSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.SKILLS_REPO_ROOT
	? path.resolve(process.env.SKILLS_REPO_ROOT)
	: path.resolve(__dirname, '..', '..', '..');
const skillsRoot = path.join(repoRoot, 'packages', 'skills', 'skills');
const bestPracticesRoot = path.join(skillsRoot, 'remotion-best-practices');
const bestPracticesSkill = path.join(bestPracticesRoot, 'SKILL.md');
const checkOnly = process.argv.includes('--check');
const issues: string[] = [];

const skillFolders = readdirSync(skillsRoot, {withFileTypes: true})
	.filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
	.map((entry) => entry.name)
	.filter((name) => name !== 'remotion-best-practices')
	.sort();

for (const skillFolder of skillFolders) {
	const embeddedPath = path.join(bestPracticesRoot, skillFolder);
	const expectedTarget = `../${skillFolder}`;

	if (!existsSync(embeddedPath)) {
		const message = `Missing ${path.relative(repoRoot, embeddedPath)} -> ${expectedTarget}`;
		if (checkOnly) {
			issues.push(message);
		} else {
			symlinkSync(expectedTarget, embeddedPath, 'dir');
			console.log(
				`Created ${path.relative(repoRoot, embeddedPath)} -> ${expectedTarget}`,
			);
		}
		continue;
	}

	const stats = lstatSync(embeddedPath);
	if (stats.isSymbolicLink()) {
		const actualTarget = readlinkSync(embeddedPath);
		if (actualTarget !== expectedTarget) {
			issues.push(
				`${path.relative(repoRoot, embeddedPath)} points to ${actualTarget}, expected ${expectedTarget}`,
			);
		}
	}
}

let skillContents = readFileSync(bestPracticesSkill, 'utf-8');
for (const skillFolder of skillFolders) {
	skillContents = skillContents.replaceAll(
		`../${skillFolder}/`,
		`${skillFolder}/`,
	);
}

const currentSkillContents = readFileSync(bestPracticesSkill, 'utf-8');
if (currentSkillContents !== skillContents) {
	const message = `${path.relative(repoRoot, bestPracticesSkill)} has unsynced sibling skill links`;
	if (checkOnly) {
		issues.push(message);
	} else {
		writeFileSync(bestPracticesSkill, skillContents);
	}
}

if (issues.length > 0) {
	console.error(`remotion-best-practices is not synced:`);
	for (const issue of issues) {
		console.error(`- ${issue}`);
	}
	process.exit(1);
}

console.log('remotion-best-practices is synced.');
