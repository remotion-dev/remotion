import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import path from 'node:path';
import {highlight} from 'codehike/code';
import {captionsSample} from './captions';
import {sample} from './sample';
import type {EditorShot, EditorToken} from './timeline';

const brandRoot = path.resolve(import.meta.dir, '../..');
const packagesRoot = path.resolve(brandRoot, '..');
const outputDir = path.join(brandRoot, 'public/aura-code');
// Reuse the monorepo's installed tooling rather than downloading browser assets.
const browserRequire = createRequire(
	path.join(packagesRoot, 'web-renderer/package.json'),
);
const monacoRequire = createRequire(
	path.join(packagesRoot, 'template-vibe-code/package.json'),
);
const {chromium} = browserRequire('playwright') as typeof import('playwright');
const monacoRoot = path.dirname(
	monacoRequire.resolve('monaco-editor/package.json'),
);
const lowerThirdPath = 'src/announcements/whats-new-in-remotion/LowerThird.tsx';
const lowerThird = await readFile(path.join(brandRoot, lowerThirdPath), 'utf8');
const chapterLines = sample.split('\n');
const duplicated = [
	...chapterLines.slice(0, 18),
	...chapterLines.slice(12, 18),
	...chapterLines.slice(18),
].join('\n');
const shots: EditorShot[] = [
	{
		id: 'chapters',
		frameCount: 120,
		fileName: 'WhatsNew.tsx',
		source:
			'packages/promo-pages/src/components/homepage/studio-handoff/editor-code.ts',
		code: sample,
		finalCode: sample,
		tokens: [],
		finalTokens: [],
		fontSize: 46,
		lineHeight: 56,
		firstVisibleLine: 7,
		folds: [],
		anchors: [
			{label: 'component', line: 8},
			{label: 'video config', line: 9},
			{label: 'chapters', line: 12},
			{label: 'first scene', line: 13},
			{label: 'intro', line: 14},
			{label: 'score', line: 32},
		],
	},
	{
		id: 'duplicate',
		frameCount: 48,
		fileName: 'WhatsNew.tsx',
		source:
			'packages/promo-pages/src/components/homepage/studio-handoff/editor-code.ts',
		code: sample,
		finalCode: duplicated,
		tokens: [],
		finalTokens: [],
		fontSize: 27,
		lineHeight: 34,
		firstVisibleLine: 10,
		folds: [],
		anchors: [
			{label: 'original block', line: 13},
			{label: 'original closing tag', line: 18},
			{label: 'new block', line: 19},
			{label: 'new closing tag', line: 24},
		],
	},
	{
		id: 'styles',
		frameCount: 120,
		fileName: 'LowerThird.tsx',
		source: `packages/brand/${lowerThirdPath}`,
		code: lowerThird,
		finalCode: lowerThird,
		tokens: [],
		finalTokens: [],
		fontSize: 46,
		lineHeight: 56,
		firstVisibleLine: 21,
		folds: [
			{start: 34, end: 42},
			{start: 48, end: 56},
		],
		anchors: [
			{label: 'presenter card', line: 21},
			{label: 'padding', line: 27},
			{label: 'translate', line: 30},
			{label: 'rotate', line: 44},
			{label: 'presenter name', line: 64},
			{label: 'presenter role', line: 75},
		],
	},
	{
		id: 'captions',
		frameCount: 120,
		fileName: 'Scene1.tsx',
		source:
			'packages/brand/aura-code-storyboard.txt (proposed caption addition)',
		code: captionsSample,
		finalCode: captionsSample,
		tokens: [],
		finalTokens: [],
		fontSize: 46,
		lineHeight: 56,
		firstVisibleLine: 17,
		folds: [],
		anchors: [],
	},
];
const requested =
	process.argv
		.find((arg) => arg.startsWith('--shot='))
		?.slice('--shot='.length) ?? null;
if (requested !== null && !shots.some((shot) => shot.id === requested))
	throw new Error(`Unknown shot: ${requested}`);

