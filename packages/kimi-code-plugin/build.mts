import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from 'node:fs';
import {join, resolve} from 'node:path';

const __dirname = new URL('.', import.meta.url).pathname;
const skillsOut = resolve(__dirname, 'skills');

const packagesSkillsDir = resolve(__dirname, '..', 'skills', 'skills');

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

const rewriteEmbeddedBestPracticesLinks = () => {
	const embeddedRoot = join(skillsOut, 'remotion-best-practices');

	if (!existsSync(embeddedRoot)) {
		return;
	}

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
			const rewritten = contents.replaceAll(
				'../remotion-best-practices/',
				'../',
			);
			if (contents !== rewritten) {
				writeFileSync(file, rewritten);
			}
		}
	};

	for (const entry of readdirSync(embeddedRoot, {withFileTypes: true})) {
		const child = join(embeddedRoot, entry.name);
		if (
			entry.isDirectory() &&
			entry.name !== 'rules' &&
			existsSync(join(child, 'SKILL.md'))
		) {
			rewriteMarkdownFiles(child);
		}
	}
};

console.log('Building Kimi Code plugin skills...\n');

if (existsSync(packagesSkillsDir)) {
	const skillFolders = readdirSync(packagesSkillsDir).filter((folder) =>
		statSync(join(packagesSkillsDir, folder)).isDirectory(),
	);

	console.log(`From packages/skills/skills/ (${skillFolders.length} skills):`);
	for (const folder of skillFolders) {
		copySkillDir(join(packagesSkillsDir, folder), folder);
	}
	rewriteEmbeddedBestPracticesLinks();
} else {
	console.warn('Warning: packages/skills/skills/ not found');
}

console.log('\nDone! Skills assembled in packages/kimi-code-plugin/skills/');
