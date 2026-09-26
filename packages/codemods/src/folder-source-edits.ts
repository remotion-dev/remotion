import type {
	ArrowFunctionExpression,
	JSXElement,
	JSXFragment,
	ReturnStatement,
} from '@babel/types';
import type * as recast from 'recast';
import {getNodeSourceEdit} from './delete-jsx-nodes-internal';
import type {TreeEntry} from './folder-editing';
import {getInsertionRootSourceEdit} from './insert-jsx-element';
import {indentInsertedJsx} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {
	applySourceEdits,
	getAdjacentJsxInsertionSourceEdit,
	getJsxElementSourceForInsertion,
	type SourceEdit,
} from './source-edits';
import {getEndOfLine, getIndentationUnit, getLineIndent} from './source-style';

const getRegistrationRoot = (
	path: recast.types.NodePath,
): JSXElement | JSXFragment => {
	let currentPath: recast.types.NodePath | null = path;
	while (currentPath !== null) {
		const node = currentPath.node as ReturnStatement | ArrowFunctionExpression;
		if (
			node.type === 'ReturnStatement' &&
			(node.argument?.type === 'JSXElement' ||
				node.argument?.type === 'JSXFragment')
		) {
			return node.argument;
		}

		if (
			node.type === 'ArrowFunctionExpression' &&
			(node.body.type === 'JSXElement' || node.body.type === 'JSXFragment')
		) {
			return node.body;
		}

		currentPath = currentPath.parentPath ?? null;
	}

	throw new Error('Could not find a root JSX element');
};

const normalizeBlock = (source: string) => {
	const lines = source.split(/\r?\n/);
	while (lines[0]?.trim() === '') {
		lines.shift();
	}

	while (lines.at(-1)?.trim() === '') {
		lines.pop();
	}

	const indents = lines
		.filter((line) => line.trim() !== '')
		.map((line) => line.match(/^[\t ]*/)?.[0] ?? '');
	let commonIndent = indents[0] ?? '';
	for (const indent of indents.slice(1)) {
		while (!indent.startsWith(commonIndent)) {
			commonIndent = commonIndent.slice(0, -1);
		}
	}

	return lines
		.map((line) => (line.trim() === '' ? '' : line.slice(commonIndent.length)))
		.join(getEndOfLine(source));
};

const isMeaningfulChild = (child: JSXElement['children'][number]) =>
	child.type !== 'JSXText' || child.value.trim() !== '';

export const getUnwrapFolderSourceEdit = ({
	input,
	located,
}: {
	input: string;
	located: TreeEntry;
}): SourceEdit => {
	const {node, path} = located;
	if (!node.loc) {
		throw new Error('Could not locate the folder to delete');
	}

	const openingEnd = node.openingElement.loc
		? recastLocToOffset(input, node.openingElement.loc.end)
		: null;
	const closingStart = node.closingElement?.loc
		? recastLocToOffset(input, node.closingElement.loc.start)
		: null;
	const inner =
		openingEnd === null || closingStart === null
			? ''
			: normalizeBlock(input.slice(openingEnd, closingStart));

	if (!located.directJsxChild) {
		const meaningfulChildren = node.children.filter(isMeaningfulChild);
		if (meaningfulChildren.length === 0) {
			return {
				start: recastLocToOffset(input, node.loc.start),
				end: recastLocToOffset(input, node.loc.end),
				replacement: 'null',
			};
		}

		if (
			meaningfulChildren.length === 1 &&
			(meaningfulChildren[0].type === 'JSXElement' ||
				meaningfulChildren[0].type === 'JSXFragment')
		) {
			return {
				start: recastLocToOffset(input, node.loc.start),
				end: recastLocToOffset(input, node.loc.end),
				replacement: inner,
			};
		}

		const rootIndent = getLineIndent({
			input,
			offset: recastLocToOffset(input, node.loc.start),
		});
		const endOfLine = getEndOfLine(input);
		const unit = getIndentationUnit(input, null);
		return {
			start: recastLocToOffset(input, node.loc.start),
			end: recastLocToOffset(input, node.loc.end),
			replacement: [
				'<>',
				indentInsertedJsx({
					indent: `${rootIndent}${unit}`,
					insertion: inner,
				}),
				`${rootIndent}</>`,
			].join(endOfLine),
		};
	}

	const deletion = getNodeSourceEdit({input, jsxPath: path});
	if (inner === '') {
		return deletion;
	}

	const nodeStart = recastLocToOffset(input, node.loc.start);
	const indent = getLineIndent({input, offset: nodeStart});
	return {
		...deletion,
		replacement: `${indentInsertedJsx({indent, insertion: inner})}${
			deletion.end > recastLocToOffset(input, node.loc.end)
				? getEndOfLine(input)
				: ''
		}`,
	};
};

export const getMoveTreeItemSourceEdits = ({
	input,
	source,
	target,
	position,
}: {
	input: string;
	source: TreeEntry;
	target: TreeEntry | null;
	position: 'root' | 'folder' | 'before' | 'after';
}): SourceEdit[] => {
	const deletion = getNodeSourceEdit({input, jsxPath: source.path});
	const insertion = getJsxElementSourceForInsertion({
		element: source.node,
		input,
	});
	if (position === 'root') {
		const root = getRegistrationRoot(source.path);
		if (root.type === 'JSXElement') {
			if (!root.loc) throw new Error('Could not locate the registration root');
			const start = recastLocToOffset(input, root.loc.start);
			const end = recastLocToOffset(input, root.loc.end);
			const indent = getLineIndent({input, offset: start});
			const unit = getIndentationUnit(input, null);
			const removed = applySourceEdits({input, edits: [deletion]});
			const rootSource = removed
				.slice(
					start,
					end - (deletion.end - deletion.start) + deletion.replacement.length,
				)
				.split(/\r?\n/)
				.map((line, index) =>
					index > 0 && line.startsWith(indent)
						? line.slice(indent.length)
						: line,
				)
				.join(getEndOfLine(input));
			return [
				{
					start,
					end,
					replacement: [
						'<>',
						indentInsertedJsx({
							indent: `${indent}${unit}`,
							insertion: rootSource,
						}),
						indentInsertedJsx({indent: `${indent}${unit}`, insertion}),
						`${indent}</>`,
					].join(getEndOfLine(input)),
				},
			];
		}

		return [
			deletion,
			getInsertionRootSourceEdit({
				input,
				insertion,
				root: root as never,
				nullRoot: null,
				prettierConfigOverride: null,
				insertInside: true,
			}),
		];
	}

	if (target === null) throw new Error('Could not locate the JSX destination');
	return [
		deletion,
		position === 'folder'
			? getInsertionRootSourceEdit({
					input,
					insertion,
					root: target.node as never,
					nullRoot: null,
					prettierConfigOverride: null,
					insertInside: true,
				})
			: getAdjacentJsxInsertionSourceEdit({
					input,
					insertion,
					position,
					target: target.node,
				}),
	];
};
