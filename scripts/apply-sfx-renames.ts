import {copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, unlinkSync} from 'node:fs';
import path from 'node:path';
import {OLD_7054_FILES, SFX_FINAL} from './sfx-final-names';

const MEDIA = path.join(import.meta.dir, '../packages/remotion-media');
const DOCS = path.join(import.meta.dir, '../packages/docs/docs/sfx');
const OLD_SLUGS = [
	'faaah',
	'x-files',
	'fail-horn',
	'romance',
	'yippieh',
	'lagging',
	'quack',
	'notification-snap',
	'aah',
	'what',
	'hurt',
	'oh-ma-gaud',
	'illuminati',
	'core-trigger',
];

// Rename WAV files in remotion-media package root
for (const sfx of SFX_FINAL) {
	const src = path.join(MEDIA, sfx.oldFileName ?? sfx.fileName);
	const dest = path.join(MEDIA, sfx.fileName);
	if (!existsSync(src)) {
		throw new Error(`Missing source wav: ${src}`);
	}

	if (src !== dest) {
		copyFileSync(src, dest);
	}
}

// Remove obsolete wav files (including x-files duplicate)
for (const file of [...OLD_7054_FILES, 'x-files.wav']) {
	const p = path.join(MEDIA, file);
	if (existsSync(p)) {
		unlinkSync(p);
	}
}

// Copy to files/ for R2
mkdirSync(path.join(MEDIA, 'files'), {recursive: true});
for (const sfx of SFX_FINAL) {
	copyFileSync(
		path.join(MEDIA, sfx.fileName),
		path.join(MEDIA, 'files', sfx.fileName),
	);
}

// Remove old doc pages
for (const slug of OLD_SLUGS) {
	const mdx = path.join(DOCS, `${slug}.mdx`);
	if (existsSync(mdx)) {
		rmSync(mdx);
	}
}

// Update variants.json — drop old 7054 entries, add final
const variantsPath = path.join(MEDIA, 'variants.json');
const variants = JSON.parse(await Bun.file(variantsPath).text()) as Array<{
	fileNames: string[];
	category: string;
	attribution?: string;
	videoCodec: string;
	audioCodec: string;
	container: string;
	size: number;
}>;

const oldNames = new Set([
	...OLD_7054_FILES,
	...SFX_FINAL.map((s) => s.oldFileName).filter(Boolean) as string[],
	...SFX_FINAL.map((s) => s.fileName),
]);

const filtered = variants.filter(
	(v) =>
		!(
			v.category === 'sound-effects' &&
			v.fileNames.some((f) => oldNames.has(f))
		),
);

for (const sfx of SFX_FINAL) {
	const size = statSync(path.join(MEDIA, sfx.fileName)).size;
	const label = sfx.description.replace(' sound effect', '');
	filtered.push({
		videoCodec: 'none',
		audioCodec: 'pcm',
		container: 'wav',
		fileNames: [sfx.fileName],
		size,
		category: 'sound-effects',
		attribution: `${label} -- ${sfx.pageUrl}`,
	});
}

await Bun.write(variantsPath, JSON.stringify(filtered, null, 2) + '\n');

// Update generate.ts soundEffects block
const generatePath = path.join(MEDIA, 'generate.ts');
let generate = await Bun.file(generatePath).text();
const start = generate.indexOf('\t{\n\t\tfileName: \'faaah.wav\'');
const end = generate.indexOf('\n];\n\nfor (const sfx of soundEffects)');
if (start === -1 || end === -1) {
	throw new Error('Could not find soundEffects block to replace in generate.ts');
}

const entries = SFX_FINAL.map((sfx) => {
	const label = sfx.description.replace(' sound effect', '');
	return `\t{\n\t\tfileName: '${sfx.fileName}',\n\t\tattribution: '${label} -- ${sfx.pageUrl}',\n\t},`;
});

generate =
	generate.slice(0, start) + '\n' + entries.join('\n') + generate.slice(end);
await Bun.write(generatePath, generate);

console.log(`Renamed ${SFX_FINAL.length} wav files, updated variants.json and generate.ts`);
