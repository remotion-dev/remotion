import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	rmSync,
	statSync,
} from 'node:fs';
import {join, resolve} from 'node:path';
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
			if (source.endsWith('.tsx')) {
				return false;
			}

			return true;
		},
	});
	console.log(`  Copied ${destName}`);
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
	prepareEmbeddedSkills(skillsOut);
} else {
	console.warn('Warning: packages/skills/skills/ not found');
}

console.log('\nDone! Skills assembled in packages/kimi-code-plugin/skills/');
