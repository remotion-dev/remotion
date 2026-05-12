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
		previous.every(
			(p, i) =>
				p.definition === effects[i].definition && p.stack === effects[i].stack,
		);

	if (isSame) {
		return previous;
	}

	const next: EffectDefinitionAndStack<unknown>[] = effects.map((e) => ({
		definition: e.definition,
		stack: e.stack,
	}));
	previousRef.current = next;
	return next;
};
