import React, {useCallback, useMemo, useState} from 'react';
import {
	CheckerboardContext,
	loadCheckerboardOption,
	persistCheckerboardOption,
} from '../state/checkerboard';

export const CheckerboardProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [checkerboard, setCheckerboardState] = useState(() =>
		loadCheckerboardOption(),
	);

	const setCheckerboard = useCallback(
		(newValue: (prevState: boolean) => boolean) => {
			setCheckerboardState((prevState) => {
				const newVal = newValue(prevState);
				persistCheckerboardOption(newVal);
				return newVal;
			});
		},
		[],
	);

	const checkerboardCtx = useMemo(() => {
		return {
			checkerboard,
			setCheckerboard,
		};
	}, [checkerboard, setCheckerboard]);

	return (
		<CheckerboardContext.Provider value={checkerboardCtx}>
			{children}
		</CheckerboardContext.Provider>
	);
};
