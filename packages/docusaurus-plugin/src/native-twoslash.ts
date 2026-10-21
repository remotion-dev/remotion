import {join} from 'path';
import type {
	CompilerOptionDeclaration,
	TwoslashReturn,
	TwoslashReturnMeta,
} from '@remotion/typescript-tools/twoslash';
import {
	defaultCompilerOptions,
	defaultHandbookOptions,
	findCutNotations,
	findFlagNotations,
	findQueryMarkers,
	validateCodeForErrors,
} from '@remotion/typescript-tools/twoslash';
import type {CompilerOptions} from '@remotion/typescript-tools/typescript';
import ts from '@remotion/typescript-tools/typescript';
import type {
	NodeErrorWithoutPosition,
	NodeWithoutPosition,
} from 'twoslash-protocol';
import {
	createPositionConverter,
	isInRanges,
	removeCodeRanges,
	resolveNodePositions,
} from 'twoslash-protocol';
import {createNativeTypeScriptClient} from './native-typescript-client';

/**
 * TypeScript 5 is used only to parse identifier spans and compiler flag values.
 * All diagnostics, type information and completions come from the native server.
 */
export const createNativeTwoslasher = async ({
	rootDirectory,
	compilerOptions,
}: {
	rootDirectory: string;
	compilerOptions: CompilerOptions;
}) => {
	const client = await createNativeTypeScriptClient({rootDirectory});
	const declarations = (
		ts as unknown as {optionDeclarations: CompilerOptionDeclaration[]}
	).optionDeclarations;
	let running = false;

	const twoslasher = async (
		code: string,
		extension: string,
	): Promise<TwoslashReturn> => {
		if (running) {
			throw new Error(
				'Native Twoslash snippets must be processed sequentially.',
			);
		}

		running = true;
		try {
			const aliases: Record<string, string> = {
				typescript: 'ts',
				javascript: 'js',
			};
			const language = aliases[extension] ?? extension;
			if (
				!['ts', 'tsx', 'js', 'jsx', 'mts', 'cts', 'mjs', 'cjs'].includes(
					language,
				)
			) {
				throw new Error(
					`Native Twoslash does not support ${extension} snippets.`,
				);
			}

			const meta: TwoslashReturnMeta = {
				extension: language,
				compilerOptions: {
					...defaultCompilerOptions,
					// Match the Shiki transformer's default compiler options.
					moduleResolution: ts.ModuleResolutionKind.Bundler,
					// Preserve TypeScript 5's default for bundler-handled CSS imports.
					noUncheckedSideEffectImports: false,
					...compilerOptions,
				},
				handbookOptions: {...defaultHandbookOptions, errors: []},
				removals: [],
				flagNotations: findFlagNotations(
					code,
					['annotate', 'log', 'warn', 'error'],
					declarations,
				),
				virtualFiles: [],
				positionQueries: [],
				positionCompletions: [],
				positionHighlights: [],
			};
			let nodes: NodeWithoutPosition[] = [];
			for (const flag of meta.flagNotations) {
				if (flag.type === 'compilerOptions') {
					meta.compilerOptions[flag.name] = flag.value;
				} else if (flag.type === 'handbookOptions') {
					Object.assign(meta.handbookOptions, {[flag.name]: flag.value});
				} else if (flag.type === 'tag') {
					nodes.push({
						type: 'tag',
						name: flag.name,
						start: flag.end,
						length: 0,
						text: String(flag.value),
					});
				} else {
					throw new Error(`Native Twoslash does not recognize @${flag.name}.`);
				}

				meta.removals.push([flag.start, flag.end]);
			}

			if (
				meta.handbookOptions.showEmit ||
				meta.handbookOptions.showEmittedFile
			) {
				throw new Error('Native Twoslash does not support showEmit.');
			}

			const positionConverter = createPositionConverter(code);
			findCutNotations(code, meta);
			findQueryMarkers(code, meta, positionConverter);
			const isRemoved = (position: number) =>
				position < 0 ||
				position >= code.length ||
				Boolean(isInRanges(position, meta.removals, false));

			const filenames = [...code.matchAll(/^[\t ]*\/\/\s?@filename: (.+)$/gm)];
			const defaultFilename = `index.${language}`;
			const initialFilename = filenames.some(
				(match) => match[1].trimEnd() === defaultFilename,
			)
				? '__index__.ts'
				: defaultFilename;
			const boundaries = [
				{offset: 0, filename: initialFilename},
				...filenames.map((match) => ({
					offset: match.index,
					filename: match[1].trimEnd(),
				})),
			];
			const files: Record<string, string> = {};
			const identifiers: {
				filename: string;
				start: number;
				length: number;
				target: string;
			}[] = [];
			for (const [index, boundary] of boundaries.entries()) {
				const end = boundaries[index + 1]?.offset ?? code.length;
				if (boundary.offset === end) {
					continue;
				}

				const content = code.slice(boundary.offset, end);
				const {filename} = boundary;
				if (Object.hasOwn(files, filename)) {
					throw new Error(
						`Native Twoslash received duplicate filename ${filename}.`,
					);
				}

				const fileExtension = filename.split('.').pop()!;
				const supportLsp = [
					'ts',
					'tsx',
					'js',
					'jsx',
					'mts',
					'cts',
					'mjs',
					'cjs',
				].includes(fileExtension);
				if (
					!supportLsp &&
					!(fileExtension === 'json' && meta.compilerOptions.resolveJsonModule)
				) {
					throw new Error(
						`Native Twoslash does not support virtual file ${filename}.`,
					);
				}

				files[filename] = content;
				meta.virtualFiles.push({
					offset: boundary.offset,
					filename,
					filepath: join(rootDirectory, filename),
					content,
					extension: fileExtension,
					supportLsp,
				});
				if (!supportLsp) {
					continue;
				}

				const source = ts.createSourceFile(
					filename,
					content,
					ts.ScriptTarget.Latest,
					true,
				);
				const visit = (node: ts.Node) => {
					if (ts.isIdentifier(node)) {
						const start = node.getStart(source);
						identifiers.push({
							filename,
							start: boundary.offset + start,
							length: node.end - start,
							target: content.slice(start, node.end),
						});
					}

					ts.forEachChild(node, visit);
				};

				visit(source);
			}

			// Convert the numeric options returned by Twoslash's flag parser into
			// tsconfig JSON. This does not create a TypeScript 5 program or checker.
			const nativeOptions: Record<string, unknown> = {};
			for (const [name, value] of Object.entries(meta.compilerOptions)) {
				if (value === undefined) {
					continue;
				}

				const declaration = declarations.find((option) => option.name === name);
				if (declaration?.type instanceof Map) {
					const match = [...declaration.type].find(
						([, optionValue]) => optionValue === value,
					);
					if (!match) {
						throw new Error(
							`Native Twoslash cannot convert compiler option ${name}: ${value}.`,
						);
					}

					nativeOptions[name] = match[0];
				} else if (
					declaration?.type === 'list' &&
					declaration.element?.type instanceof Map &&
					Array.isArray(value)
				) {
					const choices = [...declaration.element.type];
					nativeOptions[name] = value.map((item) => {
						const match = choices.find(
							([, optionValue]) => optionValue === item,
						);
						if (!match) {
							throw new Error(
								`Native Twoslash cannot convert compiler option ${name}: ${item}.`,
							);
						}

						return match[0];
					});
				} else {
					nativeOptions[name] = value;
				}
			}

			await client.setFiles({files, compilerOptions: nativeOptions});
			const errorNodes: NodeErrorWithoutPosition[] = [];
			if (meta.handbookOptions.noErrors !== true) {
				const ignoredErrors = Array.isArray(meta.handbookOptions.noErrors)
					? meta.handbookOptions.noErrors
					: [];
				for (const file of meta.virtualFiles) {
					if (!file.supportLsp) {
						continue;
					}

					for (const diagnostic of await client.getDiagnostics(file.filename)) {
						// LSP also returns editor hints, unlike Twoslash's syntactic and
						// semantic diagnostics. Keep noUnusedLocals errors when enabled.
						if (diagnostic.category === 2 || diagnostic.category === 3) {
							continue;
						}

						const start = file.offset + diagnostic.start;
						if (
							ignoredErrors.includes(diagnostic.code) ||
							(meta.handbookOptions.noErrorsCutted && isRemoved(start))
						) {
							continue;
						}

						errorNodes.push({
							type: 'error',
							start,
							length: diagnostic.length,
							code: diagnostic.code,
							filename: file.filename,
							id: `err-${diagnostic.code}-${start}-${diagnostic.length}`,
							text: diagnostic.text,
							level: diagnostic.category === 0 ? 'warning' : 'error',
						});
					}
				}
			}

			if (!meta.handbookOptions.noErrorValidation) {
				validateCodeForErrors(errorNodes, meta.handbookOptions, rootDirectory);
			}

			const hoverCache = new Map<string, ReturnType<typeof client.getHover>>();
			const hoverAt = (identifier: (typeof identifiers)[number]) => {
				const key = `${identifier.filename}:${identifier.start}`;
				const cached = hoverCache.get(key);
				if (cached) {
					return cached;
				}

				const file = meta.virtualFiles.find(
					(candidate) => candidate.filename === identifier.filename,
				)!;
				const hover = client.getHover(
					file.filename,
					identifier.start - file.offset,
				);
				hoverCache.set(key, hover);
				return hover;
			};

			if (!meta.handbookOptions.noStaticSemanticInfo) {
				// Sequential queries reuse the native server's checker for this file.
				for (const identifier of identifiers) {
					if (isRemoved(identifier.start)) {
						continue;
					}

					const hover = await hoverAt(identifier);
					if (hover) {
						nodes.push({
							type: 'hover',
							start: identifier.start,
							length: identifier.length,
							target: identifier.target,
							text: hover.text,
							...(hover.docs ? {docs: hover.docs} : {}),
						});
					}
				}
			}

			for (const position of meta.positionQueries) {
				const identifier = identifiers.find(
					(candidate) =>
						position >= candidate.start &&
						position <= candidate.start + candidate.length,
				);
				if (isRemoved(position) || !identifier) {
					throw new Error(
						`Native Twoslash query at offset ${position} does not point to a visible identifier.`,
					);
				}

				const hover = await hoverAt(identifier);
				if (!hover) {
					throw new Error(
						`Native TypeScript returned no quick info for ${identifier.target} at offset ${position}.`,
					);
				}

				nodes.push({
					type: 'query',
					start: identifier.start,
					length: identifier.length,
					target: identifier.target,
					text: hover.text,
					...(hover.docs ? {docs: hover.docs} : {}),
				});
			}

			for (const position of meta.positionCompletions) {
				const file = meta.virtualFiles.find(
					(candidate) =>
						position >= candidate.offset &&
						position <= candidate.offset + candidate.content.length,
				);
				if (isRemoved(position) || !file?.supportLsp) {
					throw new Error(
						`Native Twoslash completion at offset ${position} does not point to visible source.`,
					);
				}

				const prefix = code.slice(0, position).match(/[$\w]+$/)?.[0] ?? '';
				const completions = (
					await client.getCompletions(file.filename, position - file.offset)
				).filter((completion) => !prefix || completion.name.startsWith(prefix));
				if (!completions.length && !meta.handbookOptions.noErrorValidation) {
					throw new Error(
						`Native TypeScript returned no completions at offset ${position}.`,
					);
				}

				nodes.push({
					type: 'completion',
					start: position,
					length: 0,
					completions,
					completionsPrefix: prefix,
				});
			}

			for (const [start, end, text] of meta.positionHighlights) {
				nodes.push({type: 'highlight', start, length: end - start, text});
			}

			nodes.push(...errorNodes);
			let outputCode = code;
			if (!meta.handbookOptions.keepNotations) {
				const removed = removeCodeRanges(code, meta.removals, nodes);
				outputCode = removed.code;
				nodes = removed.nodes;
				meta.removals = removed.removals;
			}

			const result: TwoslashReturn = {
				code: outputCode,
				nodes: resolveNodePositions(nodes, outputCode),
				meta,
				get queries() {
					return this.nodes.filter((node) => node.type === 'query');
				},
				get completions() {
					return this.nodes.filter((node) => node.type === 'completion');
				},
				get errors() {
					return this.nodes.filter((node) => node.type === 'error');
				},
				get highlights() {
					return this.nodes.filter((node) => node.type === 'highlight');
				},
				get hovers() {
					return this.nodes.filter((node) => node.type === 'hover');
				},
				get tags() {
					return this.nodes.filter((node) => node.type === 'tag');
				},
			};
			return result;
		} finally {
			running = false;
		}
	};

	return Object.assign(twoslasher, {
		dispose: client.dispose,
		nativeProcessId: client.pid,
	});
};
