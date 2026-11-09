import path from 'node:path';
import {format, resolveConfig} from 'prettier';
import ts from '../../example/node_modules/typescript/lib/typescript.js';
import {captureCode} from './capture-code';
import {highlightCode} from './dark-plus';

const sourcePath = path.resolve(
	import.meta.dir,
	'../../example/src/Portfolio/scenes/CubeWave.tsx',
);
const source = await format(await Bun.file(sourcePath).text(), {
	...(await resolveConfig(sourcePath)),
	filepath: sourcePath,
	printWidth: 86,
});
const parsed = ts.createSourceFile(
	sourcePath,
	source,
	ts.ScriptTarget.Latest,
	true,
);
const start = source.indexOf('\tconst half = GRID / 2;');
const end = source.indexOf('\n', source.indexOf('\tcubes.sort(', start));
if (start < 0 || end < 0)
	throw new Error('Could not find the cube generation loop');
const code = source.slice(start, end).replace(/^\t/gm, '');
const snippet = {
	code,
	tokens: await highlightCode(code),
	fileName: path.basename(sourcePath),
	startLine: parsed.getLineAndCharacterOfPosition(start).line + 1,
};
const html = (
	await Bun.file(
		path.join(import.meta.dir, 'three-ways-code-shots/index.html'),
	).text()
)
	.replace(
		'Three ways — Monaco code shots',
		'CubeWave — Monaco code screenshot',
	)
	.replaceAll('32px', '48px')
	.replace('fontSize: 19', 'fontSize: 24')
	.replace('lineHeight: 29', 'lineHeight: 36');
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
		if (pathname === '/dark-plus-monaco.js') {
			return new Response(
				Bun.file(path.join(import.meta.dir, 'dark-plus-monaco.js')),
			);
		}
		if (pathname.startsWith('/monaco/')) {
			const file = path.resolve(monacoRoot, pathname.slice('/monaco/'.length));
			if (file.startsWith(monacoRoot + path.sep))
				return new Response(Bun.file(file));
		}
		return new Response('Not found', {status: 404});
	},
});
try {
	await captureCode([
		{
			url: server.url.toString(),
			output: path.resolve(process.argv[2] ?? '/tmp/cube-wave-monaco.png'),
			width: 1440,
			height: 1700,
		},
	]);
} finally {
	await server.stop(true);
}
