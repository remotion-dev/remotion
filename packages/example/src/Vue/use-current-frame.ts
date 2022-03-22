import {SequenceContextType, TimelineContextValue} from 'remotion';
import {computed, inject, Ref} from 'vue';

export const useCurrentFrame = () => {
	const timelineContext = inject(
		'remotion.timelineContext'
	) as Ref<TimelineContextValue>;
	const context = inject(
		'remotion.sequenceContext'
	) as Ref<SequenceContextType | null>;

	return computed(() => {
		const frame = timelineContext.value.frame;
		const contextOffset = context.value
			? context.value.cumulatedFrom + context.value.relativeFrom
			: 0;

		return frame - contextOffset;
	});
};
