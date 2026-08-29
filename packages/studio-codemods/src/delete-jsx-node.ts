import type {
	ArrayExpression,
	ArrowFunctionExpression,
	AssignmentExpression,
	CallExpression,
	ConditionalExpression,
	ExportDefaultDeclaration,
	Expression,
	ExpressionStatement,
	File,
	JSXElement,
	JSXExpressionContainer,
	JSXFragment,
	JSXIdentifier,
	JSXMemberExpression,
	JSXOpeningElement,
	LogicalExpression,
	NewExpression,
	Node,
	OptionalCallExpression,
	ParenthesizedExpression,
	ReturnStatement,
	SequenceExpression,
	TSAsExpression,
	VariableDeclarator,
} from '@babel/types';
import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {recastLocToOffset} from './recast-loc-to-offset';
import {getAstNodePath} from './sequence-props/get-ast-node-path';
import {parseAst} from './sequence-props/parse-ast';

const {builders: b, namedTypes} = recast.types;

/** Recast `builders.nullLiteral()` is typed against ast-types; normalize to Babel `Expression`. */
const nullLiteralExpr = (): Expression =>
	b.nullLiteral() as unknown as Expression;

const jsxOpeningNameToString = (name: JSXOpeningElement['name']): string => {
	if (name.type === 'JSXIdentifier') {
		return name.name;
	}

	if (name.type === 'JSXNamespacedName') {
		return `${name.namespace.name}:${name.name.name}`;
	}

	if (name.type === 'JSXMemberExpression') {
		const memberToString = (
			expr: JSXMemberExpression | JSXIdentifier,
		): string => {
			if (expr.type === 'JSXIdentifier') {
				return expr.name;
			}

			return `${memberToString(expr.object)}.${expr.property.name}`;
		};

		return memberToString(name);
	}

	return 'Unknown';
};

/** e.g. `<Video>` or `<Remotion.Sequence>` for logs and undo copy. */
export const getJsxElementTagLabel = (element: JSXElement): string => {
	return `<${jsxOpeningNameToString(element.openingElement.name)}>`;
};

export const findJsxElementPathForDeletion = (
	ast: File,
	nodePath: SequenceNodePath,
): recast.types.NodePath | null => {
	const current = getAstNodePath(ast, nodePath);
	if (!current) {
		return null;
	}

	if (namedTypes.JSXOpeningElement.check(current.value)) {
		const parent = current.parentPath;
		if (parent && namedTypes.JSXElement.check(parent.value)) {
			return parent;
		}

		return null;
	}

	if (namedTypes.JSXElement.check(current.value)) {
		return current;
	}

	return null;
};

const replaceInLogicalExpression = (
	parent: LogicalExpression,
	node: JSXElement,
): boolean => {
	const nl = nullLiteralExpr();
	if (parent.left === node) {
		parent.left = nl;
		return true;
	}

	if (parent.right === node) {
		parent.right = nl;
		return true;
	}

	return false;
};

const replaceInConditionalExpression = (
	parent: ConditionalExpression,
	node: JSXElement,
): boolean => {
	const nl = nullLiteralExpr();
	if (parent.consequent === node) {
		parent.consequent = nl;
		return true;
	}

	if (parent.alternate === node) {
		parent.alternate = nl;
		return true;
	}

	return false;
};

