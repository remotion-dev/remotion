import type {
	ArrowFunctionExpression,
	ArrayExpression,
	AssignmentExpression,
	CallExpression,
	ConditionalExpression,
	ExportDefaultDeclaration,
	Expression,
	ExpressionStatement,
	JSXElement,
	JSXExpressionContainer,
	JSXFragment,
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
import {cloneNode} from '@babel/types';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
} from './delete-jsx-node';
import {formatFileContent} from './format-file-content';
import {parseAst, serializeAst} from './parse-ast';

const {namedTypes} = recast.types;

const makeFragment = (first: JSXElement, second: JSXElement): JSXFragment => ({
	type: 'JSXFragment',
	openingFragment: {type: 'JSXOpeningFragment'},
	closingFragment: {type: 'JSXClosingFragment'},
	children: [first, second],
});

const uniquifyNamePropOnClone = (clone: JSXElement): void => {
	for (const attr of clone.openingElement.attributes) {
		if (attr.type !== 'JSXAttribute' || attr.name.type !== 'JSXIdentifier') {
			continue;
		}

		if (attr.name.name !== 'name') {
			continue;
		}

		if (!attr.value) {
			continue;
		}

		if (attr.value.type === 'StringLiteral') {
			attr.value.value = `${attr.value.value}-copy`;
			return;
		}

		if (
			attr.value.type === 'JSXExpressionContainer' &&
			attr.value.expression.type === 'StringLiteral'
		) {
			attr.value.expression.value = `${attr.value.expression.value}-copy`;
			return;
		}
	}
};

const duplicateInLogicalExpression = (
	parent: LogicalExpression,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const frag = makeFragment(node, clone);
	if (parent.left === node) {
		parent.left = frag as unknown as Expression;
		return true;
	}

	if (parent.right === node) {
		parent.right = frag as unknown as Expression;
		return true;
	}

	return false;
};

const duplicateInConditionalExpression = (
	parent: ConditionalExpression,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const frag = makeFragment(node, clone);
	if (parent.consequent === node) {
		parent.consequent = frag as unknown as Expression;
		return true;
	}

	if (parent.alternate === node) {
		parent.alternate = frag as unknown as Expression;
		return true;
	}

	return false;
};

const duplicateInArrowFunctionExpression = (
	parent: ArrowFunctionExpression,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const frag = makeFragment(node, clone);
	if (parent.body === node) {
		parent.body = frag as ArrowFunctionExpression['body'];
		return true;
	}

	return false;
};

const duplicateInReturnStatement = (
	parent: ReturnStatement,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const frag = makeFragment(node, clone);
	if (parent.argument === node) {
		parent.argument = frag as unknown as Expression;
		return true;
	}

	return false;
};

const duplicateInCallExpression = (
	parent: CallExpression,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const idx = parent.arguments.indexOf(node);
	if (idx !== -1) {
		parent.arguments.splice(idx + 1, 0, clone);
		return true;
	}

	return false;
};

const duplicateInOptionalCallExpression = (
	parent: OptionalCallExpression,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const idx = parent.arguments.indexOf(node);
	if (idx !== -1) {
		parent.arguments.splice(idx + 1, 0, clone);
		return true;
	}

	return false;
};

const duplicateInArrayExpression = (
	parent: ArrayExpression,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const idx = parent.elements.indexOf(node);
	if (idx !== -1) {
		parent.elements.splice(idx + 1, 0, clone);
		return true;
	}

	return false;
};

const duplicateInAssignmentExpression = (
	parent: AssignmentExpression,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const frag = makeFragment(node, clone);
	if (parent.right === node) {
		parent.right = frag as unknown as Expression;
		return true;
	}

	return false;
};

const duplicateInVariableDeclarator = (
	parent: VariableDeclarator,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const frag = makeFragment(node, clone);
	if (parent.init === node) {
		parent.init = frag as unknown as Expression;
		return true;
	}

	return false;
};

const duplicateInExportDefaultDeclaration = (
	parent: ExportDefaultDeclaration,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const frag = makeFragment(node, clone);
	if (parent.declaration === node) {
		parent.declaration =
			frag as unknown as ExportDefaultDeclaration['declaration'];
		return true;
	}

	return false;
};

const duplicateInSequenceExpression = (
	parent: SequenceExpression,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const idx = parent.expressions.indexOf(node);
	if (idx !== -1) {
		parent.expressions.splice(idx + 1, 0, clone);
		return true;
	}

	return false;
};

const duplicateInNewExpression = (
	parent: NewExpression,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const idx = parent.arguments.indexOf(node);
	if (idx !== -1) {
		parent.arguments.splice(idx + 1, 0, clone);
		return true;
	}

	return false;
};

const duplicateInExpressionStatement = (
	parent: ExpressionStatement,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const frag = makeFragment(node, clone);
	if (parent.expression === node) {
		parent.expression = frag as unknown as Expression;
		return true;
	}

	return false;
};

