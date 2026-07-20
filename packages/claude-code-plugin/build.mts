import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	statSync,
	writeFileSync,
} from 'node:fs';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const skillsOut = resolve(__dirname, 'skills');

const packagesSkillsDir = resolve(__dirname, '..', 'skills', 'skills');
const embeddedSkillFilename = 'REFERENCE.md';

if (existsSync(skillsOut)) {
	rmSync(skillsOut, {recursive: true});
}
mkdirSync(skillsOut, {recursive: true});

const copySkillDir = (src: string, destName: string) => {
	const dest = join(skillsOut, destName);
	cpSync(src, dest, {
		recursive: true,
		dereference: true,
		filter: (source) => {
			if (source.endsWith('.tsx')) {
				return false;
			}

			return true;
		},
	});
	console.log(`  Copied ${destName}`);
};

const prepareEmbeddedBestPractices = () => {
	const embeddedRoot = join(skillsOut, 'remotion-best-practices');

	if (!existsSync(embeddedRoot)) {
		return;
	}

	const embeddedSkillNames = readdirSync(embeddedRoot, {withFileTypes: true})
		.filter((entry) => {
			const child = join(embeddedRoot, entry.name);
			return (
				entry.isDirectory() &&
				entry.name !== 'rules' &&
				existsSync(join(child, 'SKILL.md'))
			);
		})
		.map((entry) => entry.name)
		.sort();

	const rewriteMarkdownFiles = (dir: string) => {
		for (const entry of readdirSync(dir, {withFileTypes: true})) {
			const file = join(dir, entry.name);
			if (entry.isDirectory()) {
				rewriteMarkdownFiles(file);
				continue;
			}

			if (!entry.isFile() || !file.endsWith('.md')) {
				continue;
			}

			const contents = readFileSync(file, 'utf-8');
			let rewritten = contents.replaceAll('../remotion-best-practices/', '../');
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
		const child = join(embeddedRoot, skillName);
		renameSync(join(child, 'SKILL.md'), join(child, embeddedSkillFilename));
	}
};

console.log('Building Claude Code plugin skills...\n');

if (existsSync(packagesSkillsDir)) {
	const skillFolders = readdirSync(packagesSkillsDir).filter((folder) =>
		statSync(join(packagesSkillsDir, folder)).isDirectory(),
	);

	console.log(`From packages/skills/skills/ (${skillFolders.length} skills):`);
	for (const folder of skillFolders) {
		copySkillDir(join(packagesSkillsDir, folder), folder);
	}
	prepareEmbeddedBestPractices();
} else {
	console.warn('Warning: packages/skills/skills/ not found');
}

console.log('\nDone! Skills assembled in packages/claude-code-plugin/skills/');
