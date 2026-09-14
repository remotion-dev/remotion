import {splitJsxSequence as splitJsxSequenceCodemod} from '@remotion/studio-codemods';
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
