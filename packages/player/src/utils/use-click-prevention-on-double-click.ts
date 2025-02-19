import type {SyntheticEvent} from 'react';
import {useCallback, useMemo} from 'react';
import {cancellablePromise} from './cancellable-promise.js';
import {delay} from './delay.js';
import {useCancellablePromises} from './use-cancellable-promises.js';

type ReturnVal = {
	handlePointerDown: (
		e: SyntheticEvent<Element, PointerEvent> | PointerEvent,
	) => void;
	handleDoubleClick: () => void;
};

const useClickPreventionOnDoubleClick = (
	onClick: (e: PointerEvent | SyntheticEvent<Element, PointerEvent>) => void,
	onDoubleClick: () => void,
	doubleClickToFullscreen: boolean,
): ReturnVal => {
	const api = useCancellablePromises();

	const handleClick = useCallback(
		async (e: SyntheticEvent<Element, PointerEvent> | PointerEvent) => {
			// UnSupported double click on touch.(mobile)
			if (
				e instanceof PointerEvent
					? e.pointerType === 'touch'
					: (e.nativeEvent as PointerEvent).pointerType === 'touch'
			) {
				onClick(e);
				return;
			}

			api.clearPendingPromises();
			const waitForClick = cancellablePromise(delay(200));
			api.appendPendingPromise(waitForClick);

			try {
				await waitForClick.promise;
				api.removePendingPromise(waitForClick);
				onClick(e);
			} catch (errorInfo) {
				const info = errorInfo as {isCanceled: boolean; error: Error};

				api.removePendingPromise(waitForClick);
				if (!info.isCanceled) {
					throw info.error;
				}
			}
		},
		[api, onClick],
	);

	const handlePointerDown = useCallback(() => {
		document.addEventListener(
			'pointerup',
			(newEvt) => {
				handleClick(newEvt);
			},
			{
				once: true,
			},
		);
	}, [handleClick]);

	const handleDoubleClick = useCallback(() => {
		api.clearPendingPromises();
		onDoubleClick();
	}, [api, onDoubleClick]);

	const returnValue = useMemo((): ReturnVal => {
		if (!doubleClickToFullscreen) {
			return {handlePointerDown: onClick, handleDoubleClick: () => undefined};
		}

		return {handlePointerDown, handleDoubleClick};
	}, [doubleClickToFullscreen, handleDoubleClick, handlePointerDown, onClick]);

	return returnValue;
};

export {useClickPreventionOnDoubleClick};
