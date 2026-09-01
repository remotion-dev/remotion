import {
	existsSync,
	readdirSync,
	readFileSync,
	renameSync,
	statSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';

const embeddedSkillFilename = 'REFERENCE.md';

export const removeCrossSkillLinksFromMarkdown = ({
	contents,
	file,
	skillRoot,
}: {
	contents: string;
	file: string;
	skillRoot: string;
}) => {
	return contents.replace(
		/(!?)\[([^\]]+)]\(([^)]+)\)/g,
		(match, imagePrefix: string, label: string, target: string) => {
			if (
				imagePrefix === '!' ||
				(!target.startsWith('./') && !target.startsWith('../'))
			) {
				return match;
			}

			const targetWithoutFragment = target.split('#')[0];
			const relativeTarget = path.relative(
				skillRoot,
				path.resolve(path.dirname(file), targetWithoutFragment),
			);
			if (
				relativeTarget === '..' ||
				relativeTarget.startsWith(`..${path.sep}`) ||
				path.isAbsolute(relativeTarget)
			) {
				return label;
			}

			return match;
		},
	);
};

// Agent Skills file references must stay inside the skill directory. Keep the
// handoff text while removing links to sibling skills from distributable builds.
const removeCrossSkillLinks = (skillsRoot: string) => {
	const skillDirectories = readdirSync(skillsRoot, {withFileTypes: true})
		.filter((entry) => entry.isDirectory())
		.map((entry) => path.join(skillsRoot, entry.name));

	const rewriteMarkdownFiles = (skillRoot: string, directory: string) => {
		for (const entry of readdirSync(directory, {withFileTypes: true})) {
			const file = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				rewriteMarkdownFiles(skillRoot, file);
				continue;
			}

			if (!entry.isFile() || !file.endsWith('.md')) {
				continue;
			}

			const contents = readFileSync(file, 'utf-8');
			const rewritten = removeCrossSkillLinksFromMarkdown({
				contents,
				file,
				skillRoot,
			});
			if (contents !== rewritten) {
				writeFileSync(file, rewritten);
			}
		}
	};

	for (const skillDirectory of skillDirectories) {
		rewriteMarkdownFiles(skillDirectory, skillDirectory);
	}
};

const prepareEmbeddedSkillRoot = ({
	embeddedRoot,
	parentEntryFilename,
}: {
	embeddedRoot: string;
	parentEntryFilename: 'REFERENCE.md' | 'SKILL.md';
}) => {
	if (!existsSync(embeddedRoot)) {
		return;
	}

	const embeddedSkillNames = readdirSync(embeddedRoot, {withFileTypes: true})
		.filter((entry) => {
			const child = path.join(embeddedRoot, entry.name);
			return (
				entry.isDirectory() &&
				entry.name !== 'rules' &&
				statSync(path.join(child, 'SKILL.md'), {
					throwIfNoEntry: false,
				})?.isFile()
			);
		})
		.map((entry) => entry.name)
		.sort();

	const parentSkillName = path.basename(embeddedRoot);
	const rewriteMarkdownFiles = (dir: string) => {
		for (const entry of readdirSync(dir, {withFileTypes: true})) {
			const file = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				rewriteMarkdownFiles(file);
				continue;
			}

			if (!entry.isFile() || !file.endsWith('.md')) {
				continue;
			}

			const contents = readFileSync(file, 'utf-8');
			let rewritten = contents
				.replaceAll(
					`../${parentSkillName}/SKILL.md`,
					`../${parentEntryFilename}`,
				)
				.replaceAll(`../${parentSkillName}/`, '../');
			if (parentSkillName === 'remotion-markup') {
				rewritten = rewritten.replaceAll(
					'../../../remotion-interactivity/SKILL.md',
					'../../../../remotion-interactivity/SKILL.md',
				);
			}
			for (const skillName of embeddedSkillNames) {
				rewritten = rewritten.replaceAll(
					`${skillName}/SKILL.md`,
					`${skillName}/${embeddedSkillFilename}`,
				);
			}
			if (contents !== rewritten) {
				writeFileSync(file, rewritten);
			}
		}
	};

	rewriteMarkdownFiles(embeddedRoot);

	for (const skillName of embeddedSkillNames) {
		const child = path.join(embeddedRoot, skillName);
		renameSync(
			path.join(child, 'SKILL.md'),
			path.join(child, embeddedSkillFilename),
		);
	}
};

export const prepareEmbeddedSkills = (skillsRoot: string) => {
	const embeddedRoots = [
		{
			embeddedRoot: path.join(
				skillsRoot,
				'remotion-best-practices',
				'remotion-markup',
			),
			parentEntryFilename: 'REFERENCE.md' as const,
		},
		{
			embeddedRoot: path.join(skillsRoot, 'remotion-markup'),
			parentEntryFilename: 'SKILL.md' as const,
		},
		{
			embeddedRoot: path.join(skillsRoot, 'remotion-best-practices'),
			parentEntryFilename: 'SKILL.md' as const,
		},
	];

	for (const embeddedRoot of embeddedRoots) {
		prepareEmbeddedSkillRoot(embeddedRoot);
	}

	removeCrossSkillLinks(skillsRoot);
};

if (import.meta.main) {
	const skillsRoot = process.argv[2];
	if (!skillsRoot) {
		throw new Error('Expected the skills root as the first argument');
	}

	prepareEmbeddedSkills(path.resolve(skillsRoot));
}
