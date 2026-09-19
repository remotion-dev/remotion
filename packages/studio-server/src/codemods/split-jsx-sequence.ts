import {
	splitJsxSequence as splitJsxSequenceCodemod,
	splitJsxSequences as splitJsxSequencesCodemod,
} from '@remotion/studio-codemods/internal';
import type {SequenceNodePath} from 'remotion';

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
		prettierConfigOverride,
	});

export const splitJsxSequences = ({
	input,
	splits,
	prettierConfigOverride,
}: {
	input: string;
	splits: Array<{
		nodePath: SequenceNodePath;
		sequenceKeys: string[];
		splitFrame: number;
	}>;
	prettierConfigOverride?: Record<string, unknown> | null;
}) =>
	splitJsxSequencesCodemod({
		input,
		splits,
		prettierConfigOverride,
	});
