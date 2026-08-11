import {REACT_REFRESH_FINISHED_EVENT} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {flushSync} from 'react-dom';
import {FastRefreshContext} from './fast-refresh-context';

export const FastRefreshProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [fastRefreshes, setFastRefreshes] = useState(0);
	const [manualRefreshes, setManualRefreshes] = useState(0);

	const increaseManualRefreshes = useCallback(() => {
		setManualRefreshes((i) => i + 1);
	}, []);

	useEffect(() => {
		const onReactRefreshFinished = () => {
			// Commit consumers and their layout effects before the browser paints
			// the refreshed composition with stale node-path statuses.
			flushSync(() => {
				setFastRefreshes((i) => i + 1);
			});
		};

		window.addEventListener(
			REACT_REFRESH_FINISHED_EVENT,
			onReactRefreshFinished,
		);
		return () => {
			window.removeEventListener(
				REACT_REFRESH_FINISHED_EVENT,
				onReactRefreshFinished,
			);
		};
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
