import {
	updateEffectKeyframes as updateEffectKeyframesCodemod,
	updateSequenceKeyframes as updateSequenceKeyframesCodemod,
} from '@remotion/studio-codemods';

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

export const updateSequenceKeyframes = (input: UpdateSequenceKeyframesInput) =>
	updateSequenceKeyframesCodemod(input);

export const updateEffectKeyframes = (input: UpdateEffectKeyframesInput) =>
	updateEffectKeyframesCodemod(input);
