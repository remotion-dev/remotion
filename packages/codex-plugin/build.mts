import {
	appendFileSync,
	cpSync,
	existsSync,
	mkdirSync,
	rmSync,
	readdirSync,
	statSync,
} from 'fs';
import {join, resolve} from 'path';

const __dirname = new URL('.', import.meta.url).pathname;
const skillsOut = resolve(__dirname, 'skills');

const packagesSkillsDir = resolve(__dirname, '..', 'skills', 'skills');

if (existsSync(skillsOut)) {
	rmSync(skillsOut, {recursive: true});
}
mkdirSync(skillsOut, {recursive: true});

function copySkillDir(src: string, destName: string) {
	const dest = join(skillsOut, destName);
	cpSync(src, dest, {
		recursive: true,
		filter: (source) => {
			if (source.endsWith('.tsx')) {
				return false;
			}
			return true;
		},
	});
	console.log(`  Copied ${destName}`);
}

const addCodexOnlyInstructions = () => {
	const remotionSkill = join(skillsOut, 'remotion', 'SKILL.md');
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
	addCodexOnlyInstructions();
} else {
	console.warn('Warning: packages/skills/skills/ not found');
}

console.log('\nDone! Skills assembled in packages/codex-plugin/skills/');
