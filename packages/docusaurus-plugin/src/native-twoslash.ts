import path from 'node:path';
/**
 * Adapted from Fumadocs' Twoslash implementation at
 * https://github.com/fuma-nama/fumadocs/tree/af5928ef0573e52a627f01473f4fdad6b3a4730a/packages/twoslash/src
 *
 * MIT License
 * Copyright (c) 2023 Fuma
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import type {TwoslashGenericResult} from 'twoslash-protocol';
import {
	NodeFlags,
	SyntaxKind,
	type CallExpression,
	type Expression,
	type Node,
	type NodeArray,
	type PropertyAccessExpression,
	type SourceFile,
} from 'typescript/ast';
import {createFileSystemLayer} from 'typescript/fs';
import {
	API,
	CompletionItemKind,
	NodeBuilderFlags,
	SignatureKind,
	SymbolFlags,
	TypeFlags,
	TypeFormatFlags,
	type Checker,
	type CompilerOptions,
	type Diagnostic,
	type Printer,
	type Project,
	type Signature,
	type Snapshot,
	type Symbol,
	type SyntheticProjectId,
	type Type,
} from 'typescript/sync';
import {
	createPositionConverter,
	defaultHandbookOptions,
	findCutNotations,
	findFlagNotations,
	findQueryMarkers,
	isInRange,
	isInRanges,
	removeCodeRanges,
	resolveNodePositions,
	splitFiles,
	TwoslashError,
	validateCodeForErrors,
	type CompletionEntry,
	type NodeError,
	type NodeHover,
	type NodeWithoutPosition,
	type Notations,
	type PositionConverter,
	type VirtualFile,
} from './native-twoslash-notations';
import {getTwoslashCompilerOptions} from './twoslash-cache';

export type NativeTwoslashReturn = Pick<
	TwoslashGenericResult,
	'code' | 'nodes'
>;

export interface NativeTwoslasher {
	(code: string, extension: string): NativeTwoslashReturn;
	dispose: () => void;
}

const supportedExtensions = ['ts', 'tsx', 'js', 'jsx'];
/** also used as node builder flags, which share the values */
const typeFlags =
	TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
	TypeFormatFlags.MultilineObjectLiterals;
/** longer types are truncated by the checker */
const maxTypeLength = 500;

const completionKinds: Partial<Record<CompletionItemKind, string>> = {
	[CompletionItemKind.Method]: 'method',
	[CompletionItemKind.Function]: 'function',
	[CompletionItemKind.Constructor]: 'constructor',
	[CompletionItemKind.Field]: 'property',
	[CompletionItemKind.Property]: 'property',
	[CompletionItemKind.Class]: 'class',
	[CompletionItemKind.Interface]: 'interface',
	[CompletionItemKind.Module]: 'module',
	[CompletionItemKind.Constant]: 'string',
};

interface Identifier {
	node: Node;
	/** position in the file */
	pos: number;
	text: string;
}

function getIdentifiers(sourceFile: SourceFile): Identifier[] {
	const out: Identifier[] = [];
	function walk(node: Node) {
		node.forEachChild((child) => {
			// missing identifiers are parsed as empty ones
			if (child.kind === SyntaxKind.Identifier && child.end > child.pos) {
				const pos = child.getStart();
				out.push({
					node: child,
					pos,
					text: sourceFile.text.slice(pos, child.end),
				});
			}

			walk(child);
		});
	}

	walk(sourceFile);
	return out;
}

function flattenDiagnostic(diagnostic: Diagnostic, indent: number): string {
	let text = '  '.repeat(indent) + diagnostic.text;
	for (const chain of diagnostic.messageChain ?? []) {
		text += `\n${flattenDiagnostic(chain, indent + 1)}`;
	}

	return text;
}

function qualifiedName(symbol: Symbol): string {
	const parent = symbol.getParent();
	const optional = symbol.flags & SymbolFlags.Optional ? '?' : '';
	// skip synthetic parents such as `__object` and `__type`
	if (!parent || parent.name.startsWith('__')) return symbol.name + optional;
	return `${parent.name}.${symbol.name}${optional}`;
}

