import path from 'node:path';
import {SFX_FINAL} from './sfx-final-names';

const VERSION = '4.0.464';
const DOCS_DIR = path.join(import.meta.dir, '../packages/docs/docs/sfx');
const durations = await Bun.file(
	path.join(import.meta.dir, '../downloads/wav-normalized/durations.json'),
).json() as Record<string, string>;

const durationFor = (fileName: string, oldFileName?: string) => {
	return (
		durations[fileName] ??
		(oldFileName ? durations[oldFileName] : undefined) ??
		'unknown'
	);
};

const attributionBlock = (pageUrl: string) => `Taken from ${pageUrl}.
This sound is not explicitly released under a free license, but it is probably fine to use given its widespread use.
Remotion will not take any responsibility for your use of this sound.`;

const seeAlso = [
	'[`bruh`](/docs/sfx/bruh)',
	'[`vineBoom`](/docs/sfx/vine-boom)',
	'[`windowsXpError`](/docs/sfx/windows-xp-error)',
];

for (const entry of SFX_FINAL) {
	const duration = durationFor(entry.fileName, entry.oldFileName);
	const mdx = `---
image: /generated/articles-docs-sfx-${entry.slug}.png
title: '${entry.exportName}'
crumb: '@remotion/sfx'
---

# ${entry.exportName}<AvailableFrom v="${VERSION}" />

import {PlayButton} from './PlayButton';

<PlayButton src="https://remotion.media/${entry.fileName}" />
<br />

A URL pointing to a ${entry.description.replace(' sound effect', '')} WAV file.

## Example

\`\`\`tsx twoslash title="MyComp.tsx"
import {${entry.exportName}} from '@remotion/sfx';
import {Audio} from '@remotion/media';

const MyVideo = () => {
  return <Audio src={${entry.exportName}} />;
};
\`\`\`

## Value

\`\`\`bash
https://remotion.media/${entry.fileName}
\`\`\`

## Duration

${duration}

## Attribution

${attributionBlock(entry.pageUrl)}

## See also

${seeAlso.map((l) => `- ${l}`).join('\n')}
`;

	await Bun.write(path.join(DOCS_DIR, `${entry.slug}.mdx`), mdx);
}

const exports = SFX_FINAL.map(
	(e) => `export const ${e.exportName} = 'https://remotion.media/${e.fileName}' as const;`,
).join('\n');

const existing = await Bun.file(
	path.join(import.meta.dir, '../packages/sfx/src/index.ts'),
).text();

const marker = '// Issue #7054 myinstants sound effects';
const base = existing.includes(marker)
	? existing.split(marker)[0]!.trimEnd()
	: existing.trimEnd();

await Bun.write(
	path.join(import.meta.dir, '../packages/sfx/src/index.ts'),
	`${base}\n\n${marker}\n${exports}\n`,
);

const existingTocItems = [
	['whip', 'whip', 'whip', 'Whip sound effect'],
	['whoosh', 'whoosh', 'whoosh', 'Whoosh sound effect'],
	['page-turn', 'page-turn', 'pageTurn', 'Page turn sound effect'],
	['ui-switch', 'switch', 'uiSwitch', 'UI switch sound effect'],
	['mouse-click', 'mouse-click', 'mouseClick', 'Mouse click sound effect'],
	['shutter-modern', 'shutter-modern', 'shutterModern', 'Modern camera shutter sound effect'],
	['shutter-old', 'shutter-old', 'shutterOld', 'Vintage camera shutter sound effect'],
	['ding', 'ding', 'ding', 'Ding notification sound effect'],
	['bruh', 'bruh', 'bruh', 'Bruh sound effect'],
	['vine-boom', 'vine-boom', 'vineBoom', 'Vine boom sound effect'],
	['windows-xp-error', 'windows-xp-error', 'windowsXpError', 'Windows XP error sound effect'],
] as const;

const allTocItems = [
	...existingTocItems.map(
		([slug, file, name, description]) =>
			`\t\t\t\t<SfxItem link="/docs/sfx/${slug}" src="https://remotion.media/${file}.wav" name="${name}" description="${description}" />`,
	),
	...SFX_FINAL.map(
		(e) =>
			`\t\t\t\t<SfxItem link="/docs/sfx/${e.slug}" src="https://remotion.media/${e.fileName}" name="${e.exportName}" description="${e.description}" />`,
	),
].join('\n');

const tocHeader = `import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';
import {PlayButton} from './PlayButton';

const SfxItem: React.FC<{
	readonly link: string;
	readonly src: string;
	readonly name: string;
	readonly description: string;
}> = ({link, src, name, description}) => {
	return (
		<TOCItem link={link}>
			<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12}}>
				<PlayButton src={src} size={32} depth={0.5} />
				<div>
					<strong>{name}</strong>
					<div>{description}</div>
				</div>
			</div>
		</TOCItem>
	);
};

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
`;

await Bun.write(
	path.join(DOCS_DIR, 'table-of-contents.tsx'),
	`${tocHeader}${allTocItems}
			</Grid>
		</div>
	);
};
`,
);

const sidebarPath = path.join(import.meta.dir, '../packages/docs/sidebars.ts');
const sidebar = await Bun.file(sidebarPath).text();
const sidebarMarker = '// Issue #7054';
const sidebarItems = SFX_FINAL.map((e) => `\t\t\t\t'sfx/${e.slug}',`).join('\n');

if (sidebar.includes(sidebarMarker)) {
	const before = sidebar.split(sidebarMarker)[0]!;
	const afterPart = sidebar.split(sidebarMarker)[1]!;
	const afterLines = afterPart.split('\n');
	const endIdx = afterLines.findIndex((l) => l.trim() === '],');
	const after = endIdx === -1 ? '' : afterLines.slice(endIdx).join('\n');
	await Bun.write(sidebarPath, `${before}${sidebarMarker}\n${sidebarItems}${after}`);
} else {
	await Bun.write(
		sidebarPath,
		sidebar.replace(
			"\t\t\t\t'sfx/windows-xp-error',",
			`\t\t\t\t'sfx/windows-xp-error',\n\t\t\t\t${sidebarMarker}\n${sidebarItems}`,
		),
	);
}

const skillsPath = path.join(
	import.meta.dir,
	'../packages/skills/skills/remotion/rules/sfx.md',
);
const skills = await Bun.file(skillsPath).text();
const skillsMarker = '<!-- Issue #7054 -->';
const skillUrls = SFX_FINAL.map(
	(e) => `- \`https://remotion.media/${e.fileName}\``,
).join('\n');

if (skills.includes(skillsMarker)) {
	const before = skills.split(skillsMarker)[0]!.trimEnd();
	const after = skills.split(skillsMarker)[1] ?? '';
	await Bun.write(skillsPath, `${before}\n\n${skillsMarker}\n${skillUrls}${after}`);
} else {
	await Bun.write(
		skillsPath,
		skills.replace(
			'- `https://remotion.media/windows-xp-error.wav`',
			`- \`https://remotion.media/windows-xp-error.wav\`\n\n${skillsMarker}\n${skillUrls}`,
		),
	);
}

console.log(`Generated ${SFX_FINAL.length} docs and package exports.`);
