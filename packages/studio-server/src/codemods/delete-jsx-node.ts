import {CodeModsInternals} from '@remotion/codemods';
import type {SequenceNodePath} from 'remotion';

const {
	deleteJsxElementAtPath,
	deleteJsxNode: deleteJsxNodeCodemod,
	deleteJsxNodes: deleteJsxNodesCodemod,
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
} = CodeModsInternals;

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
