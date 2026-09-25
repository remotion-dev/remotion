import type {JSXElement, Node} from '@babel/types';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import type {CodemodProject} from './codemod-project';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import {getNodeEditResult, type JsxNodeReference} from './node-references';
import {printJsxOpeningElement} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {ensureNamedImport, getImportedName} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
} from './source-edits';
import {getEndOfLine, getIndentationUnit, getLineIndent} from './source-style';
import {stripParenthesizedExtra} from './strip-parenthesized-extra';

type JsxWrapper =
	| 'AbsoluteFill'
	| 'Sequence'
	| 'HtmlInCanvas'
	| 'HtmlInCanvasMotionBlur';

export const canWrapJsxNode = ({
	input,
	nodePath,
}: {
	input: string;
	nodePath: SequenceNodePath;
}): {canWrap: boolean; canWrapHtmlInCanvas: boolean} => {
	const ast = parseAst(input);
	const path = findJsxElementPathForDeletion(ast, nodePath);
	if (!path || !(path.node as JSXElement).loc) {
		return {canWrap: false, canWrapHtmlInCanvas: false};
	}

	const htmlInCanvasNames = new Set(['HtmlInCanvas', 'HtmlInCanvasMotionBlur']);
	for (const statement of ast.program.body) {
		if (
			statement.type !== 'ImportDeclaration' ||
			(statement.source.value !== 'remotion' &&
				statement.source.value !== '@remotion/motion-blur')
		) {
			continue;
		}

		for (const specifier of statement.specifiers ?? []) {
			if (
				specifier.type === 'ImportSpecifier' &&
				(getImportedName(specifier) === 'HtmlInCanvas' ||
					getImportedName(specifier) === 'HtmlInCanvasMotionBlur')
			) {
				htmlInCanvasNames.add(
					specifier.local?.name ?? getImportedName(specifier),
				);
			}
		}
	}

	const isHtmlInCanvasElement = (element: JSXElement) => {
		const {name} = element.openingElement;
		return (
			(name.type === 'JSXIdentifier' && htmlInCanvasNames.has(name.name)) ||
			(name.type === 'JSXMemberExpression' &&
				name.property.name === 'HtmlInCanvas')
		);
	};

	let current = path;
	while (current) {
		const node = current.node as Node;
		if (node.type === 'JSXElement' && isHtmlInCanvasElement(node)) {
			return {canWrap: true, canWrapHtmlInCanvas: false};
		}

		current = current.parentPath;
	}

	let containsHtmlInCanvas = false;
	recast.types.visit(path.node as Parameters<typeof recast.types.visit>[0], {
		visitJSXElement(elementPath) {
			if (isHtmlInCanvasElement(elementPath.node as JSXElement)) {
				containsHtmlInCanvas = true;
			}

			this.traverse(elementPath);
		},
	});

	return {canWrap: true, canWrapHtmlInCanvas: !containsHtmlInCanvas};
};

