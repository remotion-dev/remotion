import {CodemodsInternals} from '@remotion/codemods';
import type {SequenceNodePath} from 'remotion';

const {
	deleteJsxElementAtPath,
	deleteJsxNodes: deleteJsxNodesCodemod,
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
} = CodemodsInternals;

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
