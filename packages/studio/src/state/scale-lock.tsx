import React, {useCallback, useMemo, useState} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';

const makeScaleLockKey = ({
	fieldKey,
	nodePath,
}: {
	readonly fieldKey: string;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => `${Internals.makeSequencePropsSubscriptionKey(nodePath)}.${fieldKey}`;

export type ScaleLockContextValue = {
	readonly getScaleLockState: ({
		defaultValue,
		fieldKey,
		nodePath,
	}: {
		readonly defaultValue: boolean;
		readonly fieldKey: string;
		readonly nodePath: SequencePropsSubscriptionKey;
	}) => boolean;
	readonly setScaleLockState: ({
		fieldKey,
		linked,
		nodePath,
	}: {
		readonly fieldKey: string;
		readonly linked: boolean;
		readonly nodePath: SequencePropsSubscriptionKey;
	}) => void;
};

export const ScaleLockContext = React.createContext<ScaleLockContextValue>({
	getScaleLockState: ({defaultValue}) => defaultValue,
	setScaleLockState: () => undefined,
});

export const ScaleLockProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [states, setStates] = useState<Record<string, boolean>>({});

	const getScaleLockState = useCallback<
		ScaleLockContextValue['getScaleLockState']
	>(
		({defaultValue, fieldKey, nodePath}) => {
			const key = makeScaleLockKey({fieldKey, nodePath});
			return states[key] ?? defaultValue;
		},
		[states],
	);

	const setScaleLockState = useCallback<
		ScaleLockContextValue['setScaleLockState']
	>(({fieldKey, linked, nodePath}) => {
		const key = makeScaleLockKey({fieldKey, nodePath});
		setStates((current) => ({...current, [key]: linked}));
	}, []);

	const value = useMemo(
		() => ({getScaleLockState, setScaleLockState}),
		[getScaleLockState, setScaleLockState],
	);

	return (
		<ScaleLockContext.Provider value={value}>
			{children}
		</ScaleLockContext.Provider>
	);
};
