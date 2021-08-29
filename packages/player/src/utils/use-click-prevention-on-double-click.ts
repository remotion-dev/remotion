import {SyntheticEvent, useCallback, useMemo} from 'react';
import {cancellablePromise} from './cancellable-promise';
import {delay} from './delay';
import {useCancellablePromises} from './use-cancellable-promises';

const useClickPreventionOnDoubleClick = (
	onClick: (e: SyntheticEvent) => void,
	onDoubleClick: () => void,
	doubleClickToFullscreen: boolean
): [(e: SyntheticEvent) => void, () => void] => {
	const api = useCancellablePromises();

	const handleClick = useCallback(async () => {
		api.clearPendingPromises();
		const waitForClick = cancellablePromise(delay(200));
		api.appendPendingPromise(waitForClick);

		try {
			await waitForClick.promise;
			api.removePendingPromise(waitForClick);
			onClick(e);
		} catch (errorInfo) {
			api.removePendingPromise(waitForClick);
			if (!errorInfo.isCanceled) {
				throw errorInfo.error;
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
