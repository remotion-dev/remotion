import {
	duplicateJsxElementAtPath,
	duplicateJsxNode as duplicateJsxNodeCodemod,
	duplicateJsxNodes as duplicateJsxNodesCodemod,
} from '@remotion/studio-codemods';
import type {SequenceNodePath} from 'remotion';
import {formatFileContent} from './format-file-content';

export {duplicateJsxElementAtPath};

export const duplicateJsxNode = ({
	input,
	nodePath,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
	prettierConfigOverride?: Record<string, unknown> | null;
}) =>
	duplicateJsxNodeCodemod({
		input,
		nodePath,
		formatFile: ({contents, prettierConfigOverride: override}) =>
			formatFileContent({
				input: contents,
				prettierConfigOverride: override,
			}),
		prettierConfigOverride,
	});

export const duplicateJsxNodes = ({
	input,
	nodePaths,
	prettierConfigOverride,
}: {
	input: string;
	nodePaths: SequenceNodePath[];
	prettierConfigOverride?: Record<string, unknown> | null;
}) =>
	duplicateJsxNodesCodemod({
		input,
		nodePaths,
		formatFile: ({contents, prettierConfigOverride: override}) =>
			formatFileContent({
				input: contents,
				prettierConfigOverride: override,
			}),
		prettierConfigOverride,
	});