function variableKeyword(symbol: Symbol): string {
	// binding elements in destructuring are nested in the parameter or variable declaration
	let declaration: Node | undefined = symbol.valueDeclaration?.resolve();
	while (
		declaration &&
		declaration.kind !== SyntaxKind.Parameter &&
		declaration.kind !== SyntaxKind.VariableDeclaration
	) {
		declaration = declaration.parent;
	}

	if (!declaration) return 'var';
	if (declaration.kind === SyntaxKind.Parameter) return '(parameter)';
	const {flags} = declaration.parent;
	if (flags & NodeFlags.Const) return 'const';
	if (flags & NodeFlags.Let) return 'let';
	if (flags & NodeFlags.Using) return 'using';
	return 'var';
}

/**
 * The call expression the identifier is invoking, if any
 */
function getCall(node: Node): CallExpression | undefined {
	let callee = node;
	const parent = node.parent as PropertyAccessExpression;
	if (
		parent.kind === SyntaxKind.PropertyAccessExpression &&
		parent.name === node
	)
		callee = parent;
	const call = callee.parent as CallExpression;
	const isCall =
		call.kind === SyntaxKind.CallExpression ||
		call.kind === SyntaxKind.NewExpression;
	return isCall && call.expression === callee ? call : undefined;
}

/**
 * The object literal the identifier is a key of, if any
 */
function getObjectLiteral(node: Node): Expression | undefined {
	const {parent} = node;
	const isKey =
		'name' in parent &&
		parent.name === node &&
		(parent.parent.kind === SyntaxKind.ObjectLiteralExpression ||
			parent.parent.kind === SyntaxKind.JsxAttributes);
	return isKey ? (parent.parent as Expression) : undefined;
}

function printType({
	checker,
	printer,
	type,
	location,
	flags,
}: {
	checker: Checker;
	printer: Printer;
	type: Type;
	location: Node | null;
	flags: number;
}): string {
	const text = checker.typeToString(
		type,
		location ?? undefined,
		flags | TypeFormatFlags.NoTruncation,
	);
	if (text.length <= maxTypeLength) return text;
	// `typeToString` cuts truncated types at 320 characters
	const node = checker.typeToTypeNode(
		type,
		location ?? undefined,
		flags | NodeBuilderFlags.IgnoreErrors,
	);
	return node ? printer.printNode(node) : text;
}

function printSignature(
	checker: Checker,
	printer: Printer,
	signature: Signature,
	location: Node,
): string | undefined {
	const print = (flags: number) => {
		const node = checker.signatureToSignatureDeclaration(
			signature,
			SyntaxKind.MethodSignature,
			location,
			flags | NodeBuilderFlags.IgnoreErrors,
		);
		return node && printer.printNode(node);
	};

	const text = print(typeFlags | NodeBuilderFlags.NoTruncation);
	return text && text.length > maxTypeLength ? print(typeFlags) : text;
}

/**
 * Approximate the display string of quick info, the TypeScript API doesn't provide it.
 */
