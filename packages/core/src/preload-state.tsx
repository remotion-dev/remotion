import React, {
	createContext,
	createRef,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';

type Value = {
	preloads: Record<string, string>;
	setPreloads: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

export const preloadRef = createRef<{
	setPreloads: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}>();

export const PreloadContext = createContext<Value>({
	preloads: {},
	setPreloads: () => undefined,
});

export const PreloadProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [preloads, setPreloads] = useState<Record<string, string>>({});

	const value: Value = useMemo(() => {
		return {
			preloads,
			setPreloads,
		};
	}, [preloads]);

	useImperativeHandle(preloadRef, () => {
		return {
			setPreloads,
		};
	});

	return (
		<PreloadContext.Provider value={value}>{children}</PreloadContext.Provider>
	);
};
