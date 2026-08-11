import React, {createContext, useCallback, useMemo, useState} from 'react';

type Transform3DModeState = {
	readonly manuallyEnabledSequenceKeys: ReadonlySet<string>;
	readonly setManuallyEnabled: (sequenceKey: string, enabled: boolean) => void;
};

export const Transform3DModeStateContext = createContext<Transform3DModeState>({
	manuallyEnabledSequenceKeys: new Set(),
	setManuallyEnabled: () => undefined,
});

export const Transform3DModeStateProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [manuallyEnabledSequenceKeys, setManuallyEnabledSequenceKeys] =
		useState<ReadonlySet<string>>(() => new Set());
	const setManuallyEnabled = useCallback(
		(sequenceKey: string, enabled: boolean) => {
			setManuallyEnabledSequenceKeys((previous) => {
				const next = new Set(previous);
				if (enabled) {
					next.add(sequenceKey);
				} else {
					next.delete(sequenceKey);
				}

				return next;
			});
		},
		[],
	);
	const value = useMemo(
		() => ({manuallyEnabledSequenceKeys, setManuallyEnabled}),
		[manuallyEnabledSequenceKeys, setManuallyEnabled],
	);

	return (
		<Transform3DModeStateContext.Provider value={value}>
			{children}
		</Transform3DModeStateContext.Provider>
	);
};
