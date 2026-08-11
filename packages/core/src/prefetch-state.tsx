import React, {createContext, useEffect, useState} from 'react';

type Value = Record<string, string>;

export const PreloadContext = createContext<Value>({});

let preloads: Value = {};
let updaters: (() => void)[] = [];

export const setPreloads = (updater: (p: Value) => Value) => {
	preloads = updater(preloads);
	updaters.forEach((u) => u());
};

export const PrefetchProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [_preloads, _setPreloads] = useState<Value>(() => preloads);

	useEffect(() => {
		const updaterFunction = () => {
			_setPreloads(preloads);
		};

		updaters.push(updaterFunction);

		return () => {
			updaters = updaters.filter((u) => u !== updaterFunction);
		};
	}, []);

	return (
		<PreloadContext.Provider value={_preloads}>
			{children}
		</PreloadContext.Provider>
	);
};
