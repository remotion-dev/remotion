import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {openBrowser} from '@remotion/renderer';
import {highlightCode} from './dark-plus';

const output = path.resolve(process.argv[2] ?? '/tmp/higher-level-markup-cut');
const mode =
	process.argv[3] === 'move'
		? 'move'
		: process.argv[3] === 'paste'
			? 'paste'
			: 'cut';
await mkdir(output, {recursive: true});
const source = await Bun.file(
	path.resolve(
		import.meta.dir,
		'../src/AgenticallyProgrammatically/AgenticallyProgrammatically.tsx',
	),
).text();
const lines = source.split('\n');
const blockStart =
	lines.findIndex((line) =>
		line.includes('name="05 - Higher-level task prompt"'),
	) - 1;
const firstLine = blockStart - 5;
const blockEnd =
	lines.findIndex((line, index) => index > blockStart && line.trim() === '/>') +
	1;
const code = source;
const selectionLine = blockStart + 1;
const lineCount = blockEnd - blockStart;
const snippet = {
	code,
	tokens: await highlightCode(code),
	fileName: 'AgenticallyProgrammatically.tsx',
	startLine: 1,
};
const afterCode = code
	.split('\n')
	.filter(
		(_, index) =>
			index < selectionLine - 1 || index >= selectionLine - 1 + lineCount,
	)
	.join('\n');
const afterTokens = await highlightCode(afterCode);
const remainingLines = afterCode.split('\n');
const nextScene = remainingLines.findIndex((line) =>
	line.includes('name="06 -'),
);
const pasteLine =
	mode === 'move'
		? remainingLines.findIndex(
				(line, index) => index > nextScene && line.trim() === '<Video',
			) + 1
		: remainingLines.findIndex((line) => line.includes('name="06 - Captions"'));
if (pasteLine < 1) throw new Error('Could not find the destination scene');
const pastedLines = afterCode.split('\n');
pastedLines.splice(pasteLine - 1, 0, ...lines.slice(blockStart, blockEnd));
const pastedCode = pastedLines.join('\n');
const pastedTokens = mode !== 'cut' ? await highlightCode(pastedCode) : null;
const html = (
	await Bun.file(
		path.join(import.meta.dir, 'three-ways-code-shots/index.html'),
	).text()
)
	.replace('readOnly: true', 'readOnly: false')
	.replace('fontSize: 19', 'fontSize: 26')
	.replace('lineHeight: 29', 'lineHeight: 38')
	.replace('folding: false,', 'folding: false, stickyScroll: {enabled: false},')
	.replace(
		"renderLineHighlight: 'none'",
		"renderLineHighlight: 'line', cursorBlinking: 'solid'",
	);
