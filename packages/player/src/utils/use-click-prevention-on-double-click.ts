import {useCallback, useMemo} from 'react';
import {cancellablePromise} from './cancellable-promise';
import {delay} from './delay';
import {useCancellablePromises} from './use-cancellable-promises';

const useClickPreventionOnDoubleClick = (
	onClick: () => void,
	onDoubleClick: () => void,
	doubleClickToFullscreen: boolean
): [() => void, () => void] => {
	const api = useCancellablePromises();

	const handleClick = useCallback(async () => {
		api.clearPendingPromises();
		const waitForClick = cancellablePromise(delay(200));
		api.appendPendingPromise(waitForClick);

		try {
			await waitForClick.promise;
			api.removePendingPromise(waitForClick);
			onClick();
		} catch (errorInfo) {
			api.removePendingPromise(waitForClick);
			const info = errorInfo as {isCanceled: boolean; error: Error};
			if (!info.isCanceled) {
				throw info.error;
			}
		}
	}, [api, onClick]);

	const handleDoubleClick = useCallback(() => {
		api.clearPendingPromises();
		onDoubleClick();
	}, [api, onDoubleClick]);

	const returnValue = useMemo((): [() => void, () => void] => {
		if (!doubleClickToFullscreen) {
			return [onClick, onDoubleClick];
		}

		return [handleClick, handleDoubleClick];
	}, [
		doubleClickToFullscreen,
		handleClick,
		handleDoubleClick,
		onClick,
		onDoubleClick,
	]);

	return returnValue;
};

export {useClickPreventionOnDoubleClick};
