import {CodemodInternals} from '@remotion/codemods';
import type {SequenceNodePath} from 'remotion';

const {
	splitJsxSequence: splitJsxSequenceCodemod,
	splitJsxSequences: splitJsxSequencesCodemod,
} = CodemodInternals;

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
