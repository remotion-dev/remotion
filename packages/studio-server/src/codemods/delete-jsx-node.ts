import {
	deleteJsxElementAtPath,
	deleteJsxNode as deleteJsxNodeCodemod,
	deleteJsxNodes as deleteJsxNodesCodemod,
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
} from '@remotion/codemods/internal';
import type {SequenceNodePath} from 'remotion';

export {
	deleteJsxElementAtPath,
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
};

export const deleteJsxNodes = ({
	input,
	nodePaths,
}: {
	input: string;
	nodePaths: SequenceNodePath[];
}) =>
	deleteJsxNodesCodemod({
		input,
		nodePaths,
	});

export const deleteJsxNode = ({
	input,
	nodePath,
}: {
	input: string;
	nodePath: SequenceNodePath;
}) =>
	deleteJsxNodeCodemod({
		input,
		nodePath,
	});