function describeSymbol({
	checker,
	printer,
	symbol,
	type,
	identifier,
	call,
	typeToString,
}: {
	checker: Checker;
	printer: Printer;
	symbol: Symbol;
	type: Type;
	identifier: Identifier;
	call: CallExpression | null;
	typeToString: (type: Type) => string;
}): string {
	const {flags} = symbol;
	const {node} = identifier;
	const name = symbol.name === 'default' ? identifier.text : symbol.name;

	if (flags & SymbolFlags.Variable)
		return `${variableKeyword(symbol)} ${name}: ${typeToString(type)}`;

	if (flags & (SymbolFlags.Function | SymbolFlags.Method)) {
		const signatures = checker.getSignaturesOfType(type, SignatureKind.Call);
		const resolved = call && checker.getResolvedSignature(call);
		const signature =
			resolved && !checker.isUnknownSignature(resolved)
				? resolved
				: signatures[0];
		const printed =
			signature && printSignature(checker, printer, signature, node);

		if (printed) {
			const signatureHead =
				flags & SymbolFlags.Method
					? `(method) ${qualifiedName(symbol)}`
					: `function ${name}`;
			const overloads = signatures.length - 1;
			let text = signatureHead + printed.replace(/;$/, '');
			if (overloads > 0)
				text += ` (+${overloads} overload${overloads > 1 ? 's' : ''})`;
			return text;
		}
	}

	if (flags & SymbolFlags.Enum) return `enum ${name}`;
	if (flags & SymbolFlags.Module) {
		// file modules are only displayed by their import
		if (symbol.declarations[0]?.kind === SyntaxKind.SourceFile) return '';
		return `${name.startsWith('"') ? 'module' : 'namespace'} ${name}`;
	}

	if (
		flags &
		(SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.TypeAlias)
	) {
		const declaration = symbol.declarations[0]?.resolve() as
			| (Node & {
					typeParameters: NodeArray<Node> | undefined;
			  })
			| undefined;
		let text = name;
		if (declaration?.typeParameters?.length) {
			text += `<${declaration.typeParameters.map((param) => printer.printNode(param)).join(', ')}>`;
		}

		if (flags & SymbolFlags.Class) return `class ${text}`;
		if (flags & SymbolFlags.Interface) return `interface ${text}`;
		const declared = checker.getDeclaredTypeOfSymbol(symbol);
		return `type ${text} = ${printType({checker, printer, type: declared, location: node, flags: typeFlags | TypeFormatFlags.InTypeAlias})}`;
	}

	if (flags & SymbolFlags.TypeParameter) return `(type parameter) ${name}`;

	let head: string;
	if (flags & (SymbolFlags.Property | SymbolFlags.Accessor))
		head = `(property) ${qualifiedName(symbol)}`;
	else if (flags & SymbolFlags.EnumMember) {
		head = `(enum member) ${qualifiedName(symbol)}`;
		if (type.isLiteralType()) return `${head} = ${JSON.stringify(type.value)}`;
	} else head = name;

	return `${head}: ${typeToString(type)}`;
}

/** a set of compiler options, and the program of blocks using it */
interface Config {
	options: CompilerOptions;
	errors: Diagnostic[];
	id: SyntheticProjectId | null;
}

interface Block {
	code: string;
	config: Config;
	notations: Notations;
	/** files of the code block supported by the compiler */
	files: VirtualFile[];
	pc: PositionConverter;
}

