import {
	updateEffectKeyframes as updateEffectKeyframesCodemod,
	updateSequenceKeyframes as updateSequenceKeyframesCodemod,
} from '@remotion/studio-codemods';
import {formatFileContent} from '../format-file-content';

export {
	type EffectKeyframeUpdate,
	type IntroducedKeyframeIdentifiers,
	type KeyframeOperation,
	type SequenceKeyframeUpdate,
	updateEffectKeyframesAst,
	updateSequenceKeyframesAst,
} from '@remotion/studio-codemods';

type UpdateSequenceKeyframesInput = Omit<
	Parameters<typeof updateSequenceKeyframesCodemod>[0],
	'formatFile'
>;

type UpdateEffectKeyframesInput = Omit<
	Parameters<typeof updateEffectKeyframesCodemod>[0],
	'formatFile'
>;

const formatKeyframesFile = ({
	contents,
	prettierConfigOverride,
}: {
	contents: string;
	prettierConfigOverride: Record<string, unknown> | null;
}) =>
	formatFileContent({
		input: contents,
		prettierConfigOverride,
	});

export const updateSequenceKeyframes = (input: UpdateSequenceKeyframesInput) =>
	updateSequenceKeyframesCodemod({...input, formatFile: formatKeyframesFile});

export const updateEffectKeyframes = (input: UpdateEffectKeyframesInput) =>
	updateEffectKeyframesCodemod({...input, formatFile: formatKeyframesFile});