const monacoRoot = path.resolve(
	import.meta.dir,
	'../../template-vibe-code/node_modules/monaco-editor/min',
);
const server = Bun.serve({
	hostname: '127.0.0.1',
	port: 0,
	fetch(request) {
		const {pathname} = new URL(request.url);
		if (pathname === '/')
			return new Response(html, {headers: {'Content-Type': 'text/html'}});
		if (pathname === '/snippet') return Response.json(snippet);
		if (pathname === '/dark-plus-monaco.js')
			return new Response(
				Bun.file(path.join(import.meta.dir, 'dark-plus-monaco.js')),
			);
		if (pathname.startsWith('/monaco/')) {
			const file = path.resolve(monacoRoot, pathname.slice('/monaco/'.length));
			if (file.startsWith(monacoRoot + path.sep))
				return new Response(Bun.file(file));
		}
		return new Response('Not found', {status: 404});
	},
});
const browser = await openBrowser('chrome');
try {
	const page = await browser.newPage({
		context: () => null,
		logLevel: 'error',
		indent: false,
		pageIndex: 0,
		onBrowserLog: null,
		onLog: () => {},
	});
	await page.setViewport({width: 1600, height: 1100, deviceScaleFactor: 2});
	await page.goto({url: server.url.toString(), timeout: 30000});
	await page.evaluate(
		async (line: number, scrollLine: number) => {
			while (document.body.dataset.captureReady !== 'true')
				await new Promise((resolve) => setTimeout(resolve, 20));
			const editor = (window as any).sdkEditor;
			editor.getModel().updateOptions({tabSize: 2, insertSpaces: false});
			editor.setPosition({lineNumber: line, column: 1});
			editor.setScrollTop(scrollLine * 38);
			editor.focus();
		},
		selectionLine,
		firstLine,
	);
	const shots: {file: string; frames: number}[] = [];
	const capture = async (name: string, frames: number) => {
		await page.evaluate(
			() =>
				new Promise<void>((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
				),
		);
		const {value: result} = await page
			._client()
			.send('Page.captureScreenshot', {format: 'png'});
		const file = path.join(output, `${name}.png`);
		await writeFile(file, Buffer.from(result.data, 'base64'));
		shots.push({file, frames});
	};
	const key = async (letter: string, commands: string[] = []) => {
		await page._client().send('Input.dispatchKeyEvent', {
			type: 'keyDown',
			key: letter,
			code: `Key${letter.toUpperCase()}`,
			modifiers: 4,
			windowsVirtualKeyCode: letter.toUpperCase().charCodeAt(0),
			commands,
		});
		await page._client().send('Input.dispatchKeyEvent', {
			type: 'keyUp',
			key: letter,
			code: `Key${letter.toUpperCase()}`,
			modifiers: 4,
		});
	};
	if (mode !== 'paste') await capture('00-ready', 6);
	for (let count = 1; count <= lineCount; count++) {
		await key('l');
		const selected = await page.evaluate(() => {
			const editor = (window as any).sdkEditor;
			return (
				editor.getModel().getValueInRange(editor.getSelection()).split('\n')
					.length - 1
			);
		});
		if (selected !== count)
			throw new Error(`Cmd+L selected ${selected} lines instead of ${count}`);
		if (mode !== 'paste') {
			await capture(
				`${String(count).padStart(2, '0')}-select`,
				mode === 'move'
					? count === lineCount
						? 8
						: 2
					: count === lineCount
						? 16
						: 3,
			);
		}
	}
	await key('x', ['Cut']);
	const remaining = await page.evaluate(() =>
		(window as any).sdkEditor.getValue(),
	);
	if (remaining !== afterCode)
		throw new Error('Cmd+X did not cut the exact HigherLevelTaskPrompt block');
	await page.evaluate(
		(tokens: unknown) =>
			(window as any).installDarkPlus((window as any).monaco, tokens),
		afterTokens,
	);
	if (mode === 'cut') {
		await capture('99-cut', 48);
	} else {
		if (mode === 'move') {
			await capture('13-cut', 10);
			const startScroll = await page.evaluate(() =>
				(window as any).sdkEditor.getScrollTop(),
			);
			for (let frame = 1; frame <= 26; frame++) {
				const progress = frame / 26;
				const eased =
					progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
				await page.evaluate(
					(scroll: number) => (window as any).sdkEditor.setScrollTop(scroll),
					startScroll + ((pasteLine - 7) * 38 - startScroll) * eased,
				);
				await capture(`14-scroll-${String(frame).padStart(2, '0')}`, 1);
			}
		}
		await page.evaluate(
			(line: number, margin: number) => {
				const editor = (window as any).sdkEditor;
				editor.setPosition({lineNumber: line, column: 1});
				editor.setScrollTop((line - margin) * 38);
				editor.focus();
			},
			pasteLine,
			mode === 'move' ? 7 : 5,
		);
		await capture('00-before-paste', 6);
		await key('v', ['Paste']);
		const pasted = await page.evaluate(() =>
			(window as any).sdkEditor.getValue(),
		);
		if (pasted !== pastedCode)
			throw new Error(
				'Cmd+V did not paste the exact block at the new location',
			);
		await page.evaluate(
			(tokens: unknown, line: number, margin: number) => {
				(window as any).installDarkPlus((window as any).monaco, tokens);
				const editor = (window as any).sdkEditor;
				editor.updateOptions({cursorBlinking: 'blink'});
				editor.setScrollTop((line - margin) * 38);
			},
			pastedTokens,
			pasteLine,
			mode === 'move' ? 7 : 5,
		);
		await capture('01-pasted', mode === 'move' ? 13 : 7);
		for (let count = 0; count < 11; count++) {
			await new Promise((resolve) => setTimeout(resolve, 200));
			await capture(`02-cursor-${count}`, 6);
		}
	}
	const manifest =
		shots
			.map(
				(shot) =>
					`file '${shot.file}'\noption framerate 30\nduration ${shot.frames / 30}`,
			)
			.join('\n') + `\nfile '${shots.at(-1)!.file}'\noption framerate 30\n`;
	await writeFile(path.join(output, 'frames.txt'), manifest);
	await writeFile(
		path.join(output, 'metadata.json'),
		JSON.stringify(
			{
				width: 3200,
				height: 2200,
				fps: 30,
				frames: shots.reduce((sum, shot) => sum + shot.frames, 0),
				selectionLine,
				lineCount,
				mode,
				pasteLine: mode !== 'cut' ? pasteLine : null,
				shots,
			},
			null,
			2,
		),
	);
	const encode = Bun.spawn(
		[
			'ffmpeg',
			'-hide_banner',
			'-loglevel',
			'error',
			'-f',
			'concat',
			'-safe',
			'0',
			'-i',
			path.join(output, 'frames.txt'),
			'-vf',
			'fps=30',
			'-frames:v',
			String(shots.reduce((sum, shot) => sum + shot.frames, 0)),
			'-c:v',
			'libx264',
			'-preset',
			'slow',
			'-crf',
			'10',
			'-pix_fmt',
			'yuv420p',
			'-movflags',
			'+faststart',
			`${output}.mp4`,
			'-y',
		],
		{stdout: 'inherit', stderr: 'inherit'},
	);
	if ((await encode.exited) !== 0)
		throw new Error('Could not encode the Monaco capture');
	console.log(`Captured Monaco ${mode} of ${lineCount} lines into ${output}`);
} finally {
	await browser.close({silent: true});
	await server.stop(true);
}
