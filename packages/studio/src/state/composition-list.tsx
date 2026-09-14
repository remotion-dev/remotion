import React, {createContext, useMemo, useState} from 'react';

type CompositionListState = 'loading' | 'ready';

export const compositionListRenderedRef = {current: false};

export const CompositionListContext = createContext<{
	compositionListState: CompositionListState;
	setCompositionListState: React.Dispatch<
		React.SetStateAction<CompositionListState>
	>;
}>({
	compositionListState: 'loading',
	setCompositionListState: () => {
		throw new Error('CompositionListContext provider is missing');
	},
});

export const CompositionListProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [compositionListState, setCompositionListState] =
		useState<CompositionListState>(() => {
			compositionListRenderedRef.current = false;
			return 'loading';
		});
	const value = useMemo(
		() => ({compositionListState, setCompositionListState}),
		[compositionListState],
	);

	return (
		<CompositionListContext.Provider value={value}>
			{children}
		</CompositionListContext.Provider>
	);
};
