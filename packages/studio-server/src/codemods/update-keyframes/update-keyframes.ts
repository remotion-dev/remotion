import {
	updateEffectKeyframes as updateEffectKeyframesCodemod,
	updateSequenceKeyframes as updateSequenceKeyframesCodemod,
} from '@remotion/codemods/internal';

export {
	type EffectKeyframeUpdate,
	type IntroducedKeyframeIdentifiers,
	type KeyframeOperation,
	type SequenceKeyframeUpdate,
	updateEffectKeyframesAst,
	updateSequenceKeyframesAst,
} from '@remotion/codemods/internal';

type UpdateSequenceKeyframesInput = Omit<
	Parameters<typeof updateSequenceKeyframesCodemod>[0],
	'formatFile'
>;

type UpdateEffectKeyframesInput = Omit<
	Parameters<typeof updateEffectKeyframesCodemod>[0],
	'formatFile'
>;

export const updateSequenceKeyframes = (input: UpdateSequenceKeyframesInput) =>
	updateSequenceKeyframesCodemod(input);

export const updateEffectKeyframes = (input: UpdateEffectKeyframesInput) =>
	updateEffectKeyframesCodemod(input);