export const wrapJsxNode = <Project extends CodemodProject>({
	project,
	node,
	wrapper,
	width,
	height,
}: {
	project: Project;
	node: JsxNodeReference;
	wrapper: JsxWrapper;
	width: number;
	height: number;
}) => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	const input = project.files[filePath];
	const eligibility = canWrapJsxNode({input, nodePath: node.nodePath});
	const requiresHtmlInCanvas =
		wrapper === 'HtmlInCanvas' || wrapper === 'HtmlInCanvasMotionBlur';
	if (
		!eligibility.canWrap ||
		(requiresHtmlInCanvas && !eligibility.canWrapHtmlInCanvas)
	) {
		throw new Error('This JSX element cannot be wrapped');
	}

	if (
		requiresHtmlInCanvas &&
		(!Number.isInteger(width) ||
			width <= 0 ||
			!Number.isInteger(height) ||
			height <= 0)
	) {
		throw new Error(`${wrapper} requires positive integer dimensions`);
	}

	const ast = parseAst(input);
	const captured = captureJsxNodePaths(ast);
	const importSnapshots = captureImportSnapshots(ast);
	const path = findJsxElementPathForDeletion(ast, node.nodePath);
	if (!path) {
		throw new Error('Could not find the JSX element to wrap');
	}

	const original = path.node as JSXElement;
	if (!original.loc) {
		throw new Error('Could not locate the JSX element to wrap');
	}

	const logLine = original.openingElement.loc?.start.line ?? 1;
	const start = recastLocToOffset(input, original.loc.start);
	const end = recastLocToOffset(input, original.loc.end);
	const indent = getLineIndent({input, offset: start});
	const unit = getIndentationUnit(input, null);
	const endOfLine = getEndOfLine(input);
	// Generated JSX can place the closing tag deeper than the opening tag.
	// Align both tags in the wrapper without reformatting the child's contents.
	const closingStart = original.closingElement?.loc
		? recastLocToOffset(input, original.closingElement.loc.start)
		: null;
	const closingLineStart =
		closingStart === null
			? null
			: input.lastIndexOf('\n', closingStart - 1) + 1;
	const closingIndent =
		closingStart !== null &&
		closingLineStart !== null &&
		/^[\t ]*$/.test(input.slice(closingLineStart, closingStart))
			? getLineIndent({input, offset: closingStart})
			: indent;
	const childIndent = `${indent}${unit}`;
	const source = input.slice(start, end);
	// Keep whitespace that belongs to literal content byte-for-byte.
	const preservedRanges: {
		start: number;
		end: number;
		preserveWhitespace: boolean;
	}[] = [];
	recast.types.visit(original, {
		visitTemplateLiteral(templatePath) {
			if (templatePath.node.loc) {
				preservedRanges.push({
					start: recastLocToOffset(input, templatePath.node.loc.start),
					end: recastLocToOffset(input, templatePath.node.loc.end),
					preserveWhitespace: true,
				});
			}

			this.traverse(templatePath);
		},
		visitJSXText(textPath) {
			if (textPath.node.loc && textPath.node.value.trim().length > 0) {
				preservedRanges.push({
					start: recastLocToOffset(input, textPath.node.loc.start),
					end: recastLocToOffset(input, textPath.node.loc.end),
					preserveWhitespace: false,
				});
			}

			this.traverse(textPath);
		},
		visitStringLiteral(stringPath) {
			if (
				stringPath.node.loc &&
				stringPath.node.loc.start.line !== stringPath.node.loc.end.line
			) {
				preservedRanges.push({
					start: recastLocToOffset(input, stringPath.node.loc.start),
					end: recastLocToOffset(input, stringPath.node.loc.end),
					preserveWhitespace: true,
				});
			}

			this.traverse(stringPath);
		},
	});
	let sourceOffset = 0;
	const childLines = source.split(/\r?\n/).map((line, index) => {
		const lineStart = start + sourceOffset;
		const nextLineBreak = source.indexOf('\n', sourceOffset);
		sourceOffset = nextLineBreak === -1 ? source.length : nextLineBreak + 1;
		if (index === 0) {
			return `${childIndent}${line}`;
		}

		if (
			preservedRanges.some(
				(range) =>
					lineStart >= range.start &&
					lineStart < range.end &&
					(range.preserveWhitespace ||
						input
							.slice(lineStart, Math.min(range.end, lineStart + line.length))
							.trim().length > 0),
			)
		) {
			return line;
		}

		if (line.trim().length === 0) {
			return '';
		}

		return `${childIndent}${line.startsWith(closingIndent) ? line.slice(closingIndent.length) : line.trimStart()}`;
	});
	const occupiedNames = new Set<string>();
	recast.types.visit(ast, {
		visitIdentifier(identifierPath) {
			occupiedNames.add(identifierPath.node.name);
			this.traverse(identifierPath);
		},
		visitJSXIdentifier(identifierPath) {
			occupiedNames.add(identifierPath.node.name);
			this.traverse(identifierPath);
		},
	});
	let suggestedName: string = wrapper;
	for (let suffix = 1; occupiedNames.has(suggestedName); suffix++) {
		suggestedName = `${wrapper}FromRemotion${suffix}`;
	}

	const localName = ensureNamedImport({
		ast,
		importedName: wrapper,
		localName: suggestedName,
		sourcePath:
			wrapper === 'HtmlInCanvasMotionBlur'
				? '@remotion/motion-blur'
				: 'remotion',
	});
	const b = recast.types.builders;
	const name = b.jsxIdentifier(localName);
	const attributes = requiresHtmlInCanvas
		? [
				b.jsxAttribute(
					b.jsxIdentifier('width'),
					b.jsxExpressionContainer(b.numericLiteral(width)),
				),
				b.jsxAttribute(
					b.jsxIdentifier('height'),
					b.jsxExpressionContainer(b.numericLiteral(height)),
				),
			]
		: [];
	const opening = b.jsxOpeningElement(name, attributes, false);
	const openingLines = printJsxOpeningElement({
		openingElement: opening,
		input,
		prettierConfigOverride: null,
	}).split(/\r?\n/);
	const replacement = [
		openingLines[0],
		...openingLines.slice(1).map((line) => `${indent}${line}`),
		...childLines,
		`${indent}</${localName}>`,
	].join(endOfLine);
	path.replace(
		b.jsxElement(opening, b.jsxClosingElement(b.jsxIdentifier(localName)), [
			stripParenthesizedExtra(original) as never,
		]) as never,
	);

	const output = applySourceEdits({
		input,
		edits: [
			{start, end, replacement},
			...getInsertImportSourceEdits({
				ast,
				input,
				prettierConfigOverride: null,
				snapshots: importSnapshots,
			}),
		],
	});
	const {nodePathRemappings} = getNodePathRemappings({ast, captured, output});
	return {
		...getNodeEditResult({
			project,
			edits: [{filePath, output, nodePathRemappings}],
		}),
		logLine,
	};
};