const replaceInArrowFunctionExpression = (
	parent: ArrowFunctionExpression,
	node: JSXElement,
): boolean => {
	if (parent.body === node) {
		parent.body = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInReturnStatement = (
	parent: ReturnStatement,
	node: JSXElement,
): boolean => {
	if (parent.argument === node) {
		parent.argument = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInCallExpression = (
	parent: CallExpression,
	node: JSXElement,
): boolean => {
	const idx = parent.arguments.indexOf(node);
	if (idx !== -1) {
		parent.arguments[idx] = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInOptionalCallExpression = (
	parent: OptionalCallExpression,
	node: JSXElement,
): boolean => {
	const idx = parent.arguments.indexOf(node);
	if (idx !== -1) {
		parent.arguments[idx] = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInArrayExpression = (
	parent: ArrayExpression,
	node: JSXElement,
): boolean => {
	const idx = parent.elements.indexOf(node);
	if (idx !== -1) {
		parent.elements[idx] = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInAssignmentExpression = (
	parent: AssignmentExpression,
	node: JSXElement,
): boolean => {
	if (parent.right === node) {
		parent.right = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInVariableDeclarator = (
	parent: VariableDeclarator,
	node: JSXElement,
): boolean => {
	if (parent.init === node) {
		parent.init = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInExportDefaultDeclaration = (
	parent: ExportDefaultDeclaration,
	node: JSXElement,
): boolean => {
	if (parent.declaration === node) {
		parent.declaration = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInSequenceExpression = (
	parent: SequenceExpression,
	node: JSXElement,
): boolean => {
	const idx = parent.expressions.indexOf(node);
	if (idx !== -1) {
		parent.expressions[idx] = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInNewExpression = (
	parent: NewExpression,
	node: JSXElement,
): boolean => {
	const idx = parent.arguments.indexOf(node);
	if (idx !== -1) {
		parent.arguments[idx] = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInExpressionStatement = (
	parent: ExpressionStatement,
	node: JSXElement,
): boolean => {
	if (parent.expression === node) {
		parent.expression = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInParenthesizedExpression = (
	parent: ParenthesizedExpression,
	node: JSXElement,
): boolean => {
	if (parent.expression === node) {
		parent.expression = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInJSXExpressionContainer = (
	parent: JSXExpressionContainer,
	node: JSXElement,
): boolean => {
	if (parent.expression === node) {
		parent.expression = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInTSAsExpression = (
	parent: TSAsExpression,
	node: JSXElement,
): boolean => {
	if (parent.expression === node) {
		parent.expression = nullLiteralExpr();
		return true;
	}

	return false;
};

const replaceInJSXParentChildren = (
	parent: JSXElement | JSXFragment,
	node: JSXElement,
): boolean => {
	const idx = parent.children.indexOf(node);
	if (idx !== -1) {
		parent.children.splice(idx, 1);
		return true;
	}

	return false;
};

const replaceNodeWithNull = (parentNode: Node, node: JSXElement): boolean => {
	if (namedTypes.LogicalExpression.check(parentNode)) {
		return replaceInLogicalExpression(parentNode, node);
	}

	if (namedTypes.ConditionalExpression.check(parentNode)) {
		return replaceInConditionalExpression(parentNode, node);
	}

	if (namedTypes.ArrowFunctionExpression.check(parentNode)) {
		return replaceInArrowFunctionExpression(parentNode, node);
	}

	if (namedTypes.ReturnStatement.check(parentNode)) {
		return replaceInReturnStatement(parentNode, node);
	}

	if (namedTypes.CallExpression.check(parentNode)) {
		return replaceInCallExpression(parentNode, node);
	}

	if (parentNode.type === 'OptionalCallExpression') {
		return replaceInOptionalCallExpression(parentNode, node);
	}

	if (namedTypes.ArrayExpression.check(parentNode)) {
		return replaceInArrayExpression(parentNode, node);
	}

	if (namedTypes.AssignmentExpression.check(parentNode)) {
		return replaceInAssignmentExpression(parentNode, node);
	}

	if (namedTypes.VariableDeclarator.check(parentNode)) {
		return replaceInVariableDeclarator(parentNode, node);
	}

	if (namedTypes.ExportDefaultDeclaration.check(parentNode)) {
		return replaceInExportDefaultDeclaration(parentNode, node);
	}

	if (namedTypes.SequenceExpression.check(parentNode)) {
		return replaceInSequenceExpression(parentNode, node);
	}

	if (namedTypes.NewExpression.check(parentNode)) {
		return replaceInNewExpression(parentNode, node);
	}

	if (namedTypes.ExpressionStatement.check(parentNode)) {
		return replaceInExpressionStatement(parentNode, node);
	}

	if (namedTypes.ParenthesizedExpression.check(parentNode)) {
		return replaceInParenthesizedExpression(parentNode, node);
	}

	if (namedTypes.JSXExpressionContainer.check(parentNode)) {
		return replaceInJSXExpressionContainer(parentNode, node);
	}

	if (namedTypes.TSAsExpression.check(parentNode)) {
		return replaceInTSAsExpression(parentNode, node);
	}

	if (namedTypes.JSXElement.check(parentNode)) {
		return replaceInJSXParentChildren(parentNode, node);
	}

	if (namedTypes.JSXFragment.check(parentNode)) {
		return replaceInJSXParentChildren(parentNode, node);
	}

	return false;
};

export const deleteJsxElementAtPath = (
	jsxPath: recast.types.NodePath,
): void => {
	const {node, parentPath} = jsxPath;
	if (!parentPath) {
		throw new Error('Cannot delete JSX element with no parent');
	}

	const jsxNode = node as JSXElement;

	if (replaceNodeWithNull(parentPath.node, jsxNode)) {
		return;
	}

	// Recast can replace this node in arbitrary parent contexts.
	jsxPath.replace(b.nullLiteral());
};

type SourceEdit = {
	end: number;
	replacement: string;
	start: number;
};

const getNodeSourceEdit = ({
	input,
	jsxPath,
}: {
	input: string;
	jsxPath: recast.types.NodePath;
}): SourceEdit => {
	const node = jsxPath.node as JSXElement;
	if (!node.loc) {
		throw new Error('Cannot delete a JSX element without a source location');
	}

	const start = recastLocToOffset(input, node.loc.start);
	const end = recastLocToOffset(input, node.loc.end);
	const parentNode = jsxPath.parentPath?.node;
	const isJsxChild =
		parentNode !== undefined &&
		(namedTypes.JSXElement.check(parentNode) ||
			namedTypes.JSXFragment.check(parentNode));

	if (!isJsxChild) {
		const {extra} = node as JSXElement & {
			extra?: {parenthesized?: boolean};
		};
		if (extra?.parenthesized) {
			let openingParenthesis = start - 1;
			while (openingParenthesis >= 0 && /\s/.test(input[openingParenthesis])) {
				openingParenthesis--;
			}

			let closingParenthesis = end;
			while (
				closingParenthesis < input.length &&
				/\s/.test(input[closingParenthesis])
			) {
				closingParenthesis++;
			}

			if (
				input[openingParenthesis] === '(' &&
				input[closingParenthesis] === ')'
			) {
				return {
					end: closingParenthesis + 1,
					replacement: 'null',
					start: openingParenthesis,
				};
			}
		}

		return {end, replacement: 'null', start};
	}

	const lineStart = input.lastIndexOf('\n', start - 1) + 1;
	const nextLineStart = input.indexOf('\n', end);
	const lineEnd = nextLineStart === -1 ? input.length : nextLineStart;
	const beforeNode = input.slice(lineStart, start);
	const afterNode = input.slice(end, lineEnd);

	if (beforeNode.trim() === '' && afterNode.trim() === '') {
		return {
			end: nextLineStart === -1 ? input.length : nextLineStart + 1,
			replacement: '',
			start: lineStart,
		};
	}

	return {end, replacement: '', start};
};

const applySourceEdits = ({
	edits,
	input,
}: {
	edits: SourceEdit[];
	input: string;
}): string => {
	const sorted = edits
		.slice()
		.sort((left, right) => left.start - right.start || right.end - left.end);
	const nonOverlapping: SourceEdit[] = [];

	for (const edit of sorted) {
		const previous = nonOverlapping[nonOverlapping.length - 1];
		if (previous && edit.start < previous.end) {
			if (edit.end <= previous.end) {
				continue;
			}

			throw new Error('Overlapping JSX deletion source ranges');
		}

		nonOverlapping.push(edit);
	}

	let output = input;
	for (let i = nonOverlapping.length - 1; i >= 0; i--) {
		const edit = nonOverlapping[i];
		output =
			output.slice(0, edit.start) + edit.replacement + output.slice(edit.end);
	}

	return output;
};

export const deleteJsxNodes = ({
	input,
	nodePaths,
}: {
	input: string;
	nodePaths: SequenceNodePath[];
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
	nodeLabels: string[];
	logLines: number[];
	nodePathRemappings: SequenceNodePathRemapping[];
}> => {
	if (nodePaths.length === 0) {
		throw new Error('No JSX nodes were specified for deletion');
	}

	const ast = parseAst(input);
	const capturedNodePaths = captureJsxNodePaths(ast);
	const pathsToDelete = nodePaths.map((nodePath) => {
		const jsxPath = findJsxElementPathForDeletion(ast, nodePath);
		if (!jsxPath) {
			throw new Error(
				'Could not find a JSX element at the specified location to delete',
			);
		}

		const jsxElement = jsxPath.node as JSXElement;

		return {
			jsxPath,
			nodeLabel: getJsxElementTagLabel(jsxElement),
			logLine:
				jsxElement.openingElement.loc?.start.line ??
				jsxElement.loc?.start.line ??
				1,
		};
	});

	const sourceEdits = pathsToDelete.map(({jsxPath}) =>
		getNodeSourceEdit({input, jsxPath}),
	);

	for (const {jsxPath} of pathsToDelete) {
		deleteJsxElementAtPath(jsxPath);
	}

	const output = applySourceEdits({edits: sourceEdits, input});
	const {nodePathRemappings} = getNodePathRemappings({
		ast,
		captured: capturedNodePaths,
		output,
	});

	return Promise.resolve({
		output,
		formatted: true,
		nodeLabels: pathsToDelete.map(({nodeLabel}) => nodeLabel),
		logLines: pathsToDelete.map(({logLine}) => logLine),
		nodePathRemappings,
	});
};

export const deleteJsxNode = async ({
	input,
	nodePath,
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
}> => {
	const {output, formatted, nodeLabels, logLines} = await deleteJsxNodes({
		input,
		nodePaths: [nodePath],
	});

	return {
		output,
		formatted,
		nodeLabel: nodeLabels[0],
		logLine: logLines[0],
	};
};
