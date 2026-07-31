import {
	existsSync,
	lstatSync,
	readdirSync,
	readFileSync,
	readlinkSync,
	statSync,
} from 'node:fs';
import path from 'node:path';

type LinkIssue = {
	file: string;
	link: string;
	message: string;
};

const repoRoot = process.env.SKILLS_REPO_ROOT
	? path.resolve(process.env.SKILLS_REPO_ROOT)
	: path.resolve(__dirname, '..', '..', '..');
const skillsRoot = process.env.SKILLS_ROOT
	? path.resolve(process.env.SKILLS_ROOT)
	: path.join(repoRoot, 'packages', 'skills', 'skills');

const markdownLinkRegex = /!?\[[^\]]*]\(([^)]+)\)/g;

const isExternalLink = (link: string) => {
	return (
		link.startsWith('http://') ||
		link.startsWith('https://') ||
		link.startsWith('mailto:') ||
		link.startsWith('tel:') ||
		link.startsWith('data:') ||
		link.startsWith('#')
	);
};

const stripMarkdownTitle = (link: string) => {
	const trimmed = link.trim();
	const withoutAngles =
		trimmed.startsWith('<') && trimmed.endsWith('>')
			? trimmed.slice(1, -1)
			: trimmed;

	return withoutAngles.split(/\s+/)[0] as string;
};

const stripHashAndQuery = (link: string) => {
	const hashIndex = link.indexOf('#');
	const queryIndex = link.indexOf('?');
	const cutAt = [hashIndex, queryIndex]
		.filter((index) => index !== -1)
		.sort((a, b) => a - b)[0];

	return cutAt === undefined ? link : link.slice(0, cutAt);
};

const findMarkdownFiles = (dir: string, ancestorRealpaths: Set<string>) => {
	const dirRealpath = path.resolve(dir);
	if (ancestorRealpaths.has(dirRealpath)) {
		return [];
	}

	const nextAncestors = new Set(ancestorRealpaths);
	nextAncestors.add(dirRealpath);

	const files: string[] = [];
	for (const entry of readdirSync(dir, {withFileTypes: true})) {
		const fullPath = path.join(dir, entry.name);
		const stats = lstatSync(fullPath);

		if (stats.isSymbolicLink()) {
			const targetStats = statSync(fullPath);
			if (
				!targetStats.isDirectory() &&
				(entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))
			) {
				files.push(fullPath);
			}
			continue;
		}

		if (entry.isDirectory()) {
			files.push(...findMarkdownFiles(fullPath, nextAncestors));
		} else if (
			entry.isFile() &&
			(entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))
		) {
			files.push(fullPath);
		}
	}

	return files;
};

const validateMarkdownLinks = () => {
	const issues: LinkIssue[] = [];
	const files = findMarkdownFiles(skillsRoot, new Set());

	for (const file of files) {
		const contents = readFileSync(file, 'utf-8');
		const matches = contents.matchAll(markdownLinkRegex);

		for (const match of matches) {
			const rawLink = match[1] as string;
			const normalizedLink = stripMarkdownTitle(rawLink);

			if (isExternalLink(normalizedLink)) {
				continue;
			}

			const pathPart = stripHashAndQuery(normalizedLink);
			if (pathPart === '') {
				continue;
			}

			const target = path.resolve(path.dirname(file), pathPart);
			if (!existsSync(target)) {
				issues.push({
					file,
					link: rawLink,
					message: `Target does not exist: ${path.relative(repoRoot, target)}`,
				});
			}
		}
	}

	return issues;
};

const validateEmbeddedSkills = () => {
	const issues: LinkIssue[] = [];
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
		for (const skillName of skillNames) {
			const embeddedPath = path.join(parentRoot, skillName);

			if (!existsSync(embeddedPath)) {
				issues.push({
					file: parentRoot,
					link: skillName,
					message: `Missing embedded skill folder in ${parentSkill}: ${skillName}`,
				});
				continue;
			}

			const embeddedStats = lstatSync(embeddedPath);
			if (embeddedStats.isSymbolicLink()) {
				const target = readlinkSync(embeddedPath);
				if (target !== `../${skillName}`) {
					issues.push({
						file: embeddedPath,
						link: target,
						message: `Expected symlink target "../${skillName}"`,
					});
				}
			}
		}

		const parentSkillFile = path.join(parentRoot, 'SKILL.md');
		const contents = readFileSync(parentSkillFile, 'utf-8');
		const links = [...contents.matchAll(markdownLinkRegex)].map((match) =>
			stripMarkdownTitle(match[1] as string),
		);

		for (const link of links) {
			const siblingSkill = skillNames.find((skillName) =>
				link.startsWith(`../${skillName}/`),
			);
			if (siblingSkill) {
				issues.push({
					file: parentSkillFile,
					link,
					message: `Link from ${parentSkill} should point to the embedded copy, not a sibling skill folder`,
				});
				continue;
			}

			const ambiguousSkill = skillNames.find((skillName) =>
				link.startsWith(`${skillName}/`),
			);
			if (ambiguousSkill) {
				issues.push({
					file: parentSkillFile,
					link,
					message: `Link to embedded skill "${ambiguousSkill}" must start with "./" so it resolves relative to ${parentSkill}`,
				});
			}
		}
	}

	return issues;
};

const issues = [...validateMarkdownLinks(), ...validateEmbeddedSkills()];

if (issues.length > 0) {
	console.error(`Found ${issues.length} invalid skill link issue(s):`);
	for (const issue of issues) {
		console.error(
			`${path.relative(repoRoot, issue.file)} -> ${issue.link}: ${issue.message}`,
		);
	}

	process.exit(1);
}

console.log('All skill links are valid.');
