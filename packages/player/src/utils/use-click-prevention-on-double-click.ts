import {cancellablePromise} from './cancellable-promise';
import {delay} from './delay';
import {useCancellablePromises} from './use-cancellable-promises';

const useClickPreventionOnDoubleClick = (
	onClick: () => void,
	onDoubleClick: () => void
) => {
	const api = useCancellablePromises();

	const handleClick = () => {
		api.clearPendingPromises();
		const waitForClick = cancellablePromise(delay(300));
		api.appendPendingPromise(waitForClick);

		return waitForClick.promise
			.then(() => {
				api.removePendingPromise(waitForClick);
				onClick();
			})
			.catch((errorInfo) => {
				api.removePendingPromise(waitForClick);
				if (!errorInfo.isCanceled) {
					throw errorInfo.error;
				}
			});
	};

	const handleDoubleClick = () => {
		api.clearPendingPromises();
		onDoubleClick();
	};

	return [handleClick, handleDoubleClick];
};

export {useClickPreventionOnDoubleClick};
