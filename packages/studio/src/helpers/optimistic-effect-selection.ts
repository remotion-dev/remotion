import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';

type EffectSelection = {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly id: string;
};
type SelectEffects = (
	items: readonly EffectSelection[],
	reveal: boolean,
) => void;
let selectEffects: SelectEffects | null = null;

export const registerOptimisticEffectSelection = (callback: SelectEffects) => {
	selectEffects = callback;
	return () => {
		if (selectEffects === callback) selectEffects = null;
	};
};

export const selectOptimisticEffects = (
	items: readonly EffectSelection[],
	reveal: boolean,
) => selectEffects?.(items, reveal);
export const selectOptimisticEffect = (
	nodePathInfo: SequenceNodePathInfo,
	id: string,
	reveal: boolean,
) => selectOptimisticEffects([{nodePathInfo, id}], reveal);
