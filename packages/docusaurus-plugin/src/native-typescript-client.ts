import {spawn} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, isAbsolute, join, relative, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {API} from 'typescript/async';

type Position = {line: number; character: number};
type Range = {start: Position; end: Position};
type Diagnostic = {
	range: Range;
	code: number | string;
	message: string;
	severity: number | undefined;
};

type Hover = {
	contents: {kind: string; value: string};
	range: Range | undefined;
};

type Completion = {
	label: string;
	kind: number | undefined;
	sortText: string | undefined;
	insertText: string | undefined;
	textEdit: {range: Range; newText: string} | undefined;
};

export type NativeDiagnostic = {
	start: number;
	length: number;
	code: number;
	text: string;
	category: number;
};

export type NativeCompletion = {
	name: string;
	kind: string;
	sortText: string;
	insertText: string | null;
	replacementSpan: {start: number; length: number} | null;
};

export const createNativeTypeScriptClient = async ({
	rootDirectory,
}: {
	rootDirectory: string;
}) => {
	const requireFromDocs = createRequire(join(rootDirectory, 'package.json'));
	const requireFromNative = createRequire(
		requireFromDocs.resolve('typescript/package.json'),
	);
	const platformPackage = requireFromNative.resolve(
		`@typescript/typescript-${process.platform}-${process.arch}/package.json`,
	);
	const executable = join(
		dirname(platformPackage),
		'lib',
		process.platform === 'win32' ? 'tsc.exe' : 'tsc',
	);
	// Keep sources outside node_modules: native TypeScript treats dependencies as immutable.
	const cacheDirectory = join(
		rootDirectory,
		'.cache',
		'remotion-native-twoslash',
	);
	mkdirSync(cacheDirectory, {recursive: true});
	const projectDirectory = mkdtempSync(join(cacheDirectory, 'worker-'));
	// Keep the configured project alive while replacing all files in a snippet.
	const anchorFilename = '__remotion_twoslash_anchor__.ts';
	writeFileSync(join(projectDirectory, anchorFilename), 'export {};');
	let anchorOpened = false;
	const child = spawn(executable, ['--lsp', '--stdio'], {
		cwd: projectDirectory,
		stdio: ['pipe', 'pipe', 'pipe'],
	});
	let buffer = Buffer.alloc(0);
	let sequence = 0;
	let version = 0;
	let stderr = '';
	let failure: Error | null = null;
	let disposed = false;
	let api: API<true> | null = null;
	let previousConfig: string | null = null;
	const files = new Map<string, {content: string; lineStarts: number[]}>();
	const pending = new Map<
		number,
		{
			resolve: (result: unknown) => void;
			reject: (error: Error) => void;
			timeout: ReturnType<typeof setTimeout>;
		}
	>();
	const cleanup = () => {
		child.kill();
		rmSync(projectDirectory, {recursive: true, force: true});
	};

	const onInterrupt = () => {
		cleanup();
		process.exit(130);
	};

	const onTerminate = () => {
		cleanup();
		process.exit(143);
	};

	process.once('exit', cleanup);
	process.once('SIGTERM', onTerminate);
	process.once('SIGINT', onInterrupt);

	const fail = (error: Error) => {
		failure = error;
		for (const waiting of pending.values()) {
			clearTimeout(waiting.timeout);
			waiting.reject(error);
		}

		pending.clear();
	};

	const waitForAPI = <T>(operation: Promise<T>, name: string): Promise<T> => {
		return new Promise((resolveOperation, reject) => {
			const timeout = setTimeout(() => {
				const error = new Error(
					`Native TypeScript API request timed out: ${name}`,
				);
				reject(error);
				fail(error);
				cleanup();
			}, 60_000);
			operation.then(
				(result) => {
					clearTimeout(timeout);
					resolveOperation(result);
				},
				(error) => {
					clearTimeout(timeout);
					reject(error);
				},
			);
		});
	};

	const send = (message: Record<string, unknown>) => {
		if (failure) throw failure;
		const data = JSON.stringify({jsonrpc: '2.0', ...message});
		child.stdin.write(
			`Content-Length: ${Buffer.byteLength(data)}\r\n\r\n${data}`,
		);
	};

	const request = <T>(method: string, params: unknown): Promise<T> => {
		return new Promise((resolveRequest, reject) => {
			if (failure) {
				reject(failure);
				return;
			}

			const id = ++sequence;
			const timeout = setTimeout(() => {
				fail(new Error(`Native TypeScript request timed out: ${method}`));
				cleanup();
			}, 60_000);
			pending.set(id, {
				resolve: (result) => resolveRequest(result as T),
				reject,
				timeout,
			});
			send({id, method, params});
		});
	};

	const notify = (method: string, params: unknown) => send({method, params});

	child.stderr.on('data', (chunk: Buffer) => {
		stderr = (stderr + chunk.toString()).slice(-4000);
	});
	child.once('error', (error) => fail(error));
	child.stdin.on('error', (error) => fail(error));
	child.once('exit', (code, signal) => {
		if (!disposed || pending.size > 0) {
			fail(
				new Error(
					`Native TypeScript exited (${signal ?? code}): ${stderr.trim()}`,
				),
			);
		}
	});
	child.stdout.on('data', (chunk: Buffer) => {
		buffer = Buffer.concat([new Uint8Array(buffer), new Uint8Array(chunk)]);
		try {
			while (true) {
				const headerEnd = buffer.indexOf('\r\n\r\n');
				if (headerEnd === -1) return;
				const header = buffer.subarray(0, headerEnd).toString();
				const lengthHeader = /Content-Length:\s*(\d+)/i.exec(header);
				if (!lengthHeader)
					throw new Error('Invalid native TypeScript response');
				const length = Number(lengthHeader[1]);
				if (buffer.length < headerEnd + 4 + length) return;
				const message = JSON.parse(
					buffer.subarray(headerEnd + 4, headerEnd + 4 + length).toString(),
				) as {
					id: number | string | undefined;
					method: string | undefined;
					result: unknown;
					error: {message: string} | undefined;
				};
				buffer = buffer.subarray(headerEnd + 4 + length);
				if (message.method) {
					// No client-side watchers or configuration provider are needed.
					if (message.id !== undefined) send({id: message.id, result: null});
					continue;
				}

				const waiting = pending.get(message.id as number);
				if (!waiting) continue;
				pending.delete(message.id as number);
				clearTimeout(waiting.timeout);
				if (message.error) waiting.reject(new Error(message.error.message));
				else waiting.resolve(message.result);
			}
		} catch (error) {
			fail(error instanceof Error ? error : new Error(String(error)));
			cleanup();
		}
	});

	const getFile = (filename: string) => {
		const path = resolve(projectDirectory, filename);
		const fromProject = relative(projectDirectory, path);
		if (isAbsolute(fromProject) || fromProject.startsWith('..')) {
			throw new Error(`Twoslash filename escapes its project: ${filename}`);
		}

		return {path, uri: pathToFileURL(path).href};
	};

	const toOffset = (filename: string, position: Position) => {
		const file = files.get(filename);
		if (!file) throw new Error(`Unknown Twoslash file: ${filename}`);
		return (
			(file.lineStarts[position.line] ?? file.content.length) +
			position.character
		);
	};

	const toPosition = (filename: string, offset: number): Position => {
		const file = files.get(filename);
		if (!file) throw new Error(`Unknown Twoslash file: ${filename}`);
		let line = file.lineStarts.length - 1;
		while (line > 0 && file.lineStarts[line] > offset) line--;
		return {line, character: offset - file.lineStarts[line]};
	};

	const dispose = async () => {
		if (disposed) return;
		disposed = true;
		const forceCleanup = setTimeout(cleanup, 1000);
		try {
			if (api) await waitForAPI(api.close(), 'close');
			if (!failure && child.exitCode === null) {
				await request('shutdown', undefined);
				notify('exit', undefined);
			}
		} finally {
			clearTimeout(forceCleanup);
			cleanup();
			process.removeListener('exit', cleanup);
			process.removeListener('SIGTERM', onTerminate);
			process.removeListener('SIGINT', onInterrupt);
		}
	};

	try {
		await request('initialize', {
			processId: process.pid,
			rootUri: pathToFileURL(projectDirectory).href,
			workspaceFolders: [
				{uri: pathToFileURL(projectDirectory).href, name: 'twoslash'},
			],
			capabilities: {
				textDocument: {hover: {contentFormat: ['markdown']}, diagnostic: {}},
				workspace: {
					configuration: false,
					didChangeWatchedFiles: {dynamicRegistration: true},
				},
			},
			initializationOptions: {
				disablePushDiagnostics: true,
				logVerbosity: 0,
				// Twoslash asks only about the current snippet, so skip editor-wide import indexing.
				userPreferences: {
					includeCompletionsForModuleExports: false,
					includeCompletionsForImportStatements: false,
					automaticTypeAcquisitionEnabled: false,
				},
			},
		});
		notify('initialized', {});
		const session = await request<{pipe: string}>(
			'custom/initializeAPISession',
			{},
		);
		api = await waitForAPI(
			API.fromLSPConnection({pipe: session.pipe}),
			'connect',
		);
	} catch (error) {
		await dispose();
		throw error;
	}

	return {
		pid: child.pid ?? null,
		async setFiles({
			files: nextFiles,
			compilerOptions,
		}: {
			files: Record<string, string>;
			compilerOptions: Record<string, unknown>;
		}) {
			if (anchorFilename in nextFiles || 'tsconfig.json' in nextFiles) {
				throw new Error(
					'Twoslash snippet filenames cannot replace the native project configuration',
				);
			}

			const config = {compilerOptions, include: ['**/*'], exclude: []};
			const configText = JSON.stringify(config);
			const configChanged = previousConfig !== configText;
			if (configChanged) {
				const parsed = await waitForAPI(
					api!.parseJsonConfigFileContent(
						{...config, files: [anchorFilename, ...Object.keys(nextFiles)]},
						{
							configDirectory: projectDirectory,
						},
					),
					'parseJsonConfigFileContent',
				);
				if (parsed.errors.length) {
					throw new Error(
						parsed.errors
							.map((error) => `TS${error.code}: ${error.text}`)
							.join('\n'),
					);
				}

				writeFileSync(join(projectDirectory, 'tsconfig.json'), configText);
			}

			const changes: {uri: string; type: number}[] = [];
			const openedFiles = new Set(files.keys());
			const updatedFiles = new Set<string>();
			if (configChanged)
				changes.push({uri: getFile('tsconfig.json').uri, type: 2});
			for (const filename of files.keys()) {
				if (filename in nextFiles) continue;
				const file = getFile(filename);
				notify('textDocument/didClose', {textDocument: {uri: file.uri}});
				rmSync(file.path, {force: true});
				changes.push({uri: file.uri, type: 3});
				files.delete(filename);
			}

			for (const [filename, content] of Object.entries(nextFiles)) {
				const file = getFile(filename);
				const existing = files.get(filename);
				const lineStarts = [0];
				for (let index = 0; index < content.length; index++) {
					if (content[index] === '\n') lineStarts.push(index + 1);
				}

				files.set(filename, {content, lineStarts});
				if (existing?.content === content) continue;
				updatedFiles.add(filename);
				mkdirSync(dirname(file.path), {recursive: true});
				writeFileSync(file.path, content);
				changes.push({uri: file.uri, type: existing ? 2 : 1});
			}

			notify('workspace/didChangeWatchedFiles', {changes});
			version++;
			if (configChanged) {
				const {uri} = getFile('tsconfig.json');
				if (previousConfig === null) {
					notify('textDocument/didOpen', {
						textDocument: {uri, languageId: 'json', version, text: configText},
					});
				} else {
					notify('textDocument/didChange', {
						textDocument: {uri, version},
						contentChanges: [{text: configText}],
					});
				}
			}

			if (!anchorOpened) {
				notify('textDocument/didOpen', {
					textDocument: {
						uri: getFile(anchorFilename).uri,
						languageId: 'typescript',
						version,
						text: 'export {};',
					},
				});
				anchorOpened = true;
			}

			// Update the filesystem before opening files so multi-file imports resolve together.
			for (const [filename, content] of Object.entries(nextFiles)) {
				if (!updatedFiles.has(filename)) continue;
				const {uri} = getFile(filename);
				if (openedFiles.has(filename)) {
					notify('textDocument/didChange', {
						textDocument: {uri, version},
						contentChanges: [{text: content}],
					});
				} else {
					notify('textDocument/didOpen', {
						textDocument: {
							uri,
							languageId: /\.tsx$/.test(filename)
								? 'typescriptreact'
								: /\.jsx$/.test(filename)
									? 'javascriptreact'
									: /\.js$/.test(filename)
										? 'javascript'
										: 'typescript',
							version,
							text: content,
						},
					});
				}
			}

			if (Object.keys(nextFiles).length) {
				const firstFile = getFile(anchorFilename);
				await request('textDocument/diagnostic', {
					textDocument: {uri: firstFile.uri},
				});
				const snapshot = await waitForAPI(
					api!.getCurrentLanguageServerSnapshot({
						openProjects: [getFile('tsconfig.json').path],
						ensurePrograms: true,
					}),
					'getCurrentLanguageServerSnapshot',
				);
				try {
					const project = await waitForAPI(
						snapshot.getDefaultProjectForFile(firstFile.path),
						'getDefaultProjectForFile',
					);
					if (
						!project ||
						project.configFileName !== getFile('tsconfig.json').path
					) {
						throw new Error(
							'Native TypeScript did not load the Twoslash project configuration',
						);
					}

					const diagnostics = await waitForAPI(
						project.program.getProgramDiagnostics(),
						'getProgramDiagnostics',
					);
					if (diagnostics?.length)
						throw new Error(
							diagnostics
								.map((error) => `TS${error.code}: ${error.text}`)
								.join('\n'),
						);
				} finally {
					await waitForAPI(snapshot.dispose(), 'disposeSnapshot');
				}
			}

			previousConfig = configText;
		},
		async getDiagnostics(filename: string): Promise<NativeDiagnostic[]> {
			const result = await request<{items: Diagnostic[]}>(
				'textDocument/diagnostic',
				{textDocument: {uri: getFile(filename).uri}},
			);
			return result.items.map((diagnostic) => {
				const start = toOffset(filename, diagnostic.range.start);
				return {
					start,
					length: toOffset(filename, diagnostic.range.end) - start,
					code: Number(diagnostic.code),
					text: diagnostic.message,
					category:
						diagnostic.severity === 2
							? 0
							: diagnostic.severity === 3
								? 3
								: diagnostic.severity === 4
									? 2
									: 1,
				};
			});
		},
		async getHover(filename: string, position: number) {
			const hover = await request<Hover | null>('textDocument/hover', {
				textDocument: {uri: getFile(filename).uri},
				position: toPosition(filename, position),
			});
			if (!hover) return null;
			const markdown = hover.contents.value;
			const match =
				/^```(?:typescript|tsx|javascript|js)?\r?\n([\s\S]*?)\r?\n```(?:\r?\n)?/.exec(
					markdown,
				);
			if (!match)
				throw new Error('Unexpected native TypeScript hover response');
			const start = hover.range
				? toOffset(filename, hover.range.start)
				: position;
			return {
				text: match[1],
				docs: markdown.slice(match[0].length).trim() || null,
				start,
				length: hover.range ? toOffset(filename, hover.range.end) - start : 0,
			};
		},
		async getCompletions(
			filename: string,
			position: number,
		): Promise<NativeCompletion[]> {
			const result = await request<{items: Completion[]} | Completion[] | null>(
				'textDocument/completion',
				{
					textDocument: {uri: getFile(filename).uri},
					position: toPosition(filename, position),
					context: {triggerKind: 1},
				},
			);
			const entries = Array.isArray(result) ? result : (result?.items ?? []);
			return entries.map((entry) => {
				const start = entry.textEdit
					? toOffset(filename, entry.textEdit.range.start)
					: 0;
				return {
					name: entry.label,
					kind:
						(
							{
								2: 'method',
								3: 'function',
								4: 'constructor',
								5: 'property',
								6: 'var',
								7: 'class',
								8: 'interface',
								9: 'module',
								10: 'property',
								12: 'value',
								13: 'enum',
								14: 'keyword',
								17: 'file',
								21: 'const',
								22: 'struct',
								25: 'type parameter',
							} as Record<number, string>
						)[entry.kind ?? 0] ?? 'unknown',
					sortText: entry.sortText ?? entry.label,
					insertText: entry.textEdit?.newText ?? entry.insertText ?? null,
					replacementSpan: entry.textEdit
						? {
								start,
								length: toOffset(filename, entry.textEdit.range.end) - start,
							}
						: null,
				};
			});
		},
		dispose,
	};
};
