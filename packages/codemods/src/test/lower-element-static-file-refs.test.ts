import {expect, test} from 'bun:test';
import {lowerElementStaticFileRefs} from '..';

const assets = [{path: 'card/logo.png'}, {path: 'card/sound.mp3'}];

test('lowers inline Element asset references and preserves layers', () => {
	const result = lowerElementStaticFileRefs({
		assets,
		sourceCode: `import {staticFileRef as asset, createElementPayload} from '@remotion/studio-protocol';
import {Img, staticFile as file} from 'remotion';

export const Card = () => <>
	<Img name="Logo" src={asset('card/logo.png', 'https://example.com/logo.png')} />
	<audio data-layer="Sound" src={asset('card/sound.mp3', 'data:audio/mpeg;base64,AA==')} />
	<Img name="Repeated" src={asset('card/logo.png', 'https://example.com/logo.png')} />
</>;
`,
	});

	expect(result.referencedAssetPaths).toEqual([
		'card/logo.png',
		'card/sound.mp3',
	]);
	expect(result.sourceCode).toMatch(
		/import \{\s*createElementPayload\s*\} from '@remotion\/studio-protocol';/,
	);
	expect(result.sourceCode).toMatch(
		/<Img name="Logo" src=\{file\(["']card\/logo\.png["']\)\} \/>/,
	);
	expect(result.sourceCode).toMatch(
		/<audio data-layer="Sound" src=\{file\(["']card\/sound\.mp3["']\)\} \/>/,
	);
	expect(result.sourceCode).not.toContain('staticFileRef');
	expect(result.sourceCode).not.toContain('https://example.com');
});

test('adds staticFile and removes an empty protocol import', () => {
	const result = lowerElementStaticFileRefs({
		assets: [{path: 'card/logo.png'}],
		sourceCode: `import {staticFileRef} from '@remotion/studio-protocol';
import {Img} from 'remotion';
export const Card = () => <Img src={staticFileRef('card/logo.png', '/preview.png')} />;
`,
	});

	expect(result.sourceCode).toMatch(
		/import \{\s*Img, staticFile\s*\} from 'remotion';/,
	);
	expect(result.sourceCode).toMatch(/staticFile\(["']card\/logo\.png["']\)/);
	expect(result.sourceCode).not.toContain('@remotion/studio-protocol');
});

test('rejects unsupported or unsafe staticFileRef usage without partial output', () => {
	const cases = [
		`import {staticFileRef} from '@remotion/studio-protocol';
export const Card = () => staticFileRef('other.png', '/preview.png');`,
		`import {staticFileRef} from '@remotion/studio-protocol';
const path = 'card/logo.png';
export const Card = () => staticFileRef(path, '/preview.png');`,
		`import {staticFileRef} from '@remotion/studio-protocol';
export const Card = () => staticFileRef('card/logo.png');`,
		`import * as Protocol from '@remotion/studio-protocol';
export const Card = () => Protocol.staticFileRef('card/logo.png', '/preview.png');`,
		`import {staticFileRef} from '@remotion/studio-protocol';
const ref = staticFileRef;
export const Card = () => ref('card/logo.png', '/preview.png');`,
		`import {staticFileRef} from '@remotion/studio-protocol';
const staticFile = () => '';
export const Card = () => staticFileRef('card/logo.png', '/preview.png');`,
		`export const Card = () => staticFileRef('card/logo.png', '/preview.png');`,
		`import {staticFileRef} from '@remotion/studio-protocol';
import {staticFile as file} from 'remotion';
export const Card = ({file}: {file: () => string}) => staticFileRef('card/logo.png', '/preview.png');`,
	];

	for (const sourceCode of cases) {
		expect(() => lowerElementStaticFileRefs({assets, sourceCode})).toThrow();
	}
});

test('leaves unrelated local functions unchanged', () => {
	const sourceCode = `const staticFileRef = (path: string) => path;
export const Card = () => staticFileRef('card/logo.png');`;
	expect(lowerElementStaticFileRefs({assets, sourceCode})).toEqual({
		referencedAssetPaths: [],
		sourceCode,
	});
});
