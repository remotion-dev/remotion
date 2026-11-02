import {useCallback, useState} from 'react';
import {noop} from '../../helpers/noop';

export const useRenderFrameInput = (
	initial: number | null,
	fallback: number,
	max: number,
) => {
	const [committed, setCommitted] = useState(initial);
	const [preview, setPreview] = useState<number | null>(null);
	const committedFrame = Math.max(
		0,
		Math.min(max, Math.floor(committed ?? fallback)),
	);
	const onValueChangeEnd = useCallback(
		(frame: number) => {
			if (frame !== committedFrame) {
				setCommitted(frame);
			}

			setPreview(null);
		},
		[committedFrame],
	);
	const onValueChangeCancel = useCallback(() => setPreview(null), []);

	return {
		value:
			preview === null ? committedFrame : Math.max(0, Math.min(max, preview)),
		integerOnly: true,
		step: 1,
		onTextChange: noop,
		onValueChange: setPreview,
		onValueChangeEnd,
		onValueChangeCancel,
	};
};

export type RenderFrameInput = ReturnType<typeof useRenderFrameInput>;
