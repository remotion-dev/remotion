import path from 'node:path';
import {format, resolveConfig} from 'prettier';
import ts from '../../../example/node_modules/typescript/lib/typescript.js';
import {highlightCode} from '../dark-plus';

const packagesRoot = path.resolve(import.meta.dir, '../../..');
const monacoRoot = path.join(
	packagesRoot,
	'template-vibe-code/node_modules/monaco-editor/min',
);
const shots = {
	content: {
		file: 'example/src/rotating-starburst.element.tsx',
		node: 'RotatingStarburstInner',
	},
	editing: {
		file: 'jonnys-videos/src/roller-skis-new/scenes/RideMontage.tsx',
		node: 'TransitionSeries',
	},
	captions: {
		file: 'brand/src/AgenticallyProgrammatically/AgenticallyProgrammatically.tsx',
		node: 'BasicCaptions',
	},
	exporting: {
		file: 'template-render-server/server/render-queue.ts',
		node: 'composition',
	},
	settings: {file: 'brand/remotion.config.ts', node: 'file'},
};

const server = Bun.serve({
	hostname: '127.0.0.1',
	port: 3041,
	async fetch(request) {
		const url = new URL(request.url);
		if (url.pathname === '/dark-plus-monaco.js') {
			return new Response(
				Bun.file(path.join(import.meta.dir, '../dark-plus-monaco.js')),
				{headers: {'Content-Type': 'text/javascript'}},
			);
		}

		if (url.pathname === '/') {
			return new Response(Bun.file(path.join(import.meta.dir, 'index.html')));
		}
		if (url.pathname === '/snippet') {
			const shot = shots[url.searchParams.get('shot') as keyof typeof shots];
			if (!shot) return new Response('Unknown shot', {status: 404});
			const sourcePath = path.join(packagesRoot, shot.file);
			const formatOptions = {
				...(await resolveConfig(sourcePath)),
				filepath: sourcePath,
				printWidth: shot === shots.exporting ? 100 : 44,
			};
			const source = await format(
				await Bun.file(sourcePath).text(),
				formatOptions,
			);
			const parsed = ts.createSourceFile(
				sourcePath,
				source,
				ts.ScriptTarget.Latest,
				true,
				ts.ScriptKind.TSX,
			);
			const matches: ts.Node[] = [];
			const visit = (node: ts.Node) => {
				if (matches.length > 0) return;
				if (
					(shot.node === 'file' && ts.isSourceFile(node)) ||
					(ts.isVariableStatement(node) &&
						node.declarationList.declarations.some(
							(declaration) => declaration.name.getText(parsed) === shot.node,
						)) ||
					(ts.isJsxElement(node) &&
						node.openingElement.tagName.getText(parsed) === shot.node) ||
					(ts.isJsxSelfClosingElement(node) &&
						node.tagName.getText(parsed) === shot.node &&
						node.attributes.properties.some(
							(attribute) =>
								ts.isJsxAttribute(attribute) &&
								attribute.name.getText(parsed) === 'name' &&
								attribute.initializer &&
								ts.isStringLiteral(attribute.initializer) &&
								attribute.initializer.text === '03 - Captions',
						))
				) {
					matches.push(node);
					return;
				}
				ts.forEachChild(node, visit);
			};
			visit(parsed);
			const node = matches[0];
			if (!node)
				throw new Error(`Could not locate ${shot.node} in ${shot.file}`);
			const lineStart = source.lastIndexOf('\n', node.getStart(parsed)) + 1;
			const start = source.slice(0, lineStart).split('\n').length;
			let end = node.getEnd();
			if (shot === shots.exporting) {
				if (!ts.isVariableStatement(node) || !ts.isBlock(node.parent)) {
					throw new Error('Expected the render-server composition declaration');
				}
				const index = node.parent.statements.indexOf(node);
				const render = node.parent.statements[index + 1];
				if (
					!render ||
					!render.getText(parsed).startsWith('await renderMedia(')
				) {
					throw new Error('Expected renderMedia after selectComposition');
				}
				end = render.getEnd();
			}
			const lines = source.slice(lineStart, end).split('\n');
			const indent = Math.min(
				...lines
					.filter((line) => line.trim())
					.map((line) => line.match(/^\s*/)![0].length),
			);
			let code = lines.map((line) => line.slice(indent)).join('\n');
			if (shot === shots.exporting) {
				const excerpt = ts.createSourceFile(
					sourcePath,
					code,
					ts.ScriptTarget.Latest,
					true,
				);
				const callbacks: ts.PropertyAssignment[] = [];
				const findProgress = (node: ts.Node) => {
					if (
						ts.isPropertyAssignment(node) &&
						node.name.getText(excerpt) === 'onProgress'
					) {
						callbacks.push(node);
					}
					ts.forEachChild(node, findProgress);
				};
				findProgress(excerpt);
				const callback = callbacks[0];
				if (!callback) throw new Error('Expected the render progress callback');
				code = await format(
					code.slice(0, callback.getStart(excerpt)) +
						'onProgress: ({progress}) => console.info(progress)' +
						code.slice(callback.getEnd()),
					formatOptions,
				);
				const serverPath = path.join(
					packagesRoot,
					'template-render-server/server/index.ts',
				);
				const serverSource = ts.createSourceFile(
					serverPath,
					await Bun.file(serverPath).text(),
					ts.ScriptTarget.Latest,
					true,
				);
				const bundles: ts.CallExpression[] = [];
				const findBundle = (node: ts.Node) => {
					if (
						ts.isCallExpression(node) &&
						node.expression.getText(serverSource) === 'bundle'
					) {
						bundles.push(node);
					}
					ts.forEachChild(node, findBundle);
				};
				findBundle(serverSource);
				const bundle = bundles[0];
				if (!bundle) throw new Error('Expected the render-server bundle call');
				code = await format(
					`const serveUrl = await ${bundle.getText(serverSource)};\n\n${code}`,
					formatOptions,
				);
			}
			return Response.json({
				code,
				tokens: await highlightCode(code),
				fileName:
					shot === shots.exporting ? 'render.ts' : path.basename(shot.file),
				startLine: shot === shots.exporting ? 1 : start,
			});
		}
		if (url.pathname.startsWith('/monaco/')) {
			const filePath = path.resolve(
				monacoRoot,
				url.pathname.slice('/monaco/'.length),
			);
			if (!filePath.startsWith(monacoRoot + path.sep))
				return new Response('Not found', {status: 404});
			const file = Bun.file(filePath);
			if (await file.exists()) return new Response(file);
		}
		return new Response('Not found', {status: 404});
	},
});

// eslint-disable-next-line no-console
console.log(`Three ways code shots: ${server.url}`);
