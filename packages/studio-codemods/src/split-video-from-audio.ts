import type {
	ArrowFunctionExpression,
	Expression,
	File,
	JSXAttribute,
	JSXElement,
	JSXFragment,
	Node,
	ReturnStatement,
} from '@babel/types';
import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
} from './delete-jsx-node';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {indentInsertedJsx, printInsertedJsx} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {ensureNamedImport} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
	type SourceEdit,
} from './source-edits';
import {
	getEndOfLine,
	getIndentationUnit,
	getLineIndent,
	indentContinuationLines,
} from './source-style';

const {namedTypes} = recast.types;

// Props that are valid on <Audio> and should carry over so the extracted
// audio keeps the same timing as the video it was split from.
const audioProps = [
	'src',
	'from',
	'durationInFrames',
	'trimBefore',
	'trimAfter',
	'playbackRate',
	'volume',
	'loop',
];

/*
 * Deep-clones an AST subtree while sharing `loc` objects by reference, like
 * Babel's `cloneNode`. A runtime import of `@babel/types` is avoided because
 * it reads `process.env` at module load, which breaks browser bundles.
 */
const cloneAstValue = <T>(value: T): T => {
	if (Array.isArray(value)) {
		return value.map((item) => cloneAstValue(item)) as T;
	}

	if (value !== null && typeof value === 'object') {
		const clone: Record<string, unknown> = {};
		for (const [key, item] of Object.entries(value)) {
			clone[key] = key === 'loc' ? item : cloneAstValue(item);
		}

		return clone as T;
	}

	return value;
};

const getAttributeName = (
	attribute: JSXElement['openingElement']['attributes'][number],
): string | null => {
	if (
		attribute.type !== 'JSXAttribute' ||
		attribute.name.type !== 'JSXIdentifier'
	) {
		return null;
	}

	return attribute.name.name;
};

const findImportSourceOfLocalName = (
	ast: File,
	localName: string,
): string | null => {
	for (const stmt of ast.program.body) {
		if (
			stmt.type !== 'ImportDeclaration' ||
			stmt.source.type !== 'StringLiteral' ||
			stmt.importKind === 'type'
		) {
			continue;
		}

		for (const specifier of stmt.specifiers ?? []) {
			if (
				specifier.type === 'ImportSpecifier' &&
				specifier.local?.name === localName
			) {
				return stmt.source.value;
			}
		}
	}

	return null;
};

const importsLocalNameFromOtherSource = ({
	ast,
	localName,
	sourcePath,
}: {
	ast: File;
	localName: string;
	sourcePath: string;
}): string | null => {
	for (const stmt of ast.program.body) {
		if (
			stmt.type !== 'ImportDeclaration' ||
			stmt.source.type !== 'StringLiteral' ||
			stmt.source.value === sourcePath
		) {
			continue;
		}

		for (const specifier of stmt.specifiers ?? []) {
			if (specifier.local?.name === localName) {
				return stmt.source.value;
			}
		}
	}

	return null;
};

const setBareMutedAttribute = (element: JSXElement) => {
	const {
		openingElement: {attributes},
	} = element;
	const muted: JSXAttribute = {
		type: 'JSXAttribute',
		name: {type: 'JSXIdentifier', name: 'muted'},
		value: null,
	};
	const index = attributes.findIndex(
		(attribute) => getAttributeName(attribute) === 'muted',
	);

	if (index === -1) {
		attributes.push(muted);
	} else {
		attributes[index] = muted;
	}
};

const makeFragment = (first: JSXElement, second: JSXElement): JSXFragment => ({
	type: 'JSXFragment',
	openingFragment: {type: 'JSXOpeningFragment'},
	closingFragment: {type: 'JSXClosingFragment'},
	children: [first, second],
});

