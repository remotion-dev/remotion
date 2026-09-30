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
const clientArgument = process.argv.find((argument) =>
	argument.startsWith('--client='),
);
const client = clientArgument?.slice('--client='.length) ?? 'codex';
if (client !== 'codex' && client !== 'cursor') {
	throw new Error(`Unsupported plugin client: ${client}`);
}

const outputArgument = process.argv.find((argument) =>
	argument.startsWith('--output='),
);
const skillsOut = outputArgument
	? resolve(outputArgument.slice('--output='.length))
	: resolve(__dirname, 'skills');

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

const makeOpenPreviewClientSpecific = () => {
	const remotionSkill = join(skillsOut, 'remotion-best-practices', 'SKILL.md');
	if (!existsSync(remotionSkill)) {
		return;
	}

	const currentInstructions = readFileSync(remotionSkill, 'utf8');
	const browserSectionStart = '### If you are using Cursor';
	const browserSectionEnd = '### More options';
	const startIndex = currentInstructions.indexOf(browserSectionStart);
	const endIndex = currentInstructions.indexOf(browserSectionEnd);
	if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
		throw new Error(
			`Could not find remotion-best-practices browser instructions between "${browserSectionStart}" and "${browserSectionEnd}"`,
		);
	}

	const browserSection =
		client === 'codex'
			? `Always pass \`--no-open\` so the system browser is not opened:

\`\`\`bash
npx remotion studio --no-open
\`\`\`

This will start a long-running process and print the server URL for the preview.  
If the server is already started, it will print the URL.
Open the exact URL in the Codex in-app browser and verify that Studio loads. Once a composition exists, verify that its video preview loads. If the in-app browser is not available, keep the preview server running and provide the URL to the user.
You can visit a specific composition by navigating to \`/[composition-id]\`, for example \`http://localhost:3000/MapAnimation\`.

:::note
The Studio supports WebMCP tools.
:::

`
			: `Run Studio without \`--no-open\` so it opens the browser automatically:

\`\`\`bash
npx remotion studio
\`\`\`

This will start a long-running process and print the server URL for the preview.  
If the server is already started, it will print the URL and refocus the browser.
You can visit a specific composition by navigating to \`/[composition-id]\`, for example \`http://localhost:3000/MapAnimation\`.

`;

	const instructions =
		currentInstructions.slice(0, startIndex) +
		browserSection +
		currentInstructions.slice(endIndex);

	writeFileSync(remotionSkill, instructions);
	console.log('  Made previews open in the agent browser');
};

console.log(
	`Building ${client === 'codex' ? 'Codex' : 'Cursor'} plugin skills...\n`,
);

if (existsSync(packagesSkillsDir)) {
	const skillFolders = readdirSync(packagesSkillsDir).filter((f) =>
		statSync(join(packagesSkillsDir, f)).isDirectory(),
	);

	console.log(`From packages/skills/skills/ (${skillFolders.length} skills):`);
	for (const folder of skillFolders) {
		copySkillDir(join(packagesSkillsDir, folder), folder);
	}
	prepareEmbeddedSkills(skillsOut);
	if (client === 'codex') {
		addCodexOnlyInstructions();
	}
	makeOpenPreviewClientSpecific();
} else {
	console.warn('Warning: packages/skills/skills/ not found');
}

console.log(`\nDone! Skills assembled in ${skillsOut}`);
