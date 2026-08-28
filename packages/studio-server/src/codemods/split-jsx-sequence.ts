import {
	splitJsxSequence as splitJsxSequenceCodemod,
	splitJsxSequences as splitJsxSequencesCodemod,
} from '@remotion/studio-codemods';
import type {SequenceNodePath} from 'remotion';
import {formatFileContent} from './format-file-content';

export const splitJsxSequence = ({
	input,
	nodePath,
	sequenceKeys,
	splitFrame,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
	sequenceKeys: string[];
	splitFrame: number;
	prettierConfigOverride?: Record<string, unknown> | null;
}) =>
	splitJsxSequenceCodemod({
		input,
		nodePath,
		sequenceKeys,
		splitFrame,
		formatFile: ({contents, prettierConfigOverride: override}) =>
			formatFileContent({
				input: contents,
				prettierConfigOverride: override,
			}),
		prettierConfigOverride,
	});

export const splitJsxSequences = ({
	input,
	splits,
	splitFrame,
	prettierConfigOverride,
}: {
	input: string;
	splits: Array<{
		nodePath: SequenceNodePath;
		sequenceKeys: string[];
	}>;
	splitFrame: number;
	prettierConfigOverride?: Record<string, unknown> | null;
}) =>
	splitJsxSequencesCodemod({
		input,
		splits,
		splitFrame,
		formatFile: ({contents, prettierConfigOverride: override}) =>
			formatFileContent({
				input: contents,
				prettierConfigOverride: override,
			}),
		prettierConfigOverride,
	});
