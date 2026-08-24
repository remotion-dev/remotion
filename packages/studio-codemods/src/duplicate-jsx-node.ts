import type {JSXElement, JSXFragment, Node} from '@babel/types';
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
import {
	parseAst,
	parseAstForReadOnly,
	serializeAst,
} from './sequence-props/parse-ast';

const makeFragment = (first: JSXElement, second: JSXElement): JSXFragment => ({
	type: 'JSXFragment',
	openingFragment: {type: 'JSXOpeningFragment'},
	closingFragment: {type: 'JSXClosingFragment'},
	children: [first, second],
});

const cloneJsxElement = (element: JSXElement): JSXElement => {
	const printed = recast.print(
		element as Parameters<typeof recast.print>[0],
	).code;
	const file = parseAstForReadOnly(`<>${printed}</>;`);
	const statement = file.program.body[0];
	if (
		statement?.type !== 'ExpressionStatement' ||
		statement.expression.type !== 'JSXFragment'
	) {
		throw new Error('Could not clone the JSX element to duplicate');
	}

	const cloned = statement.expression.children.find(
		(child): child is JSXElement => child.type === 'JSXElement',
	);
	if (!cloned) {
		throw new Error('Could not clone the JSX element to duplicate');
	}

	return cloned;
};

const uniquifyNamePropOnClone = (clone: JSXElement): void => {
	for (const attr of clone.openingElement.attributes) {
		if (
			attr.type !== 'JSXAttribute' ||
			attr.name.type !== 'JSXIdentifier' ||
			attr.name.name !== 'name' ||
			!attr.value
		) {
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

const getArrayProperty = (parent: Node): string | null => {
	switch (parent.type) {
		case 'JSXElement':
		case 'JSXFragment':
			return 'children';
		case 'CallExpression':
		case 'OptionalCallExpression':
		case 'NewExpression':
			return 'arguments';
		case 'ArrayExpression':
			return 'elements';
		case 'SequenceExpression':
			return 'expressions';
		default:
			return null;
	}
};

const getSingleProperties = (parent: Node): string[] => {
	switch (parent.type) {
		case 'LogicalExpression':
			return ['left', 'right'];
		case 'ConditionalExpression':
			return ['consequent', 'alternate'];
		case 'ArrowFunctionExpression':
			return ['body'];
		case 'ReturnStatement':
			return ['argument'];
		case 'AssignmentExpression':
			return ['right'];
		case 'VariableDeclarator':
			return ['init'];
		case 'ExportDefaultDeclaration':
			return ['declaration'];
		case 'ExpressionStatement':
		case 'ParenthesizedExpression':
		case 'JSXExpressionContainer':
		case 'TSAsExpression':
			return ['expression'];
		default:
			return [];
	}
};

const insertDuplicateForParent = (
	parentNode: Node,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	const parent = parentNode as unknown as Record<string, unknown>;
	const arrayProperty = getArrayProperty(parentNode);
	if (arrayProperty !== null) {
		const items = parent[arrayProperty] as unknown[];
		const index = items.indexOf(node);
		if (index !== -1) {
			items.splice(index + 1, 0, clone);
			return true;
		}
	}

	for (const property of getSingleProperties(parentNode)) {
		if (parent[property] === node) {
			parent[property] = makeFragment(node, clone);
			return true;
		}
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
	const clone = cloneJsxElement(jsxNode);
	uniquifyNamePropOnClone(clone);

	if (insertDuplicateForParent(parentPath.node, jsxNode, clone)) {
		return;
	}

	jsxPath.replace(makeFragment(jsxNode, clone));
};

export const duplicateJsxNode = async ({
	input,
	nodePath,
	formatFile,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
	formatFile: (input: {
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
	const {output, formatted} = await formatFile({
		contents: finalFile,
		prettierConfigOverride: prettierConfigOverride ?? null,
	});
	const {nodePathRemappings} = getNodePathRemappings({
		ast,
		captured: capturedNodePaths,
		output,
	});

	return {
		output,
		formatted,
		nodeLabel,
		logLine,
		nodePathRemappings,
	};
};
