import {
	deleteJsxElementAtPath,
	deleteJsxNode as deleteJsxNodeCodemod,
	deleteJsxNodes as deleteJsxNodesCodemod,
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
} from '@remotion/studio-codemods';
import type {SequenceNodePath} from 'remotion';
import {formatFileContent} from './format-file-content';

export {
	deleteJsxElementAtPath,
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
};

export const deleteJsxNodes = ({
	input,
	nodePaths,
	prettierConfigOverride,
}: {
	input: string;
	nodePaths: SequenceNodePath[];
	prettierConfigOverride?: Record<string, unknown> | null;
}) =>
	deleteJsxNodesCodemod({
		input,
		nodePaths,
		formatFile: ({contents, prettierConfigOverride: override}) =>
			formatFileContent({
				input: contents,
				prettierConfigOverride: override,
			}),
		prettierConfigOverride,
	});

export const deleteJsxNode = ({
	input,
	nodePath,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
	prettierConfigOverride?: Record<string, unknown> | null;
}) =>
	deleteJsxNodeCodemod({
		input,
		nodePath,
		formatFile: ({contents, prettierConfigOverride: override}) =>
			formatFileContent({
				input: contents,
				prettierConfigOverride: override,
			}),
		prettierConfigOverride,
	});
