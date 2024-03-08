import type {SyntheticEvent} from 'react';
import {useCallback, useMemo} from 'react';
import {cancellablePromise} from './cancellable-promise.js';
import {delay} from './delay.js';
import {useCancellablePromises} from './use-cancellable-promises.js';

const useClickPreventionOnDoubleClick = (
	onClick: (e: SyntheticEvent) => void,
	onDoubleClick: () => void,
	doubleClickToFullscreen: boolean,
): [(e: SyntheticEvent) => void, () => void] => {
	const api = useCancellablePromises();

	const handleClick = useCallback(
		async (e: SyntheticEvent) => {
			// UnSupported double click on touch.(mobile)
			if ((e.nativeEvent as PointerEvent).pointerType === 'touch') {
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

	const handleDoubleClick = useCallback(() => {
		api.clearPendingPromises();
		onDoubleClick();
	}, [api, onDoubleClick]);

	const returnValue = useMemo((): [(e: SyntheticEvent) => void, () => void] => {
		if (!doubleClickToFullscreen) {
			return [onClick, () => undefined];
		}

		return [handleClick, handleDoubleClick];
	}, [doubleClickToFullscreen, handleClick, handleDoubleClick, onClick]);

	return returnValue;
};

export {useClickPreventionOnDoubleClick};
