import path from 'node:path';
import {rspack} from '@rspack/core';

const port = Number(process.env.PORT ?? 62338);
const outputPath = path.join(import.meta.dir, '..', 'dist', 'e2e');

const compile = () =>
	new Promise<void>((resolve, reject) => {
		const compiler = rspack({
			context: import.meta.dir,
			devtool: 'source-map',
			entry: './app.tsx',
			mode: 'development',
			module: {
				rules: [
					{
						test: /\.tsx?$/,
						use: [
							{
								loader: 'builtin:swc-loader',
								options: {
									jsc: {
										parser: {syntax: 'typescript', tsx: true},
										transform: {react: {runtime: 'automatic'}},
									},
								},
							},
						],
					},
				],
			},
			output: {
				clean: true,
				filename: 'app.js',
				path: outputPath,
			},
			resolve: {extensions: ['.tsx', '.ts', '.jsx', '.js']},
		});

		compiler.run((error, stats) => {
			compiler.close(() => undefined);
			if (error) {
				reject(error);
				return;
			}

			if (stats?.hasErrors()) {
				reject(new Error(stats.toString({colors: true})));
				return;
			}

			resolve();
		});
	});

const document = (body: string, script: string | null) => `<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<style>html, body, #root { height: 100%; margin: 0; width: 100%; }</style>
	</head>
	<body>${body}${script ? `<script src="${script}"></script>` : ''}</body>
</html>`;

await compile();

Bun.serve({
	port,
	async fetch(request) {
		const url = new URL(request.url);
		const headers = {
			'Cross-Origin-Embedder-Policy': 'credentialless',
			'Cross-Origin-Opener-Policy': 'same-origin',
		};

		if (url.pathname === '/') {
			return new Response(document('<div id="root"></div>', '/app.js'), {
				headers: {...headers, 'Content-Type': 'text/html'},
			});
		}

		if (url.pathname === '/frame.html') {
			return new Response(document('', null), {
				headers: {...headers, 'Content-Type': 'text/html'},
			});
		}

		const filePath = path.join(outputPath, url.pathname);
		if (!filePath.startsWith(outputPath)) {
			return new Response('Not found', {status: 404});
		}

		const file = Bun.file(filePath);
		if (!(await file.exists())) {
			return new Response('Not found', {status: 404});
		}

		return new Response(file, {headers});
	},
});

process.stdout.write(`Browser Studio E2E server: http://127.0.0.1:${port}\n`);
