import path from 'node:path';

const monacoRoot = path.resolve(
	import.meta.dir,
	'../../../template-vibe-code/node_modules/monaco-editor/min',
);

const server = Bun.serve({
	hostname: '127.0.0.1',
	port: 3040,
	async fetch(request) {
		const {pathname} = new URL(request.url);
		if (pathname === '/') {
			return new Response(Bun.file(path.join(import.meta.dir, 'index.html')));
		}

		if (pathname === '/snippet.ts') {
			return new Response(
				Bun.file(path.join(import.meta.dir, 'imports.ts.txt')),
			);
		}

		if (pathname.startsWith('/monaco/')) {
			const filePath = path.resolve(
				monacoRoot,
				pathname.slice('/monaco/'.length),
			);
			if (!filePath.startsWith(monacoRoot + path.sep)) {
				return new Response('Not found', {status: 404});
			}

			const file = Bun.file(filePath);
			if (await file.exists()) return new Response(file);
		}

		return new Response('Not found', {status: 404});
	},
});

// eslint-disable-next-line no-console
console.log(`SDK code-shot editor: ${server.url}`);