const getMutedSourceEdit = ({
	element,
	input,
	prettierConfigOverride,
}: {
	element: JSXElement;
	input: string;
	prettierConfigOverride: Record<string, unknown> | null;
}): SourceEdit => {
	const existingMuted = element.openingElement.attributes.find(
		(attribute) => getAttributeName(attribute) === 'muted',
	);
	if (existingMuted) {
		if (!existingMuted.loc) {
			throw new Error('Could not locate the muted attribute');
		}

		return {
			start: recastLocToOffset(input, existingMuted.loc.start),
			end: recastLocToOffset(input, existingMuted.loc.end),
			replacement: 'muted',
		};
	}

	const {openingElement} = element;
	if (!openingElement.loc) {
		throw new Error('Could not locate the video opening element');
	}

	const openingStart = recastLocToOffset(input, openingElement.loc.start);
	const openingEnd = recastLocToOffset(input, openingElement.loc.end);
	const closingStart = openingEnd - (openingElement.selfClosing ? 2 : 1);
	const lineStart = input.lastIndexOf('\n', closingStart - 1) + 1;
	const beforeClosing = input.slice(lineStart, closingStart);

	if (lineStart > openingStart && /^[\t ]*$/.test(beforeClosing)) {
		const lastAttribute = openingElement.attributes.at(-1);
		const attributeIndent = lastAttribute?.loc
			? getLineIndent({
					input,
					offset: recastLocToOffset(input, lastAttribute.loc.start),
				})
			: `${getLineIndent({input, offset: openingStart})}${getIndentationUnit(
					input,
					prettierConfigOverride,
				)}`;

		return {
			start: lineStart,
			end: lineStart,
			replacement: `${attributeIndent}muted${getEndOfLine(input)}`,
		};
	}

	const trailingWhitespace = beforeClosing.match(/[\t ]*$/)?.[0] ?? '';
	return {
		start: closingStart - trailingWhitespace.length,
		end: closingStart - trailingWhitespace.length,
		replacement: ' muted',
	};
};

const applyEditToElementSource = ({
	edit,
	element,
	input,
}: {
	edit: SourceEdit;
	element: JSXElement;
	input: string;
}) => {
	if (!element.loc) {
		throw new Error('Could not locate the video element');
	}

	const start = recastLocToOffset(input, element.loc.start);
	const end = recastLocToOffset(input, element.loc.end);
	if (edit.start < start || edit.end > end) {
		throw new Error('Muted attribute edit is outside the video element');
	}

	const source =
		input.slice(start, edit.start) +
		edit.replacement +
		input.slice(edit.end, end);
	const originalIndent = getLineIndent({input, offset: start});
	return source
		.split(/\r?\n/)
		.map((line, index) => {
			if (index === 0) {
				return line;
			}

			return line.startsWith(originalIndent)
				? line.slice(originalIndent.length)
				: line.trimStart();
		})
		.join(getEndOfLine(input));
};

const getAudioSiblingSourceEdit = ({
	audioSource,
	element,
	input,
}: {
	audioSource: string;
	element: JSXElement;
	input: string;
}): SourceEdit => {
	if (!element.loc) {
		throw new Error('Could not locate the video element');
	}

	const start = recastLocToOffset(input, element.loc.start);
	const end = recastLocToOffset(input, element.loc.end);
	const indent = getLineIndent({input, offset: start});
	const lineEnd = input.indexOf('\n', end);
	const sourceAfterElement = input.slice(
		end,
		lineEnd === -1 ? input.length : lineEnd,
	);
	const isStandalone = sourceAfterElement.trim() === '';

	return {
		start: end,
		end,
		replacement: isStandalone
			? `${getEndOfLine(input)}${indentInsertedJsx({
					indent,
					insertion: audioSource,
				})}`
			: ` ${indentContinuationLines({
					indent,
					input,
					printed: audioSource,
				})}`,
	};
};

const getFragmentSourceEdit = ({
	audioSource,
	element,
	input,
	mutedEdit,
	prettierConfigOverride,
}: {
	audioSource: string;
	element: JSXElement;
	input: string;
	mutedEdit: SourceEdit;
	prettierConfigOverride: Record<string, unknown> | null;
}): SourceEdit => {
	if (!element.loc) {
		throw new Error('Could not locate the video element');
	}

	const start = recastLocToOffset(input, element.loc.start);
	const end = recastLocToOffset(input, element.loc.end);
	const indent = getLineIndent({input, offset: start});
	const unit = getIndentationUnit(input, prettierConfigOverride);
	const fragment = [
		'<>',
		indentInsertedJsx({
			indent: unit,
			insertion: applyEditToElementSource({edit: mutedEdit, element, input}),
		}),
		indentInsertedJsx({indent: unit, insertion: audioSource}),
		'</>',
	].join(getEndOfLine(input));

	return {
		start,
		end,
		replacement: indentContinuationLines({indent, input, printed: fragment}),
	};
};

const insertAfter = (
	parentNode: Node,
	node: JSXElement,
	sibling: JSXElement,
): boolean => {
	if (
		namedTypes.JSXElement.check(parentNode) ||
		namedTypes.JSXFragment.check(parentNode)
	) {
		const idx = parentNode.children.indexOf(node);
		if (idx !== -1) {
			parentNode.children.splice(idx + 1, 0, sibling);
			return true;
		}
	}

	if (namedTypes.ReturnStatement.check(parentNode)) {
		const parent = parentNode as ReturnStatement;
		if (parent.argument === node) {
			parent.argument = makeFragment(node, sibling) as unknown as Expression;
			return true;
		}
	}

	if (namedTypes.ArrowFunctionExpression.check(parentNode)) {
		const parent = parentNode as ArrowFunctionExpression;
		if (parent.body === node) {
			parent.body = makeFragment(
				node,
				sibling,
			) as ArrowFunctionExpression['body'];
			return true;
		}
	}

	return false;
};

