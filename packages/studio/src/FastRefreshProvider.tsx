import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FastRefreshContext} from './fast-refresh-context';

declare const __webpack_module__: {
	hot: {
		addStatusHandler(callback: (status: string) => void): void;
	};
};

export const FastRefreshProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [fastRefreshes, setFastRefreshes] = useState(0);
	const [manualRefreshes, setManualRefreshes] = useState(0);

	const increaseManualRefreshes = useCallback(() => {
		setManualRefreshes((i) => i + 1);
	}, []);

	useEffect(() => {
		if (typeof __webpack_module__ !== 'undefined') {
			if (__webpack_module__.hot) {
				__webpack_module__.hot.addStatusHandler((status) => {
					if (status === 'idle') {
						setFastRefreshes((i) => i + 1);
					}
				});
			}
		}
	}, []);

	const value = useMemo(
		() => ({fastRefreshes, manualRefreshes, increaseManualRefreshes}),
		[fastRefreshes, manualRefreshes, increaseManualRefreshes],
	);

	return (
		<FastRefreshContext.Provider value={value}>
			{children}
		</FastRefreshContext.Provider>
	);
};
