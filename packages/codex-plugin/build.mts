import {
	appendFileSync,
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	statSync,
	writeFileSync,
} from 'fs';
import {join, resolve} from 'path';

const __dirname = new URL('.', import.meta.url).pathname;
const skillsOut = resolve(__dirname, 'skills');

const packagesSkillsDir = resolve(__dirname, '..', 'skills', 'skills');
const embeddedSkillFilename = 'REFERENCE.md';

if (existsSync(skillsOut)) {
	rmSync(skillsOut, {recursive: true});
}
mkdirSync(skillsOut, {recursive: true});

function copySkillDir(src: string, destName: string) {
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
}

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

const addCodexOnlyInstructions = () => {
	const remotionSkill = join(skillsOut, 'remotion-best-practices', 'SKILL.md');
	if (!existsSync(remotionSkill)) {
		return;
	}

	appendFileSync(
		remotionSkill,
		`

## Codex troubleshooting

When running inside Codex, first try starting the Remotion Studio normally:

\`\`\`bash
npx remotion studio
\`\`\`

Only if that fails with file watcher limits such as \`EMFILE: too many open files, watch\`, retry with polling and without opening a browser from Codex:

\`\`\`bash
npx remotion studio --no-open --webpack-poll 1000
\`\`\`

If Studio still fails to start from Codex, ask the user to start it manually from their macOS Terminal and then continue using the already-running Studio. Sandbox errors while launching Chromium from Codex are likely caused by the Codex/macOS sandbox rather than the Remotion project.
`,
	);
	console.log('  Added Codex-only troubleshooting instructions');
};

console.log('Building Codex plugin skills...\n');

if (existsSync(packagesSkillsDir)) {
	const skillFolders = readdirSync(packagesSkillsDir).filter((f) =>
		statSync(join(packagesSkillsDir, f)).isDirectory(),
	);

	console.log(`From packages/skills/skills/ (${skillFolders.length} skills):`);
	for (const folder of skillFolders) {
		copySkillDir(join(packagesSkillsDir, folder), folder);
	}
	prepareEmbeddedBestPractices();
	addCodexOnlyInstructions();
} else {
	console.warn('Warning: packages/skills/skills/ not found');
}

console.log('\nDone! Skills assembled in packages/codex-plugin/skills/');
