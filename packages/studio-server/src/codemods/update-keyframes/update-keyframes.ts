import {
	CodemodInternals,
	type EffectKeyframeUpdate,
	type IntroducedKeyframeIdentifiers,
	type KeyframeOperation,
	type SequenceKeyframeUpdate,
} from '@remotion/codemods';

export type {
	EffectKeyframeUpdate,
	IntroducedKeyframeIdentifiers,
	KeyframeOperation,
	SequenceKeyframeUpdate,
};

export const {updateEffectKeyframesAst, updateSequenceKeyframesAst} =
	CodemodInternals;

const {
	updateEffectKeyframes: updateEffectKeyframesCodemod,
	updateSequenceKeyframes: updateSequenceKeyframesCodemod,
} = CodemodInternals;

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
