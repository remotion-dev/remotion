import type {
	Expression,
	File,
	JSXAttribute,
	JSXElement,
	Node,
} from '@babel/types';
import type {MeasuredCanvasSize} from '@remotion/studio-shared';
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
import {moveCanvasPosition} from './move-canvas-position';
import {getNodeEditResult, type NodeReference} from './node-references';
import {printJsxOpeningElement} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {getImportedName} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {getStaticNumericValue} from './sequence-props/static-numeric-value';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
} from './source-edits';
import {getEndOfLine, getIndentationUnit, getLineIndent} from './source-style';
import {stripParenthesizedExtra} from './strip-parenthesized-extra';

export type WrapNodeOptions<Project extends CodemodProject> = {
	project: Project;
	node: NodeReference;
	wrapper: CodemodElement;
	measuredSize?: MeasuredCanvasSize | null;
};

// Recognizes canvas wrappers whether they are imported by the wrapper or
// already in scope in the file (no importPath).
const getHtmlInCanvasWrapperName = (wrapper: CodemodElement) => {
	const exportName = wrapper.importName ?? wrapper.component;
	if (
		exportName === 'HtmlInCanvas' &&
		(wrapper.importPath === null || wrapper.importPath === 'remotion')
	) {
		return 'HtmlInCanvas';
	}

	if (
		exportName === 'HtmlInCanvasMotionBlur' &&
		(wrapper.importPath === null ||
			wrapper.importPath === '@remotion/motion-blur')
	) {
		return 'HtmlInCanvasMotionBlur';
	}

	return null;
};

// A copied prop is evaluated once for the wrapper and once for the child.
// Calls, property reads (which may invoke getters), and mutations require a local binding.
const canCopyExpression = (
	expression: Expression,
	asDimension: boolean,
): boolean => {
	const value = getStaticNumericValue(expression);
	if (value !== null) {
		return !asDimension || (Number.isInteger(value) && value > 0);
	}

	switch (expression.type) {
		case 'Identifier':
			return true;
		case 'StringLiteral':
		case 'BooleanLiteral':
		case 'NullLiteral':
			return !asDimension;
		case 'BinaryExpression':
			return (
				(!asDimension ||
					[
						'+',
						'-',
						'*',
						'/',
						'%',
						'**',
						'|',
						'&',
						'^',
						'<<',
						'>>',
						'>>>',
					].includes(expression.operator)) &&
				expression.left.type !== 'PrivateName' &&
				canCopyExpression(expression.left, false) &&
				canCopyExpression(expression.right, false)
			);
		case 'LogicalExpression':
			return (
				canCopyExpression(expression.left, asDimension) &&
				canCopyExpression(expression.right, asDimension)
			);
		case 'UnaryExpression':
			return (
				expression.operator !== 'delete' &&
				(!asDimension || ['+', '-', '~'].includes(expression.operator)) &&
				canCopyExpression(expression.argument, false)
			);
		case 'ConditionalExpression':
			return (
				canCopyExpression(expression.test, false) &&
				canCopyExpression(expression.consequent, asDimension) &&
				canCopyExpression(expression.alternate, asDimension)
			);
		case 'TSAsExpression':
		case 'TSNonNullExpression':
		case 'TSSatisfiesExpression':
		case 'ParenthesizedExpression':
			return canCopyExpression(expression.expression, asDimension);
		default:
			return false;
	}
};

const getCanvasWrapInfo = (
	ast: File,
	path: NonNullable<ReturnType<typeof findJsxElementPathForDeletion>>,
):
	| {blocker: 'nested' | 'unknown-dimensions'; dimensions: null}
	| {blocker: null; dimensions: JSXAttribute[]} => {
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
			return {blocker: 'nested', dimensions: null};
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

	if (containsHtmlInCanvas) {
		return {blocker: 'nested', dimensions: null};
	}

	const {attributes} = (path.node as JSXElement).openingElement;
	const dimensions: JSXAttribute[] = [];
	for (const name of ['width', 'height']) {
		const attr = attributes.findLast(
			(attribute) =>
				attribute.type === 'JSXSpreadAttribute' || attribute.name.name === name,
		);
		if (
			attr?.type !== 'JSXAttribute' ||
			attr.value?.type !== 'JSXExpressionContainer'
		) {
			return {blocker: 'unknown-dimensions', dimensions: null};
		}

		const {expression} = attr.value;
		if (
			expression.type === 'JSXEmptyExpression' ||
			!canCopyExpression(expression, true)
		) {
			return {blocker: 'unknown-dimensions', dimensions: null};
		}

		dimensions.push(attr);
	}

	return {blocker: null, dimensions};
};