function analyze(
	block: Block,
	project: Project,
	printer: Printer,
	dir: string,
): NativeTwoslashReturn {
	const {code, notations, pc} = block;
	const {handbookOptions, removals} = notations;
	let nodes: NodeWithoutPosition[] = [...notations.tags];
	const isInRemoval = (index: number) =>
		index >= code.length || index < 0 || isInRanges(index, removals, false);

	const {checker, program, languageService} = project;

	const identifiersMap = new Map<VirtualFile, Identifier[]>();
	function getIdentifiersOfFile(file: VirtualFile): Identifier[] {
		let identifiers = identifiersMap.get(file);
		if (!identifiers) {
			const sourceFile = program.getSourceFile(dir + file.filename);
			identifiers = sourceFile ? getIdentifiers(sourceFile) : [];
			identifiersMap.set(file, identifiers);
		}

		return identifiers;
	}

	function getFileAtPosition(pos: number): VirtualFile | undefined {
		return block.files.find((i) =>
			isInRange(pos, [i.offset, i.offset + i.content.length], true),
		);
	}

	/** position in the file -> position in the code block */
	function toCode(file: VirtualFile, position: number): number {
		return position + file.offset;
	}

	/** position in the code block -> position in the file */
	function toFile(file: VirtualFile, position: number): number {
		return position - file.offset;
	}

	const typeStrings = new Map<number, string>();
	function typeToString(type: Type): string {
		let text = typeStrings.get(type.id);
		if (text === undefined) {
			text = printType({
				checker,
				printer,
				type,
				location: null,
				flags: typeFlags,
			});
			typeStrings.set(type.id, text);
		}

		return text;
	}

	const described = new Map<string, string>();
	const symbolDocs = new Map<number, Pick<NodeHover, 'docs' | 'tags'>>();
	function getHover(
		file: VirtualFile,
		identifier: Identifier,
		symbol: Symbol,
		type: Type,
	): NodeWithoutPosition<NodeHover> {
		const {node} = identifier;
		let target = symbol;
		if (symbol.flags & SymbolFlags.Alias) {
			target = checker.getAliasedSymbol(symbol);
		} else {
			// keys of object literals should display the property of contextual type, it contains the docs
			const literal = getObjectLiteral(node);
			let contextual = literal && checker.getContextualType(literal);
			if (contextual) contextual = checker.getNonNullableType(contextual);
			const property =
				contextual && checker.getPropertyOfType(contextual, symbol.name);
			// for unions, only properties shared by all members are meaningful
			if (
				contextual &&
				property &&
				(!contextual.isUnionType() || property.declarations.length === 1)
			) {
				target = property;
				type = checker.getTypeOfSymbol(property);
			}
		}

		const call = getCall(node);
		// a call displays its own resolved signature, so each call site gets its own entry
		const key = `${target.id}:${type.id}:${call ? call.pos : -1}`;
		let text = described.get(key);
		if (text === undefined) {
			text = describeSymbol({
				checker,
				printer,
				symbol: target,
				type,
				identifier,
				call: call ?? null,
				typeToString,
			});
			described.set(key, text);
		}

		if (symbol.flags & SymbolFlags.Alias) {
			// call sites display the resolved signature without keyword
			if (call) text = text.replace(/^function /, '');
			text = text
				? `(alias) ${text}\nimport ${symbol.name}`
				: `import ${symbol.name}`;
		}

		let docs = symbolDocs.get(target.id);
		if (!docs) {
			const tags = checker.getJsDocTagsOfSymbol(target);
			docs = {
				docs: checker.getDocumentationCommentOfSymbol(target) || undefined,
				tags:
					tags.length > 0 ? tags.map((tag) => [tag.name, tag.text]) : undefined,
			};
			symbolDocs.set(target.id, docs);
		}

		const {text: name} = identifier;
		const start = toCode(file, identifier.pos);
		return {
			type: 'hover',
			text,
			...docs,
			start,
			length: name.length,
			target: name,
		};
	}

	/**
	 * Resolve symbols & types of identifiers in one batch
	 */
	function getHovers(file: VirtualFile, identifiers: Identifier[]) {
		const positions: number[] = [];
		const identifierNodes: Node[] = [];
		for (const identifier of identifiers) {
			positions.push(identifier.pos);
			identifierNodes.push(identifier.node);
		}

		const symbols = checker.getSymbolAtPosition(dir + file.filename, positions);
		const types = checker.getTypeAtLocation(identifierNodes);
		const out: NodeWithoutPosition<NodeHover>[] = [];
		for (let i = 0; i < identifiers.length; i++) {
			const symbol = symbols[i];
			if (!symbol) continue;
			const identifier = identifiers[i];
			const {parent} = identifier.node;
			const isIntrinsicJsxTag =
				Boolean(symbol.flags & SymbolFlags.Property) &&
				Boolean(types[i].flags & TypeFlags.Any) &&
				(parent.kind === SyntaxKind.JsxOpeningElement ||
					parent.kind === SyntaxKind.JsxClosingElement ||
					parent.kind === SyntaxKind.JsxSelfClosingElement) &&
				(parent as Node & {tagName: Node}).tagName === identifier.node;
			// JSX intrinsic tag nodes have type any; their symbols carry the props type.
			// Keep location-sensitive types for all other identifiers.
			const type = isIntrinsicJsxTag
				? checker.getTypeOfSymbol(symbol)
				: types[i];
			out.push(getHover(file, identifier, symbol, type));
		}

		return out;
	}

	if (!handbookOptions.noStaticSemanticInfo) {
		for (const file of block.files) {
			const identifiers: Identifier[] = [];
			for (const identifier of getIdentifiersOfFile(file)) {
				const start = toCode(file, identifier.pos);
				if (isInRemoval(start)) continue;
				identifiers.push(identifier);
			}

			nodes.push(...getHovers(file, identifiers));
		}
	}

	for (const query of notations.queries) {
		const file = getFileAtPosition(query);
		if (isInRemoval(query) || !file) {
			throw new TwoslashError(
				'Invalid quick info query',
				`The request on line ${pc.indexToPos(query).line + 2} for quickinfo via ^? is in a removal range.`,
				'This is likely that the positioning is off.',
			);
		}

		const identifier = getIdentifiersOfFile(file).find((candidate) => {
			const start = toCode(file, candidate.pos);
			return isInRange(query, [start, start + candidate.text.length], true);
		});
		const hover = identifier ? getHovers(file, [identifier])[0] : undefined;
		if (!hover) {
			throw new TwoslashError(
				'Invalid quick info query',
				`The request on line ${pc.indexToPos(query).line + 2} in ${file.filename} for quickinfo via ^? returned nothing from the compiler.`,
				'This is likely that the positioning is off.',
			);
		}

		nodes.push({...hover, type: 'query'});
	}

	for (const [start, end, text] of notations.highlights) {
		nodes.push({type: 'highlight', start, length: end - start, text});
	}

	for (const target of notations.completions) {
		const file = getFileAtPosition(target);
		if (isInRemoval(target) || !file) {
			throw new TwoslashError(
				'Invalid completion query',
				`The request on line ${pc.indexToPos(target).line + 2} for completions via ^| is in a removal range.`,
				'This is likely that the positioning is off.',
			);
		}

		const prefix = /[$\w]+$/.exec(code.slice(0, target))?.[0] ?? '';
		const result = languageService.getCompletionsAtPosition(
			dir + file.filename,
			toFile(file, target),
		);
		const completions: CompletionEntry[] = [];
		for (const entry of result?.entries ?? []) {
			if (!entry.name.startsWith(prefix)) continue;
			completions.push({
				name: entry.name,
				kind: entry.kind && completionKinds[entry.kind],
			});
		}

		if (completions.length === 0 && !handbookOptions.noErrorValidation) {
			throw new TwoslashError(
				'Invalid completion query',
				`The request on line ${pc.indexToPos(target).line + 2} in ${file.filename} for completions via ^| returned no completions from the compiler. (prefix: ${prefix})`,
				'This is likely that the positioning is off.',
			);
		}

		nodes.push({
			type: 'completion',
			start: target,
			length: 0,
			completions,
			completionsPrefix: prefix,
		});
	}

	const errorNodes: NodeWithoutPosition<NodeError>[] = [];
	const {noErrors, noErrorsCutted} = handbookOptions;
	if (noErrors !== true) {
		const ignores = Array.isArray(noErrors) ? noErrors : [];
		function addErrors(file: VirtualFile, diagnostics: readonly Diagnostic[]) {
			for (const diagnostic of diagnostics) {
				if (ignores.includes(diagnostic.code)) continue;
				const start = toCode(file, diagnostic.pos);
				if (noErrorsCutted && isInRemoval(start)) continue;
				errorNodes.push({
					type: 'error',
					start,
					length: diagnostic.end - diagnostic.pos,
					code: diagnostic.code,
					filename: file.filename,
					text: flattenDiagnostic(diagnostic, 0),
					level: (['warning', 'error', 'suggestion', 'message'] as const)[
						diagnostic.category
					],
				});
			}
		}

		for (const file of block.files) {
			const filepath = dir + file.filename;
			addErrors(file, program.getSemanticDiagnostics(filepath));
			addErrors(file, program.getSyntacticDiagnostics(filepath));
		}
	}

	nodes.push(...errorNodes);
	if (!handbookOptions.noErrorValidation)
		validateCodeForErrors(errorNodes, handbookOptions);

	let outputCode = code;
	if (!handbookOptions.keepNotations) {
		({code: outputCode, nodes} = removeCodeRanges(code, removals, nodes));
	}

	const outputPc =
		outputCode === code ? pc : createPositionConverter(outputCode);
	return {code: outputCode, nodes: resolveNodePositions(nodes, outputPc)};
}

