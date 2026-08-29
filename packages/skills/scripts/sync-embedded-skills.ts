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
const checkOnly = process.argv.includes('--check');
const issues: string[] = [];

const skillFolders = readdirSync(skillsRoot, {withFileTypes: true})
	.filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
	.map((entry) => entry.name)
	.sort();

const embeddedSkillSets = [
	{
		parentSkill: 'remotion-best-practices',
		skillNames: skillFolders.filter(
			(name) => name !== 'remotion-best-practices',
		),
	},
	{
		parentSkill: 'remotion-markup',
		skillNames: ['remotion-maps'],
	},
];

for (const {parentSkill, skillNames} of embeddedSkillSets) {
	const parentRoot = path.join(skillsRoot, parentSkill);
	const parentSkillFile = path.join(parentRoot, 'SKILL.md');

	for (const skillName of skillNames) {
		const embeddedPath = path.join(parentRoot, skillName);
		const expectedTarget = `../${skillName}`;

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

	let skillContents = readFileSync(parentSkillFile, 'utf-8');
	for (const skillName of skillNames) {
		skillContents = skillContents.replaceAll(
			`../${skillName}/`,
			`./${skillName}/`,
		);
		skillContents = skillContents.replaceAll(
			`](${skillName}/`,
			`](./${skillName}/`,
		);
	}

	const currentSkillContents = readFileSync(parentSkillFile, 'utf-8');
	if (currentSkillContents !== skillContents) {
		const message = `${path.relative(repoRoot, parentSkillFile)} has unsynced embedded skill links`;
		if (checkOnly) {
			issues.push(message);
		} else {
			writeFileSync(parentSkillFile, skillContents);
		}
	}
}

if (issues.length > 0) {
	console.error('Embedded skills are not synced:');
	for (const issue of issues) {
		console.error(`- ${issue}`);
	}
	process.exit(1);
}

console.log('Embedded skills are synced.');
