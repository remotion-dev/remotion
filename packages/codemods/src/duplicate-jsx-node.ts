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
import {getJsxComponentIdentity} from './sequence-props/jsx-component-identity';
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

const parseJsxElement = (source: string): JSXElement => {
	const file = parseAstForReadOnly(`<>${source}</>;`);
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

const cloneJsxElement = (element: JSXElement): JSXElement =>
	parseJsxElement(
		recast.print(element as Parameters<typeof recast.print>[0]).code,
	);

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

const insertDuplicatedJsxElementAtPath = (
	jsxPath: recast.types.NodePath,
	clone: JSXElement,
): void => {
	const {node, parentPath} = jsxPath;
	if (!parentPath) {
		throw new Error('Cannot duplicate JSX element with no parent');
	}

	const jsxNode = node as JSXElement;
	if (insertDuplicateForParent(parentPath.node, jsxNode, clone)) {
		return;
	}

	jsxPath.replace(makeFragment(jsxNode, clone));
};

const getDuplicatedJsxSource = ({
	element,
	input,
	children,
}: {
	element: JSXElement;
	input: string;
	children: string[] | null;
}) => {
	if (!element.loc) {
		throw new Error('Cannot duplicate a JSX element without a source location');
	}

	const start = recastLocToOffset(input, element.loc.start);
	const end = recastLocToOffset(input, element.loc.end);
	const edits: SourceEdit[] = [];
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
		edits.push({...edit, start: edit.start - start, end: edit.end - start});
	}

	const originalIndent = getLineIndent({input, offset: start});
	if (children !== null) {
		const openingEnd = element.openingElement.loc?.end;
		const closingStart = element.closingElement?.loc?.start;
		if (!openingEnd || !closingStart) {
			throw new Error(
				'Cannot duplicate a Track without its opening and closing tags',
			);
		}

		// This is a new sibling wrapper, so it must not reuse the source Track key.
		for (const attribute of element.openingElement.attributes) {
			if (
				attribute.type !== 'JSXAttribute' ||
				attribute.name.name !== 'key' ||
				!attribute.loc
			) {
				continue;
			}

			edits.push({
				start: recastLocToOffset(input, attribute.loc.start) - start,
				end: recastLocToOffset(input, attribute.loc.end) - start,
				replacement: '',
			});
		}

		const endOfLine = getEndOfLine(input);
		const indent = originalIndent + getIndentationUnit(input, null);
		edits.push({
			start: recastLocToOffset(input, openingEnd) - start,
			end: recastLocToOffset(input, closingStart) - start,
			replacement:
				endOfLine +
				children
					.map((insertion) => indentInsertedJsx({indent, insertion}))
					.join(endOfLine) +
				endOfLine +
				originalIndent,
		});
	}

	const source = applySourceEdits({input: input.slice(start, end), edits});
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
	duplicatedSource,
}: {
	input: string;
	jsxPath: recast.types.NodePath;
	duplicatedSource: string;
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
	duplicatedNodePaths: SequenceNodePath[];
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
			jsxElement,
			nodeLabel: getJsxElementTagLabel(jsxElement),
			logLine:
				jsxElement.openingElement.loc?.start.line ??
				jsxElement.loc?.start.line ??
				1,
		};
	});
	const targetsByTrack = new Map<
		JSXElement,
		{
			jsxPath: recast.types.NodePath;
			targets: Set<JSXElement>;
		}
	>();
	const componentIdentities = new Map<
		JSXElement,
		ReturnType<typeof getJsxComponentIdentity>
	>();
	const ordinaryTargets: typeof targets = [];
	for (const target of targets) {
		let ancestor = target.jsxPath.parentPath;
		let crossesExpression = false;
		let trackPath: recast.types.NodePath | null = null;
		while (ancestor) {
			if (ancestor.value !== ancestor.node) {
				ancestor = ancestor.parentPath;
				continue;
			}

			if (ancestor.node.type === 'JSXElement') {
				const element = ancestor.node as JSXElement;
				const {openingElement} = element;
				let identity = componentIdentities.get(element);
				if (identity === undefined) {
					identity = getJsxComponentIdentity({ast, jsxElement: openingElement});
					componentIdentities.set(element, identity);
				}

				if (identity === 'dev.remotion.remotion.Track') {
					trackPath = ancestor;
					break;
				}

				// A visible sequence owns its descendants independently of the outer
				// Track. HTML, fragments and unknown wrappers cannot prove that boundary.
				const showInTimeline = openingElement.attributes.find(
					(attribute) =>
						attribute.type === 'JSXAttribute' &&
						attribute.name.name === 'showInTimeline',
				);
				const explicitlyVisible =
					showInTimeline?.type === 'JSXAttribute' &&
					(showInTimeline.value === null ||
						(showInTimeline.value?.type === 'JSXExpressionContainer' &&
							showInTimeline.value.expression.type === 'BooleanLiteral' &&
							showInTimeline.value.expression.value));
				if (
					identity !== null &&
					/^dev\.remotion\.(remotion\.(Sequence|Video|OffthreadVideo|Audio|experimental_Video|experimental_Audio|Interactive\.[A-Za-z]+)|media\.(Video|Audio))$/.test(
						identity,
					) &&
					!openingElement.attributes.some(
						(attribute) => attribute.type === 'JSXSpreadAttribute',
					) &&
					(showInTimeline === undefined || explicitlyVisible)
				) {
					break;
				}

				crossesExpression = true;
			}

			if (ancestor.node.type !== 'JSXFragment') {
				crossesExpression = true;
			}

			ancestor = ancestor.parentPath;
		}

		if (trackPath === null) {
			ordinaryTargets.push(target);
			continue;
		}

		if (crossesExpression) {
			throw new Error(
				'Cannot duplicate a clip inside another element or expression within a Track. Duplicate the enclosing Track instead, or make the clip a direct child of the Track.',
			);
		}

		const track = trackPath.node as JSXElement;
		let group = targetsByTrack.get(track);
		if (!group) {
			group = {jsxPath: trackPath, targets: new Set()};
			targetsByTrack.set(track, group);
		}

		group.targets.add(target.jsxPath.node as JSXElement);
	}

	const duplicatedElements = new Map<JSXElement, JSXElement>();
	const operations = ordinaryTargets.map(({jsxPath}) => {
		const element = jsxPath.node as JSXElement;
		const clone = cloneJsxElement(element);
		uniquifyNamePropOnClone(clone);
		duplicatedElements.set(element, clone);
		return {
			jsxPath,
			clone,
			duplicatedSource: getDuplicatedJsxSource({
				element,
				input,
				children: null,
			}),
		};
	});
	for (const [track, group] of targetsByTrack) {
		const copyChildren = (
			children: JSXElement['children'],
		): {
			nodes: JSXElement['children'];
			sources: string[];
		} => {
			const nodes: JSXElement['children'] = [];
			const sources: string[] = [];
			for (const child of children) {
				if (child.type === 'JSXElement' && group.targets.has(child)) {
					const clone = cloneJsxElement(child);
					uniquifyNamePropOnClone(clone);
					duplicatedElements.set(child, clone);
					nodes.push(clone);
					sources.push(
						getDuplicatedJsxSource({element: child, input, children: null}),
					);
				} else if (child.type === 'JSXFragment') {
					const copied = copyChildren(child.children);
					if (copied.nodes.length === 0) {
						continue;
					}

					nodes.push({
						type: 'JSXFragment',
						openingFragment: {type: 'JSXOpeningFragment'},
						closingFragment: {type: 'JSXClosingFragment'},
						children: copied.nodes,
					});
					sources.push(
						[
							'<>',
							...copied.sources.map((insertion) =>
								indentInsertedJsx({
									indent: getIndentationUnit(input, null),
									insertion,
								}),
							),
							'</>',
						].join(getEndOfLine(input)),
					);
				}
			}

			return {nodes, sources};
		};

		const copiedChildren = copyChildren(track.children);
		const trackClone = parseJsxElement(
			getDuplicatedJsxSource({element: track, input, children: []}),
		);
		trackClone.children = copiedChildren.nodes;
		operations.push({
			jsxPath: group.jsxPath,
			clone: trackClone,
			duplicatedSource: getDuplicatedJsxSource({
				element: track,
				input,
				children: copiedChildren.sources,
			}),
		});
	}

	const sourceEdits = operations.map(({jsxPath, duplicatedSource}) =>
		getDuplicateSourceEdit({input, jsxPath, duplicatedSource}),
	);
	for (const {jsxPath, clone} of operations) {
		insertDuplicatedJsxElementAtPath(jsxPath, clone);
	}

	const output = applySourceEdits({edits: sourceEdits, input});
	const {nodePathRemappings, finalNodePathByNode} = getNodePathRemappings({
		ast,
		captured: capturedNodePaths,
		output,
	});
	const duplicatedNodePaths = targets.map(({jsxElement}) => {
		const clone = duplicatedElements.get(jsxElement);
		const nodePath = clone
			? finalNodePathByNode.get(clone.openingElement)
			: null;
		if (!nodePath) {
			throw new Error(
				'Could not locate the duplicated clip in the updated source',
			);
		}

		return nodePath;
	});

	return Promise.resolve({
		output,
		formatted: true,
		nodeLabels: targets.map((target) => target.nodeLabel),
		logLines: targets.map((target) => target.logLine),
		nodePathRemappings,
		duplicatedNodePaths,
	});
};