export function createNativeTwoslasher({
	rootDirectory,
}: {
	rootDirectory: string;
}): NativeTwoslasher {
	const cwd = path.resolve(rootDirectory);
	const root = `${path.join(cwd, '.twoslash').replaceAll('\\', '/')}/`;
	/** configs by compiler options in `tsconfig.json` form */
	const configs = new Map<string, Config>();
	/** content of the files in the last batch */
	let files = new Map<string, string>();
	let api: API | null = null;
	let snapshot: Snapshot | null = null;
	let disposed = false;

	// Reuse the same virtual paths so subsequent snippets can share compiler state.
	const directory = `${root}0/`;

	function parse(code: string, extension: string): Block {
		const customTags = ['annotate', 'log', 'warn', 'error'];
		const notations: Notations = {
			compilerOptions: getTwoslashCompilerOptions(),
			handbookOptions: {...defaultHandbookOptions},
			tags: [],
			removals: [],
			queries: [],
			completions: [],
			highlights: [],
		};
		findFlagNotations(code, customTags, notations);
		findCutNotations(code, notations.removals);
		const pc = createPositionConverter(code);
		findQueryMarkers(code, pc, notations);

		const compilerOptions = JSON.stringify(notations.compilerOptions);
		let config = configs.get(compilerOptions);
		if (!config) {
			api ??= new API({cwd});
			// `files` keeps cwd from being globbed, its emptiness is reported as error 18002
			const parsed = api.parseJsonConfigFileContent(
				{compilerOptions: notations.compilerOptions, files: []},
				{configDirectory: cwd},
			);
			config = {
				options: parsed.options,
				id: null,
				errors: parsed.errors.filter((error) => error.code !== 18002),
			};
			configs.set(compilerOptions, config);
		}

		if (
			config.errors.length > 0 &&
			!notations.handbookOptions.noErrorValidation
		) {
			throw new TwoslashError(
				'Invalid compiler options',
				config.errors.map((d) => d.text).join('\n'),
				'Check the inline compiler flags in the code block.',
			);
		}

		const virtualFiles = splitFiles(code, `index.${extension}`).filter(
			(file) =>
				supportedExtensions.includes(file.extension) ||
				(file.extension === 'json' &&
					Boolean(notations.compilerOptions.resolveJsonModule)),
		);
		for (const file of virtualFiles) {
			// it could shadow a project file, which a later batch would hide by removing it
			if (file.filename.split(/[/\\]/).includes('..')) {
				throw new TwoslashError(
					'Invalid filename',
					`${file.filename} is outside of the code block directory.`,
					null,
				);
			}
		}

		return {
			code,
			config,
			notations,
			files: virtualFiles,
			pc,
		};
	}

	function open(block: Block): Snapshot {
		const next = new Map<string, string>();
		const rootFiles: string[] = [];
		for (const file of block.files) {
			// The layer rejects two spellings of a path, like ./index.ts and index.ts.
			const filePath = path.posix.join(directory, file.filename);
			if (next.has(filePath)) {
				throw new TwoslashError(
					'Duplicate filename',
					`The snippet defines ${file.filename} more than once.`,
					null,
				);
			}

			next.set(filePath, file.content);
			rootFiles.push(filePath);
		}

		const changed: [string, string][] = [];
		for (const [file, content] of next) {
			if (files.get(file) !== content) changed.push([file, content]);
		}

		// stale files of previous blocks must not be imported
		const removedPaths: string[] = [];
		for (const file of files.keys()) {
			if (!next.has(file)) removedPaths.push(file);
		}

		const {id, options: compilerOptions} = block.config;
		snapshot ??= api!.createSnapshot({
			userPreferences: {includeCompletionsForModuleExports: false},
		});
		const updated = snapshot.update({
			fileSystem: createFileSystemLayer(changed, {removedPaths}),
			createPrograms: id === null ? [{rootFiles, compilerOptions}] : [],
			reconfigurePrograms:
				id === null ? [] : [{id, rootFiles, compilerOptions}],
		});
		block.config.id ??= updated.operation.createdPrograms[0].id;
		snapshot.dispose();
		snapshot = updated;
		files = next;
		return snapshot;
	}

	const twoslasher = (
		code: string,
		extension: string,
	): NativeTwoslashReturn => {
		if (disposed) {
			throw new Error('Native Twoslash has already been disposed.');
		}

		const language =
			extension === 'javascript'
				? 'js'
				: extension === 'typescript'
					? 'ts'
					: extension;
		const block = parse(code, language);
		const currentSnapshot = open(block);
		const project = currentSnapshot.getProject(block.config.id!)!;
		return analyze(block, project, api!.printer, directory);
	};

	return Object.assign(twoslasher, {
		dispose: () => {
			if (disposed) return;
			disposed = true;
			try {
				snapshot?.dispose();
			} finally {
				api?.close();
				snapshot = null;
				api = null;
				configs.clear();
				files.clear();
			}
		},
	});
}
