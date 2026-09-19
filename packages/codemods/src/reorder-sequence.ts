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
} from './delete-jsx-node-internal';
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

/* eslint-disable require-await -- Keep the formatter-era Promise API. */
export const reorderSequence = async ({
	input,
	sourceNodePath,
	targetNodePath,
	position,
}: {
	input: string;
	sourceNodePath: SequenceNodePath;
	targetNodePath: SequenceNodePath;
	position: ReorderSequencePosition;
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
	sequenceLabel: string;
	logLine: number;
	nodePathRemappings: SequenceNodePathRemapping[];
}> => {
	const ast = parseAst(input);
	const capturedNodePaths = captureJsxNodePaths(ast);
	const sourcePath = findJsxElementPathForDeletion(ast, sourceNodePath);
	if (!sourcePath) {
		throw new Error(
			'Could not find a JSX element at the source location to reorder sequence',
		);
	}

	const targetPath = findJsxElementPathForDeletion(ast, targetNodePath);
	if (!targetPath) {
		throw new Error(
			'Could not find a JSX element at the target location to reorder sequence',
		);
	}

	const sourceParent = getJsxChildrenParent(sourcePath);
	const targetParent = getJsxChildrenParent(targetPath);
	if (!sourceParent || !targetParent || sourceParent !== targetParent) {
		throw new Error(
			'Cannot reorder sequence: source and target are not JSX siblings',
		);
	}

	const sourceElement = sourcePath.node as JSXElement;
	const targetElement = targetPath.node as JSXElement;
	if (sourceElement === targetElement) {
		throw new Error('Cannot reorder sequence: source and target are identical');
	}

	const {children} = sourceParent;
	const sourceIndex = children.indexOf(sourceElement);
	const targetIndex = children.indexOf(targetElement);
	if (sourceIndex === -1 || targetIndex === -1) {
		throw new Error('Cannot reorder sequence: JSX sibling was not found');
	}

	const sequenceLabel = getJsxElementTagLabel(sourceElement);
	const logLine =
		sourceElement.openingElement.loc?.start.line ??
		sourceElement.loc?.start.line ??
		1;
	const sourceEdits = [
		getNodeSourceEdit({input, jsxPath: sourcePath}),
		getAdjacentJsxInsertionSourceEdit({
			input,
			insertion: getJsxElementSourceForInsertion({
				element: sourceElement,
				input,
			}),
			position,
			target: targetElement,
		}),
	];

	const [moved] = children.splice(sourceIndex, 1);
	if (!moved) {
		throw new Error('Cannot reorder sequence: source sequence was not found');
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
		moved,
	);

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
/* eslint-enable require-await */
