import type {JSXElement, JSXFragment, Node} from '@babel/types';
import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {indentInsertedJsx} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {parseAst, parseAstForReadOnly} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	getJsxElementSourceForInsertion,
	getJsxStringAttributeValueSourceEdit,
	type SourceEdit,
} from './source-edits';
import {
	getEndOfLine,
	getIndentationUnit,
	getLineIndent,
	indentContinuationLines,
} from './source-style';

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

const getDuplicatedJsxSource = ({
	element,
	input,
}: {
	element: JSXElement;
	input: string;
}) => {
	if (!element.loc) {
		throw new Error('Cannot duplicate a JSX element without a source location');
	}

	const start = recastLocToOffset(input, element.loc.start);
	const end = recastLocToOffset(input, element.loc.end);
	let source = input.slice(start, end);
	const nameAttribute = element.openingElement.attributes.find(
		(attribute) =>
			attribute.type === 'JSXAttribute' &&
			attribute.name.type === 'JSXIdentifier' &&
			attribute.name.name === 'name' &&
			(attribute.value?.type === 'StringLiteral' ||
				(attribute.value?.type === 'JSXExpressionContainer' &&
					attribute.value.expression.type === 'StringLiteral')),
	);

	if (nameAttribute?.type === 'JSXAttribute') {
		const value =
			nameAttribute.value?.type === 'JSXExpressionContainer'
				? nameAttribute.value.expression
				: nameAttribute.value;
		if (value?.type !== 'StringLiteral') {
			throw new Error('Expected the JSX name attribute to be a string');
		}

		const edit = getJsxStringAttributeValueSourceEdit({
			attribute: nameAttribute,
			input,
			newValue: `${value.value}-copy`,
		});
		source =
			source.slice(0, edit.start - start) +
			edit.replacement +
			source.slice(edit.end - start);
	}

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

const getDuplicateSourceEdit = ({
	input,
	jsxPath,
}: {
	input: string;
	jsxPath: recast.types.NodePath;
}): SourceEdit => {
	const element = jsxPath.node as JSXElement;
	if (!element.loc) {
		throw new Error('Cannot duplicate a JSX element without a source location');
	}

	const start = recastLocToOffset(input, element.loc.start);
	const end = recastLocToOffset(input, element.loc.end);
	const parentNode = jsxPath.parentPath?.node;
	if (!parentNode) {
		throw new Error('Cannot duplicate JSX element with no parent');
	}

	const duplicatedSource = getDuplicatedJsxSource({element, input});
	const indent = getLineIndent({input, offset: start});
	const endOfLine = getEndOfLine(input);
	const lineEnd = input.indexOf('\n', end);
	const sourceAfterElement = input.slice(
		end,
		lineEnd === -1 ? input.length : lineEnd,
	);

	if (parentNode.type === 'JSXElement' || parentNode.type === 'JSXFragment') {
		const isStandalone = sourceAfterElement.trim() === '';
		const lineStart = input.lastIndexOf('\n', start - 1) + 1;
		const whitespaceBeforeElement =
			input.slice(lineStart, start).match(/[\t ]*$/)?.[0] ?? '';
		const insertion = isStandalone
			? `${endOfLine}${indentInsertedJsx({
					indent,
					insertion: duplicatedSource,
				})}`
			: `${whitespaceBeforeElement}${indentContinuationLines({
					indent,
					input,
					printed: duplicatedSource,
				})}`;

		return {end, replacement: insertion, start: end};
	}

	const arrayProperty = getArrayProperty(parentNode);
	const parent = parentNode as unknown as Record<string, unknown>;
	const isArrayChild =
		arrayProperty !== null &&
		(parent[arrayProperty] as unknown[]).includes(element);
	if (isArrayChild) {
		const isStandalone =
			sourceAfterElement.trim() === '' || sourceAfterElement.trim() === ',';
		const insertion = isStandalone
			? `,${endOfLine}${indentInsertedJsx({
					indent,
					insertion: duplicatedSource,
				})}`
			: `, ${indentContinuationLines({
					indent,
					input,
					printed: duplicatedSource,
				})}`;
		return {end, replacement: insertion, start: end};
	}

	const originalSource = getJsxElementSourceForInsertion({element, input});
	const unit = getIndentationUnit(input, null);
	const fragment = [
		'<>',
		indentInsertedJsx({indent: unit, insertion: originalSource}),
		indentInsertedJsx({indent: unit, insertion: duplicatedSource}),
		'</>',
	].join(endOfLine);

	return {
		end,
		replacement: indentContinuationLines({
			indent,
			input,
			printed: fragment,
		}),
		start,
	};
};

export const duplicateNodes = ({
	input,
	nodePaths,
}: {
	input: string;
	nodePaths: SequenceNodePath[];
}): Promise<{
	output: string;
	formatted: boolean;
	nodeLabels: string[];
	logLines: number[];
	nodePathRemappings: SequenceNodePathRemapping[];
}> => {
	const ast = parseAst(input);
	const capturedNodePaths = captureJsxNodePaths(ast);
	const targets = nodePaths.map((nodePath) => {
		const jsxPath = findJsxElementPathForDeletion(ast, nodePath);
		if (!jsxPath) {
			throw new Error(
				'Could not find a JSX element at the specified location to duplicate',
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
	const sourceEdits = targets.map(({jsxPath}) =>
		getDuplicateSourceEdit({input, jsxPath}),
	);

	for (const target of targets) {
		duplicateJsxElementAtPath(target.jsxPath);
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
		nodeLabels: targets.map((target) => target.nodeLabel),
		logLines: targets.map((target) => target.logLine),
		nodePathRemappings,
	});
};