const highlightCode = async (code: string): Promise<EditorToken[][]> => {
	const highlighted = await highlight(
		{value: code, lang: 'tsx', meta: ''},
		'dark-plus',
	);
	const lines: EditorToken[][] = [[]];
	let column = 0;
	for (const token of highlighted.tokens) {
		const content = typeof token === 'string' ? token : token[0];
		const color = typeof token === 'string' ? '#D4D4D4' : token[1];
		const parts = content.split('\n');
		for (let index = 0; index < parts.length; index++) {
			if (index > 0) {
				lines.push([]);
				column = 0;
			}
			if (parts[index].length > 0) {
				lines.at(-1)!.push({
					startIndex: column,
					scopes: `color${color.slice(1).toLowerCase()}`,
				});
				column += parts[index].length;
			}
		}
	}
	return lines;
};
for (const shot of shots) {
	shot.tokens = await highlightCode(shot.code);
	shot.finalTokens =
		shot.code === shot.finalCode
			? shot.tokens
			: await highlightCode(shot.finalCode);
	if (shot.id === 'captions') {
		for (const [label, query] of [
			['shared sequence', '<Sequence'],
			['video', '<Video'],
			['captions', '<BasicCaptions'],
			['caption text', 'text:'],
			['lower third', '<LowerThird'],
		] as const) {
			shot.anchors.push({
				label,
				line:
					shot.code.split('\n').findIndex((line) => line.includes(query)) + 1,
			});
		}
	}
}
const build = await Bun.build({
	entrypoints: [path.join(import.meta.dir, 'browser.ts')],
	target: 'browser',
	minify: true,
});
if (!build.success) throw new Error(build.logs.join('\n'));
await mkdir(outputDir, {recursive: true});
const server = Bun.serve({
	hostname: '127.0.0.1',
	port: 0,
	async fetch(request) {
		const url = new URL(request.url);
		const pathname = url.pathname;
		if (pathname === '/browser.js') return new Response(build.outputs[0]);
		if (pathname === '/shot.json') {
			const shot = shots.find(
				(candidate) => candidate.id === url.searchParams.get('id'),
			);
			return shot ? Response.json(shot) : new Response(null, {status: 404});
		}
		if (pathname === '/') {
			const fileName =
				shots.find((shot) => shot.id === url.searchParams.get('shot'))
					?.fileName ?? 'WhatsNew.tsx';
			const html = (
				await readFile(path.join(import.meta.dir, 'editor.html'), 'utf8')
			).replaceAll('WhatsNew.tsx', fileName);
			return new Response(html, {headers: {'Content-Type': 'text/html'}});
		}
		if (pathname.startsWith('/vs/')) {
			const file = path.resolve(monacoRoot, 'min', `.${pathname}`);
			if (!file.startsWith(path.join(monacoRoot, 'min/vs/')))
				return new Response(null, {status: 404});
			return new Response(Bun.file(file));
		}
		if (
			request.method === 'POST' &&
			/^\/save\/(chapters|duplicate|styles|captions)(-(first-line|selected|copied))?\.(png|webm)$/.test(
				pathname,
			)
		) {
			await writeFile(
				path.join(outputDir, path.basename(pathname)),
				Buffer.from(await request.arrayBuffer()),
			);
			return new Response('Saved');
		}
		return new Response(null, {status: 404});
	},
});
const browser = await chromium
	.launch({
		executablePath:
			process.env.CHROME_EXECUTABLE ??
			'/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
		headless: true,
		args: ['--enable-features=CanvasDrawElement'],
	})
	.catch(async (error) => {
		await server.stop(true);
		throw error;
	});
try {
	for (const shot of shots.filter(
		(candidate) => requested === null || candidate.id === requested,
	)) {
		const page = await browser.newPage({
			viewport: {width: 1800, height: 1200},
			deviceScaleFactor: 2,
		});
		page.on('pageerror', (error) => console.error(error));
		await page.goto(`http://127.0.0.1:${server.port}/?shot=${shot.id}`, {
			waitUntil: 'networkidle',
		});
		await page.evaluate(() => window.auraReady);
		const capture = await page.evaluate(() => window.captureAura());
		await writeFile(
			path.join(outputDir, `${shot.id}.json`),
			JSON.stringify(
				{
					technique: 'Chrome HTML-in-canvas: requestPaint + drawElementImage',
					browser: await browser.version(),
					monaco: JSON.parse(
						await readFile(path.join(monacoRoot, 'package.json'), 'utf8'),
					).version,
					width: 3600,
					height: 2400,
					cssWidth: 1800,
					cssHeight: 1200,
					density: 2,
					fps: 30,
					frames: shot.frameCount,
					durationInSeconds: shot.frameCount / 30,
					theme: 'Code Hike dark-plus, matching the homepage',
					source: shot.source,
					fileName: shot.fileName,
					fontSize: shot.fontSize,
					lineHeight: shot.lineHeight,
					firstVisibleLine: shot.firstVisibleLine,
					folds: shot.folds,
					...capture,
				},
				null,
				2,
			) + '\n',
		);
		await page.close();
		console.log(
			`Saved ${shot.id}: 3600×2400, ${shot.frameCount / 30} seconds, to ${outputDir.replace(homedir(), '~')}`,
		);
	}
} finally {
	try {
		await browser.close();
	} finally {
		await server.stop(true);
	}
}