export const canWrapNode = ({
	input,
	nodePath,
}: {
	input: string;
	nodePath: SequenceNodePath;
}) => {
	const ast = parseAst(input);
	const path = findJsxElementPathForDeletion(ast, nodePath);
	if (!path || !(path.node as JSXElement).loc) {
		return {canWrap: false, canvasWrapBlocker: null};
	}

	return {
		canWrap: true,
		canvasWrapBlocker: getCanvasWrapInfo(ast, path).blocker,
	};
};

export const wrapNode = <Project extends CodemodProject>({
	project,
	node,
	wrapper,
	measuredSize = null,
}: WrapNodeOptions<Project>) => {
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

	const canvasWrapper = getHtmlInCanvasWrapperName(wrapper);
	const canvas = canvasWrapper === null ? null : getCanvasWrapInfo(ast, path);
	if (canvas?.blocker === 'nested') {
		throw new Error('HTML-in-canvas components cannot be nested');
	}

	if (canvas && ('width' in wrapper.props || 'height' in wrapper.props)) {
		throw new Error(
			`${canvasWrapper} inherits width and height from the wrapped element. Omit them from the wrapper props.`,
		);
	}

	const fallbackSize =
		canvas?.blocker === 'unknown-dimensions' ? measuredSize : null;
	if (canvas?.blocker === 'unknown-dimensions' && fallbackSize === null) {
		throw new Error(
			'The wrapped element needs explicit, repeatable width and height expressions that evaluate to positive integers.',
		);
	}

	if (
		fallbackSize !== null &&
		(![fallbackSize.width, fallbackSize.height].every(
			(size) => Number.isSafeInteger(size) && size > 0,
		) ||
			!['inline', 'inline-block', 'block'].includes(fallbackSize.display))
	) {
		throw new Error('Invalid measured canvas size');
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
	const position =
		canvas && !('style' in wrapper.props)
			? moveCanvasPosition(input, original)
			: null;
	const omissions = position?.omissions ?? [];
	const source = applySourceEdits({
		input: input.slice(start, end),
		edits: omissions.map((range) => ({
			start: range.start - start,
			end: range.end - start,
			replacement: '',
		})),
	});
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
	let omittedLength = 0;
	let omissionIndex = 0;
	const childLines = source.split(/\r?\n/).map((line, index) => {
		while (
			omissionIndex < omissions.length &&
			omissions[omissionIndex].start <= start + sourceOffset + omittedLength
		) {
			const range = omissions[omissionIndex++];
			omittedLength += range.end - range.start;
		}

		const lineStart = start + sourceOffset + omittedLength;
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
	let wrapperToInsert = wrapper;
	if (canvas !== null) {
		for (const prop of ['from', 'trimBefore']) {
			if (wrapper.props[prop] === 0) {
				wrapperToInsert = wrapperToInsert.withoutProp(prop);
			}
		}
	}

	if (fallbackSize !== null) {
		const {width, height, display, verticalAlign} = fallbackSize;
		wrapperToInsert = wrapperToInsert.withProps({width, height});
		if (!position && !('style' in wrapper.props)) {
			const style = {
				...(display === 'inline' ? {} : {display}),
				...(verticalAlign === null ? {} : {verticalAlign}),
			};
			if (Object.keys(style).length > 0) {
				wrapperToInsert = wrapperToInsert.withProp('style', style);
			}
		}
	}

	const b = recast.types.builders;
	const wrapperElement = buildJsxElement({ast, element: wrapperToInsert});
	const opening = wrapperElement.openingElement;
	if (canvas?.dimensions) {
		opening.attributes?.unshift(
			...(canvas.dimensions as NonNullable<typeof opening.attributes>),
		);
	}

	if (position) {
		opening.attributes?.push(position.wrapperStyle);
	}

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
