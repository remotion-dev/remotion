import {useRef} from 'react';
import type {
	EffectDefinitionAndStack,
	EffectDescriptor,
} from './effect-types.js';

export const useMemoizedEffects = (
	effects: EffectDescriptor<unknown>[],
): EffectDefinitionAndStack<unknown>[] => {
	const previousRef = useRef<EffectDefinitionAndStack<unknown>[] | null>(null);

	const previous = previousRef.current;
	const isSame =
		previous !== null &&
		previous.length === effects.length &&
		// Note: If p.stack changes, we don't update.
		// We hope this is fine because we assume we cannot fast refresh and change the nodePath
		previous.every(
			(p, i) =>
				p.definition === effects[i].definition &&
				p.effectKey === effects[i].effectKey,
		);

	if (isSame) {
		return previous;
	}

	const next: EffectDefinitionAndStack<unknown>[] = effects.map((e) => ({
		definition: e.definition,
		stack: e.stack,
		effectKey: e.effectKey,
		params: e.params,
	}));
	previousRef.current = next;
	return next;
};
