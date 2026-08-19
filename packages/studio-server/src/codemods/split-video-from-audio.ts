import {splitVideoFromAudio as splitVideoFromAudioCodemod} from '@remotion/studio-codemods';
import type {SequenceNodePath} from 'remotion';
import {formatFileContent} from './format-file-content';

export const splitVideoFromAudio = ({
	input,
	nodePath,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
	prettierConfigOverride?: Record<string, unknown> | null;
}) =>
	splitVideoFromAudioCodemod({
		input,
		nodePath,
		formatFile: ({contents, prettierConfigOverride: override}) =>
			formatFileContent({
				input: contents,
				prettierConfigOverride: override,
			}),
		prettierConfigOverride,
	});
