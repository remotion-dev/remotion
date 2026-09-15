import type {JSXAttribute} from '@babel/types';
import {findEffectsAttr as findEffectsAttrCodemod} from '@remotion/studio-codemods';

export {
	enumerateEffectArrayElements,
	findEffectCallExpression,
	type EffectArrayElement,
	type EffectPropUpdate,
	type PropDelta,
	type UpdateEffectPropsResult,
	updateEffectProps,
	updateEffectPropsAst,
} from '@remotion/studio-codemods';

export const findEffectsAttr = (
	attrs: readonly (JSXAttribute | unknown)[],
): JSXAttribute | null => {
	return findEffectsAttrCodemod(
		attrs as Parameters<typeof findEffectsAttrCodemod>[0],
	);
};
