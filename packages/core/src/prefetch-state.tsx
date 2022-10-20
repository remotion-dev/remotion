import React, {createContext, useEffect, useState} from 'react';

type Value = Record<string, string>;

export const PreloadContext = createContext<Value>({});

let preloads: Record<string, string> = {};
let updaters: (() => void)[] = [];

export const setPreloads = (
	updater: (p: Record<string, string>) => Record<string, string>
) => {
	preloads = updater(preloads);
	updaters.forEach((u) => u());
};

export const PrefetchProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [_preloads, _setPreloads] = useState<Record<string, string>>(
		() => preloads
	);

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
