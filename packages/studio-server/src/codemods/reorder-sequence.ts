import {reorderSequence as reorderSequenceCodemod} from '@remotion/studio-codemods';
import type {ReorderSequencePosition} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';
import {formatFileContent} from './format-file-content';

export const reorderSequence = ({
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
}) =>
	reorderSequenceCodemod({
		input,
		sourceNodePath,
		targetNodePath,
		position,
		formatFile: ({contents, prettierConfigOverride: override}) =>
			formatFileContent({
				input: contents,
				prettierConfigOverride: override,
			}),
		prettierConfigOverride,
	});
