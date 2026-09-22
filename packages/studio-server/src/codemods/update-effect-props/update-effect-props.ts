import type {JSXAttribute} from '@babel/types';
import {
	CodemodsInternals,
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
} = CodemodsInternals;

const {findEffectsAttr: findEffectsAttrCodemod} = CodemodsInternals;

export const findEffectsAttr = (
	attrs: readonly (JSXAttribute | unknown)[],
): JSXAttribute | null => {
	return findEffectsAttrCodemod(
		attrs as Parameters<typeof findEffectsAttrCodemod>[0],
	);
};
