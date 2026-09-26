import type {JSXElement, Node} from '@babel/types';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {buildJsxElement} from './build-jsx-element';
import {CodemodElement} from './codemod-element';
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
import {getImportedName} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
} from './source-edits';
import {getEndOfLine, getIndentationUnit, getLineIndent} from './source-style';
import {stripParenthesizedExtra} from './strip-parenthesized-extra';

export type WrapJsxNodeOptions<Project extends CodemodProject> = {
	project: Project;
	node: JsxNodeReference;
	wrapper: CodemodElement;
};

const isHtmlInCanvasWrapper = (wrapper: CodemodElement) =>
	wrapper.importPath === 'remotion' && wrapper.component === 'HtmlInCanvas';

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

	const htmlInCanvasNames = new Set(['HtmlInCanvas']);
	for (const statement of ast.program.body) {
		if (
			statement.type !== 'ImportDeclaration' ||
			statement.source.value !== 'remotion'
		) {
			continue;
		}

		for (const specifier of statement.specifiers ?? []) {
			if (
				specifier.type === 'ImportSpecifier' &&
				getImportedName(specifier) === 'HtmlInCanvas'
			) {
				htmlInCanvasNames.add(specifier.local?.name ?? 'HtmlInCanvas');
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
}: WrapJsxNodeOptions<Project>) => {
	if (!(wrapper instanceof CodemodElement)) {
		throw new Error('wrapper must be created with createElement()');
	}

	if (wrapper.children.length > 0) {
		throw new Error(
			'The wrapper element cannot have children of its own; the wrapped node becomes its only child',
		);
	}

	const filePath = findProjectFile({project, filePath: node.filePath});
	const input = project.files[filePath];
	const eligibility = canWrapJsxNode({input, nodePath: node.nodePath});
	const htmlInCanvas = isHtmlInCanvasWrapper(wrapper);
	if (
		!eligibility.canWrap ||
		(htmlInCanvas && !eligibility.canWrapHtmlInCanvas)
	) {
		throw new Error('This JSX element cannot be wrapped');
	}

	if (
		htmlInCanvas &&
		[wrapper.props.width, wrapper.props.height].some(
			(dimension) =>
				typeof dimension !== 'number' ||
				!Number.isInteger(dimension) ||
				dimension <= 0,
		)
	) {
		throw new Error('HtmlInCanvas requires positive integer dimensions');
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
	const b = recast.types.builders;
	const wrapperElement = buildJsxElement({ast, element: wrapper});
	const opening = wrapperElement.openingElement;
	opening.selfClosing = false;
	const localName = recast.print(opening.name).code;
	const openingLines = printJsxOpeningElement({
		compactLiteralProps: true,
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
		b.jsxElement(opening, b.jsxClosingElement(opening.name), [
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
