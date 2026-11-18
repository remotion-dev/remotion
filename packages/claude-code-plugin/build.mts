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
import {
	basename,
	dirname,
	extname,
	join,
	relative,
	resolve,
	sep,
} from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareEmbeddedSkills} from '../skills/scripts/prepare-embedded-skills';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
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
			return (
				basename(source) !== 'remotion-icon.svg' &&
				!(
					basename(source) === 'openai.yaml' &&
					basename(dirname(source)) === 'agents'
				)
			);
		},
	});
	console.log(`  Copied ${destName}`);
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
	prepareEmbeddedSkills(skillsOut);

	const files = readdirSync(skillsOut, {recursive: true, encoding: 'utf8'})
		.map((file) => join(skillsOut, file))
		.filter((file) => statSync(file).isFile());
	const codeLanguages: Record<string, string> = {
		'.ts': 'ts',
		'.tsx': 'tsx',
		'.mjs': 'js',
	};
	const referencePaths = new Map(
		files
			.filter((file) => Object.hasOwn(codeLanguages, extname(file)))
			.map((file) => [file, `${file}.md`]),
	);
	const jsonPaths = new Map(
		files
			.filter((file) => extname(file) === '.geojson')
			.map((file) => [file, `${file.slice(0, -'.geojson'.length)}.json`]),
	);
	const decoder = new TextDecoder('utf-8', {fatal: true});
	for (const file of files) {
		const extension = extname(file);
		if (
			['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico'].includes(extension)
		) {
			continue;
		}

		if (
			![
				'.md',
				'.markdown',
				'.txt',
				'.text',
				'.json',
				'.yaml',
				'.yml',
				'.geojson',
			].includes(extension) &&
			!referencePaths.has(file)
		) {
			throw new Error(`Unsupported Claude plugin file: ${file}`);
		}

		let contents = decoder.decode(readFileSync(file));
		for (const [source, target] of jsonPaths) {
			contents = contents.replaceAll(basename(source), basename(target));
		}

		const referencePath = referencePaths.get(file);
		if (referencePath) {
			contents = `# ${basename(file)}

Copy the code below into \`${basename(file)}\` in your Remotion project. Preserve the relative directory layout and include its imported files and JSON data. Run or import the project copy.

\`\`\`${codeLanguages[extension]}
${contents.trimEnd()}
\`\`\`
`;
		} else if (extension === '.md') {
			contents = contents.replace(
				/(^```[^\n]*\n[\s\S]*?^```[^\n]*$)|`([^`\n]+)`|\]\(([^)\n]+)\)/gm,
				(match, codeBlock: string, codePath: string, linkPath: string) => {
					if (codeBlock) {
						return match;
					}

					const target = referencePaths.get(
						resolve(dirname(file), codePath || linkPath),
					);
					if (!target) {
						return match;
					}

					const targetPath = relative(dirname(file), target)
						.split(sep)
						.join('/');
					return codePath
						? `[${match} source](${targetPath})`
						: `](${targetPath})`;
				},
			);
		}

		if (contents.includes('\0') || contents.startsWith('#!')) {
			throw new Error(`Claude plugin file must be plain UTF-8 text: ${file}`);
		}

		if (Buffer.byteLength(contents, 'utf-8') > 256 * 1024) {
			throw new Error(`Claude plugin file exceeds 256 KiB: ${file}`);
		}

		const target = referencePath ?? jsonPaths.get(file) ?? file;
		if (target !== file && existsSync(target)) {
			throw new Error(`Claude plugin output already exists: ${target}`);
		}

		writeFileSync(target, contents);
		if (target !== file) {
			rmSync(file);
		}
	}
} else {
	console.warn('Warning: packages/skills/skills/ not found');
}

console.log('\nDone! Skills assembled in packages/claude-code-plugin/skills/');