export const splitVideoFromAudio = ({
	input,
	nodePath,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
	// Kept optional for compatibility with callers from before source edits
	// replaced the full-file formatting pass.
	formatFile?: (input: {
		contents: string;
		prettierConfigOverride: Record<string, unknown> | null;
	}) => Promise<{output: string; formatted: boolean}>;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	nodeLabel: string;
	logLine: number;
	nodePathRemappings: SequenceNodePathRemapping[];
}> => {
	const ast = parseAst(input);
	const capturedNodePaths = captureJsxNodePaths(ast);
	const importSnapshots = captureImportSnapshots(ast);
	const jsxPath = findJsxElementPathForDeletion(ast, nodePath);
	if (!jsxPath) {
		throw new Error(
			'Could not find a JSX element at the specified location to split audio from',
		);
	}

	const jsxElement = jsxPath.node as JSXElement;
	const nodeLabel = getJsxElementTagLabel(jsxElement);

	if (jsxElement.openingElement.name.type !== 'JSXIdentifier') {
		throw new Error(`Cannot split audio from <${nodeLabel}>`);
	}

	const tagName = jsxElement.openingElement.name.name;
	const importSource = findImportSourceOfLocalName(ast, tagName);
	if (!importSource) {
		throw new Error(`Could not find the import of <${tagName}>`);
	}

	const hasSrc = jsxElement.openingElement.attributes.some(
		(attribute) => getAttributeName(attribute) === 'src',
	);
	if (!hasSrc) {
		throw new Error(`<${tagName}> has no src attribute`);
	}

	const conflictingSource = importsLocalNameFromOtherSource({
		ast,
		localName: 'Audio',
		sourcePath: importSource,
	});
	if (conflictingSource) {
		throw new Error(
			`Audio is already imported from "${conflictingSource}", expected "${importSource}"`,
		);
	}

	const formattingConfig = prettierConfigOverride ?? null;
	const mutedEdit = getMutedSourceEdit({
		element: jsxElement,
		input,
		prettierConfigOverride: formattingConfig,
	});
	const audioLocalName = ensureNamedImport({
		ast,
		importedName: 'Audio',
		sourcePath: importSource,
		localName: 'Audio',
	});
	const originalAttributeSources = new Map<object, string>();
	const audioElement: JSXElement = {
		type: 'JSXElement',
		openingElement: {
			type: 'JSXOpeningElement',
			name: {type: 'JSXIdentifier', name: audioLocalName},
			attributes: jsxElement.openingElement.attributes
				.filter((attribute) => {
					const name = getAttributeName(attribute);
					return name !== null && audioProps.includes(name);
				})
				.map((attribute) => {
					const clone = cloneAstValue(attribute);
					originalAttributeSources.set(clone, recast.print(clone).code);
					return clone;
				}),
			selfClosing: true,
		},
		closingElement: null,
		children: [],
	};
	const audioSource = printInsertedJsx({
		element: audioElement as never,
		input,
		originalAttributeSources,
		prettierConfigOverride: formattingConfig,
	});

	setBareMutedAttribute(jsxElement);

	const {parentPath} = jsxPath;
	if (!parentPath) {
		throw new Error('Cannot split audio from a JSX element with no parent');
	}

	const insertedAfter = insertAfter(parentPath.node, jsxElement, audioElement);
	if (!insertedAfter) {
		jsxPath.replace(makeFragment(jsxElement, audioElement));
	}

	const insertedAsJsxSibling =
		insertedAfter &&
		(parentPath.node.type === 'JSXElement' ||
			parentPath.node.type === 'JSXFragment');
	const output = applySourceEdits({
		input,
		edits: [
			...getInsertImportSourceEdits({
				ast,
				input,
				prettierConfigOverride: formattingConfig,
				snapshots: importSnapshots,
			}),
			...(insertedAsJsxSibling
				? [
						mutedEdit,
						getAudioSiblingSourceEdit({
							audioSource,
							element: jsxElement,
							input,
						}),
					]
				: [
						getFragmentSourceEdit({
							audioSource,
							element: jsxElement,
							input,
							mutedEdit,
							prettierConfigOverride: formattingConfig,
						}),
					]),
		],
	});
	const {nodePathRemappings} = getNodePathRemappings({
		ast,
		captured: capturedNodePaths,
		output,
	});

	return Promise.resolve({
		output,
		formatted: true,
		nodeLabel,
		logLine:
			jsxElement.openingElement.loc?.start.line ??
			jsxElement.loc?.start.line ??
			1,
		nodePathRemappings,
	});
};
