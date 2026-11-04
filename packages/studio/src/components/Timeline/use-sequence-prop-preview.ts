import {useCallback, useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {createCanvasDragPreview} from '../canvas-drag-preview';

export const useSequencePropPreview = () => {
	const {updateDragOverrides, setPropStatuses, setPropStatusesBatch} =
		useContext(Internals.VisualModeSettersContext);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const active = useRef<ReturnType<typeof createCanvasDragPreview> | null>(
		null,
	);
	const getPreview = useCallback(() => {
		if (active.current === null) {
			active.current = createCanvasDragPreview({
				updateDragOverrides,
				setPropStatuses,
				setPropStatusesBatch,
				getPropStatuses: (nodePath) =>
					propStatusesRef.current[
						Internals.makeSequencePropsSubscriptionKey(nodePath)
					],
			});
		}

		return active.current;
	}, [
		updateDragOverrides,
		setPropStatuses,
		setPropStatusesBatch,
		propStatusesRef,
	]);
	const takePreview = useCallback(() => {
		const preview = getPreview();
		active.current = null;
		return preview;
	}, [getPreview]);
	const cancelPreview = useCallback(() => {
		active.current?.cancel();
		active.current = null;
	}, []);
	useEffect(() => cancelPreview, [cancelPreview]);
	return {getPreview, takePreview, cancelPreview};
};