const duplicateInParenthesizedExpression = (
	parent: ParenthesizedExpression,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const frag = makeFragment(node, clone);
	if (parent.expression === node) {
		parent.expression = frag as unknown as Expression;
		return true;
	}

	return false;
};

const duplicateInJSXExpressionContainer = (
	parent: JSXExpressionContainer,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const frag = makeFragment(node, clone);
	if (parent.expression === node) {
		parent.expression = frag as unknown as Expression;
		return true;
	}

	return false;
};

const duplicateInTSAsExpression = (
	parent: TSAsExpression,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const frag = makeFragment(node, clone);
	if (parent.expression === node) {
		parent.expression = frag as unknown as Expression;
		return true;
	}

	return false;
};

const duplicateInJSXParentChildren = (
	parent: JSXElement | JSXFragment,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const idx = parent.children.indexOf(node);
	if (idx !== -1) {
		parent.children.splice(idx + 1, 0, clone);
		return true;
	}

	return false;
};

const insertDuplicateForParent = (
	parentNode: Node,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	if (namedTypes.LogicalExpression.check(parentNode)) {
		return duplicateInLogicalExpression(parentNode, node, clone);
	}

	if (namedTypes.ConditionalExpression.check(parentNode)) {
		return duplicateInConditionalExpression(parentNode, node, clone);
	}

	if (namedTypes.ArrowFunctionExpression.check(parentNode)) {
		return duplicateInArrowFunctionExpression(parentNode, node, clone);
	}

	if (namedTypes.ReturnStatement.check(parentNode)) {
		return duplicateInReturnStatement(parentNode, node, clone);
	}

	if (namedTypes.CallExpression.check(parentNode)) {
		return duplicateInCallExpression(parentNode, node, clone);
	}

	if (parentNode.type === 'OptionalCallExpression') {
		return duplicateInOptionalCallExpression(parentNode, node, clone);
	}

	if (namedTypes.ArrayExpression.check(parentNode)) {
		return duplicateInArrayExpression(parentNode, node, clone);
	}

	if (namedTypes.AssignmentExpression.check(parentNode)) {
		return duplicateInAssignmentExpression(parentNode, node, clone);
	}

	if (namedTypes.VariableDeclarator.check(parentNode)) {
		return duplicateInVariableDeclarator(parentNode, node, clone);
	}

	if (namedTypes.ExportDefaultDeclaration.check(parentNode)) {
		return duplicateInExportDefaultDeclaration(parentNode, node, clone);
	}

	if (namedTypes.SequenceExpression.check(parentNode)) {
		return duplicateInSequenceExpression(parentNode, node, clone);
	}

	if (namedTypes.NewExpression.check(parentNode)) {
		return duplicateInNewExpression(parentNode, node, clone);
	}

	if (namedTypes.ExpressionStatement.check(parentNode)) {
		return duplicateInExpressionStatement(parentNode, node, clone);
	}

	if (namedTypes.ParenthesizedExpression.check(parentNode)) {
		return duplicateInParenthesizedExpression(parentNode, node, clone);
	}

	if (namedTypes.JSXExpressionContainer.check(parentNode)) {
		return duplicateInJSXExpressionContainer(parentNode, node, clone);
	}

	if (namedTypes.TSAsExpression.check(parentNode)) {
		return duplicateInTSAsExpression(parentNode, node, clone);
	}

	if (namedTypes.JSXElement.check(parentNode)) {
		return duplicateInJSXParentChildren(parentNode, node, clone);
	}

	if (namedTypes.JSXFragment.check(parentNode)) {
		return duplicateInJSXParentChildren(parentNode, node, clone);
	}

	return false;
};

export const duplicateJsxElementAtPath = (
	jsxPath: recast.types.NodePath,
): void => {
	const {node, parentPath} = jsxPath;
	if (!parentPath) {
		throw new Error('Cannot duplicate JSX element with no parent');
	}

	const jsxNode = node as JSXElement;
	const clone = cloneNode(jsxNode, true) as JSXElement;
	uniquifyNamePropOnClone(clone);

	if (insertDuplicateForParent(parentPath.node, jsxNode, clone)) {
		return;
	}

	jsxPath.replace(makeFragment(jsxNode, clone));
};

export const duplicateJsxNode = async ({
	input,
	nodePath,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	nodeLabel: string;
	logLine: number;
}> => {
	const ast = parseAst(input);
	const jsxPath = findJsxElementPathForDeletion(ast, nodePath);
	if (!jsxPath) {
		throw new Error(
			'Could not find a JSX element at the specified location to duplicate',
		);
	}

	const jsxElement = jsxPath.node as JSXElement;
	const nodeLabel = getJsxElementTagLabel(jsxElement);
	const logLine =
		jsxElement.openingElement.loc?.start.line ??
		jsxElement.loc?.start.line ??
		1;

	duplicateJsxElementAtPath(jsxPath);

	const finalFile = serializeAst(ast);
	const {output, formatted} = await formatFileContent({
		input: finalFile,
		prettierConfigOverride,
	});

	return {
		output,
		formatted,
		nodeLabel,
		logLine,
	};
};
