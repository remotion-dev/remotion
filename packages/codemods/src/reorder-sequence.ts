import type {JSXElement, JSXFragment} from '@babel/types';
import type {
	ReorderSequencePosition,
	SequenceNodePathRemapping,
} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
	getNodeSourceEdit,
} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	getAdjacentJsxInsertionSourceEdit,
	getJsxElementSourceForInsertion,
} from './source-edits';
import {getEndOfLine} from './source-style';

const {namedTypes} = recast.types;

const getJsxChildrenParent = (
	path: recast.types.NodePath,
): JSXElement | JSXFragment | null => {
	const parent = path.parentPath?.node;
	if (!parent) {
		return null;
	}

	if (namedTypes.JSXElement.check(parent)) {
		return parent as JSXElement;
	}

	if (namedTypes.JSXFragment.check(parent)) {
		return parent as JSXFragment;
	}

	return null;
};

export const reorderSequences = ({
	input,
	sourceNodePaths,
	targetNodePath,
	position,
}: {
	input: string;
	sourceNodePaths: readonly SequenceNodePath[];
	targetNodePath: SequenceNodePath;
	position: ReorderSequencePosition;
}): {
	output: string;
	formatted: boolean;
	sequenceLabel: string;
	logLine: number;
	nodePathRemappings: SequenceNodePathRemapping[];
} => {
	if (sourceNodePaths.length === 0) {
		throw new Error('Cannot reorder an empty selection');
	}

	const ast = parseAst(input);
	const capturedNodePaths = captureJsxNodePaths(ast);
	const sourcePaths = sourceNodePaths.map((sourceNodePath) => {
		const sourcePath = findJsxElementPathForDeletion(ast, sourceNodePath);
		if (!sourcePath) {
			throw new Error(
				'Could not find a JSX element at the source location to reorder sequence',
			);
		}

		return sourcePath;
	});

	const targetPath = findJsxElementPathForDeletion(ast, targetNodePath);
	if (!targetPath) {
		throw new Error(
			'Could not find a JSX element at the target location to reorder sequence',
		);
	}

	const targetParent = getJsxChildrenParent(targetPath);
	if (
		!targetParent ||
		sourcePaths.some(
			(sourcePath) => getJsxChildrenParent(sourcePath) !== targetParent,
		)
	) {
		throw new Error(
			'Cannot reorder sequences: source and target are not JSX siblings',
		);
	}

	const sourceElements = sourcePaths.map((path) => path.node as JSXElement);
	const targetElement = targetPath.node as JSXElement;
	const selectedElements = new Set(sourceElements);
	if (selectedElements.size !== sourceElements.length) {
		throw new Error('Cannot reorder the same sequence twice');
	}

	if (selectedElements.has(targetElement)) {
		throw new Error('Cannot reorder sequences relative to a selected sequence');
	}

	const {children} = targetParent;
	const orderedSources = sourceElements.sort(
		(left, right) => children.indexOf(left) - children.indexOf(right),
	);
	const targetIndex = children.indexOf(targetElement);
	if (
		targetIndex === -1 ||
		orderedSources.some((element) => children.indexOf(element) === -1)
	) {
		throw new Error('Cannot reorder sequence: JSX sibling was not found');
	}

	const sequenceLabel =
		orderedSources.length === 1
			? getJsxElementTagLabel(orderedSources[0])
			: `${orderedSources.length} sequences`;
	const logLine =
		orderedSources[0].openingElement.loc?.start.line ??
		orderedSources[0].loc?.start.line ??
		1;
	const sourceEdits = [
		...sourcePaths.map((jsxPath) => getNodeSourceEdit({input, jsxPath})),
		getAdjacentJsxInsertionSourceEdit({
			input,
			insertion: orderedSources
				.map((element) => getJsxElementSourceForInsertion({element, input}))
				.join(getEndOfLine(input)),
			position,
			target: targetElement,
		}),
	];

	const originalChildren = [...children];
	for (const source of orderedSources) {
		children.splice(children.indexOf(source), 1);
	}

	const targetIndexAfterRemoval = children.indexOf(targetElement);
	if (targetIndexAfterRemoval === -1) {
		throw new Error('Cannot reorder sequence: target sequence was not found');
	}

	children.splice(
		position === 'before'
			? targetIndexAfterRemoval
			: targetIndexAfterRemoval + 1,
		0,
		...orderedSources,
	);
	if (children.every((child, index) => child === originalChildren[index])) {
		throw new Error('These sequences are already in that position');
	}

	const output = applySourceEdits({edits: sourceEdits, input});
	const {nodePathRemappings} = getNodePathRemappings({
		ast,
		captured: capturedNodePaths,
		output,
	});

	return {
		output,
		formatted: true,
		sequenceLabel,
		logLine,
		nodePathRemappings,
	};
};
