import type {JSXAttribute} from '@babel/types';
import {
	CodeModsInternals,
	type EffectArrayElement,
	type EffectPropUpdate,
	type PropDelta,
	type UpdateEffectPropsResult,
} from '@remotion/codemods';

export type {
	EffectArrayElement,
	EffectPropUpdate,
	PropDelta,
	UpdateEffectPropsResult,
};

export const {
	enumerateEffectArrayElements,
	findEffectCallExpression,
	updateEffectProps,
	updateEffectPropsAst,
} = CodeModsInternals;

const {findEffectsAttr: findEffectsAttrCodemod} = CodeModsInternals;

export const findEffectsAttr = (
	attrs: readonly (JSXAttribute | unknown)[],
): JSXAttribute | null => {
	return findEffectsAttrCodemod(
		attrs as Parameters<typeof findEffectsAttrCodemod>[0],
	);
};
