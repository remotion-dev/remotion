import type {JSXElement, JSXOpeningElement, Node} from '@babel/types';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import type {CodemodProject} from './codemod-project';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import {getNodeEditResult, type NodeReference} from './node-references';
import {recastLocToOffset} from './recast-loc-to-offset';
import {parseAst} from './sequence-props/parse-ast';
import {applySourceEdits} from './source-edits';
import {getLineIndent} from './source-style';

export type UnwrapNodeOptions<Project extends CodemodProject> = {
	project: Project;
	node: NodeReference;
};

export const canUnwrapNode = ({
	input,
	nodePath,
}: {
	input: string;
	nodePath: SequenceNodePath;
}): boolean => {
	const path = findJsxElementPathForDeletion(parseAst(input), nodePath);
	const element = path?.node as JSXElement | undefined;
	return Boolean(element?.loc && element.closingElement?.loc);
};

export const unwrapNode = <Project extends CodemodProject>({
	project,
	node,
}: UnwrapNodeOptions<Project>) => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	const input = project.files[filePath];
	const ast = parseAst(input);
	const captured = captureJsxNodePaths(ast);
	const path = findJsxElementPathForDeletion(ast, node.nodePath);
	const element = path?.node as JSXElement | undefined;
	if (
		!path ||
		!element?.loc ||
		!element.openingElement.loc ||
		!element.closingElement?.loc
	) {
		throw new Error('This JSX element cannot be unwrapped');
	}

	const start = recastLocToOffset(input, element.loc.start);
	const end = recastLocToOffset(input, element.loc.end);
	const openingEnd = recastLocToOffset(input, element.openingElement.loc.end);
	const closingStart = recastLocToOffset(
		input,
		element.closingElement.loc.start,
	);
	let firstChild: JSXOpeningElement | null = null;
	for (const child of element.children) {
		recast.types.visit(child, {
			visitJSXOpeningElement(childPath) {
				firstChild ??= childPath.node as JSXOpeningElement;
				return false;
			},
		});
		if (firstChild !== null) break;
	}

	const parent = path.parentPath?.node as Node | undefined;
	const isJsxChild =
		parent?.type === 'JSXElement' || parent?.type === 'JSXFragment';
	const meaningfulChildren = element.children.filter(
		(child) => child.type !== 'JSXText' || child.value.trim() !== '',
	);
	const singleChild =
		meaningfulChildren.length === 1 &&
		(meaningfulChildren[0].type === 'JSXElement' ||
			meaningfulChildren[0].type === 'JSXFragment')
			? meaningfulChildren[0]
			: null;
	const needsFragment = !isJsxChild && singleChild === null;

	// Preserve text, comments and expressions exactly. A fragment keeps JSX
	// children valid in expression positions without introducing a component.
	let replacement = input.slice(openingEnd, closingStart);
	if (needsFragment) {
		path.replace(
			recast.types.builders.jsxFragment(
				recast.types.builders.jsxOpeningFragment(),
				recast.types.builders.jsxClosingFragment(),
				element.children as never,
			),
		);
		replacement = `<>${replacement}</>`;
	} else {
		if (isJsxChild) {
			path.replace(...element.children);
		} else {
			path.replace(singleChild!);
		}

		// Dedent code, but never change whitespace inside literal content.
		const preservedRanges: {
			start: number;
			end: number;
			preserveWhitespace: boolean;
		}[] = [];
		recast.types.visit(element, {
			visitNode(literalPath) {
				const literal = literalPath.node as Node;
				if (
					literal.loc &&
					(literal.type === 'TemplateLiteral' ||
						literal.type === 'StringLiteral' ||
						(literal.type === 'JSXText' && literal.value.trim() !== ''))
				) {
					preservedRanges.push({
						preserveWhitespace: literal.type !== 'JSXText',
						start: recastLocToOffset(input, literal.loc.start),
						end: recastLocToOffset(input, literal.loc.end),
					});
				}

				this.traverse(literalPath);
			},
		});
		const indent = getLineIndent({input, offset: start});
		const firstContent = replacement.search(/\S/);
		const childIndent =
			firstContent === -1
				? indent
				: getLineIndent({input, offset: openingEnd + firstContent});
		let offset = openingEnd;
		replacement = replacement
			.split(/(?<=\n)/)
			.map((line) => {
				const lineOffset = offset;
				offset += line.length;
				if (
					lineOffset === openingEnd ||
					preservedRanges.some(
						(range) =>
							lineOffset >= range.start &&
							lineOffset < range.end &&
							(range.preserveWhitespace ||
								input
									.slice(
										lineOffset,
										Math.min(range.end, lineOffset + line.length),
									)
									.trim().length > 0),
					)
				) {
					return line;
				}

				return childIndent.startsWith(indent) && line.startsWith(childIndent)
					? `${indent}${line.slice(childIndent.length)}`
					: line;
			})
			.join('');
		// Whitespace-only boundary lines belonged to the wrapper's layout.
		replacement = replacement
			.replace(/^[\t ]*\r?\n[\t ]*/, '')
			.replace(/\r?\n[\t ]*$/, '');
	}

	const output = applySourceEdits({input, edits: [{start, end, replacement}]});
	const {nodePathRemappings, finalNodePathByNode} = getNodePathRemappings({
		ast,
		captured,
		output,
	});
	return {
		...getNodeEditResult({
			project,
			edits: [{filePath, output, nodePathRemappings}],
		}),
		childNodePath:
			firstChild === null
				? null
				: (finalNodePathByNode.get(firstChild) ?? null),
		logLine: element.openingElement.loc.start.line,
	};
};
