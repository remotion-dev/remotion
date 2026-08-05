import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {flushSync} from 'react-dom';
import {FastRefreshContext} from './fast-refresh-context';
import {
	FAST_REFRESH_COMPLETE_EVENT,
	FAST_REFRESH_START_EVENT,
} from './hot-middleware-client/fast-refresh-events';

declare const __webpack_module__: {
	hot: {
		addStatusHandler(callback: (status: string) => void): void;
	};
};

export const FastRefreshProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [fastRefreshes, setFastRefreshes] = useState(0);
	const [fastRefreshGeneration, setFastRefreshGeneration] = useState(0);
	const [isFastRefreshing, setIsFastRefreshing] = useState(false);
	const [manualRefreshes, setManualRefreshes] = useState(0);

	const increaseManualRefreshes = useCallback(() => {
		setManualRefreshes((i) => i + 1);
	}, []);

	useEffect(() => {
		const onFastRefreshStart = () => {
			flushSync(() => {
				setIsFastRefreshing(true);
				setFastRefreshGeneration((generation) => generation + 1);
			});
		};

		const onFastRefreshComplete = () => {
			setIsFastRefreshing(false);
		};

		window.addEventListener(FAST_REFRESH_START_EVENT, onFastRefreshStart);
		window.addEventListener(FAST_REFRESH_COMPLETE_EVENT, onFastRefreshComplete);

		if (typeof __webpack_module__ !== 'undefined') {
			if (__webpack_module__.hot) {
				__webpack_module__.hot.addStatusHandler((status) => {
					if (status === 'idle') {
						setFastRefreshes((i) => i + 1);
					}
				});
			}
		}

		return () => {
			window.removeEventListener(FAST_REFRESH_START_EVENT, onFastRefreshStart);
			window.removeEventListener(
				FAST_REFRESH_COMPLETE_EVENT,
				onFastRefreshComplete,
			);
		};
	}, []);

	const value = useMemo(
		() => ({
			fastRefreshes,
			fastRefreshGeneration,
			isFastRefreshing,
			manualRefreshes,
			increaseManualRefreshes,
		}),
		[
			fastRefreshes,
			fastRefreshGeneration,
			isFastRefreshing,
			manualRefreshes,
			increaseManualRefreshes,
		],
	);

	return (
		<FastRefreshContext.Provider value={value}>
			{children}
		</FastRefreshContext.Provider>
	);
};
