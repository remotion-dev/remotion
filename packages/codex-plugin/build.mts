import {
	appendFileSync,
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmSync,
	statSync,
	writeFileSync,
} from 'fs';
import {join, resolve} from 'path';
import {fileURLToPath} from 'url';
import {prepareEmbeddedSkills} from '../skills/scripts/prepare-embedded-skills';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
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

const addCodexOnlyInstructions = () => {
	const remotionSkill = join(skillsOut, 'remotion-best-practices', 'SKILL.md');
	if (!existsSync(remotionSkill)) {
		return;
	}

	appendFileSync(
		remotionSkill,
		`

## Codex troubleshooting

When running inside Codex, first try starting the Remotion Studio without opening the system browser:

\`\`\`bash
npx remotion studio --no-open
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

const makeRemotionCreateOpenPreview = () => {
	const remotionCreateSkill = join(skillsOut, 'remotion-create', 'SKILL.md');
	if (!existsSync(remotionCreateSkill)) {
		return;
	}

	const currentInstructions = readFileSync(remotionCreateSkill, 'utf8');
	const previewInstruction = [
		'Instead of rendering the video, consider starting the preview server for faster iteration:',
		'Start the preview server after building the composition:',
	].find((instruction) => currentInstructions.includes(instruction));
	if (!previewInstruction) {
		throw new Error('Could not find a remotion-create preview instruction');
	}

	const codexReplacements = [
		[
			previewInstruction,
			'After creating or updating the video, start the preview server by default:',
		],
		[
			'If an in-harness browser is available, open it there.',
			'Open the exact URL in the Codex in-app browser. If no browser tool is available yet, use `tool_search` for the in-app browser control tool, then navigate to the local URL.',
		],
	] as const;

	let codexInstructions = currentInstructions;
	for (const [genericInstruction, codexInstruction] of codexReplacements) {
		if (!codexInstructions.includes(genericInstruction)) {
			throw new Error(
				`Could not find remotion-create instruction: ${genericInstruction}`,
			);
		}

		codexInstructions = codexInstructions.replace(
			genericInstruction,
			codexInstruction,
		);
	}

	writeFileSync(remotionCreateSkill, codexInstructions);
	console.log(
		'  Made remotion-create open previews in the Codex in-app browser',
	);
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
	prepareEmbeddedSkills(skillsOut);
	addCodexOnlyInstructions();
	makeRemotionCreateOpenPreview();
} else {
	console.warn('Warning: packages/skills/skills/ not found');
}

console.log('\nDone! Skills assembled in packages/codex-plugin/skills/');
