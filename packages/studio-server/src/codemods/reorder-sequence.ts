import type {JSXElement, JSXFragment} from '@babel/types';
import type {ReorderSequencePosition} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
} from './delete-jsx-node';
import {formatFileContent} from './format-file-content';
import {parseAst, serializeAst} from './parse-ast';

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

export const reorderSequence = async ({
	input,
	sourceNodePath,
	targetNodePath,
	position,
	prettierConfigOverride,
}: {
	input: string;
	sourceNodePath: SequenceNodePath;
	targetNodePath: SequenceNodePath;
	position: ReorderSequencePosition;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	sequenceLabel: string;
	logLine: number;
}> => {
	const ast = parseAst(input);
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

	const finalFile = serializeAst(ast);
	const {output, formatted} = await formatFileContent({
		input: finalFile,
		prettierConfigOverride,
	});

	return {
		output,
		formatted,
		sequenceLabel,
		logLine,
	};
};
