import React, {useContext, useEffect, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {callApi} from './call-api';
import type {TypeCanSaveState} from './RenderModal/get-render-modal-warnings';

type AllCompStates = {
	[key: string]: TypeCanSaveState;
};

export type TObserveDefaultPropsContext = {
	canSaveDefaultProps: TypeCanSaveState | null;
};

export const ObserveDefaultPropsContext =
	React.createContext<TObserveDefaultPropsContext | null>(null);

export const ObserveDefaultProps: React.FC<{
	readonly compositionId: string | null;
	readonly readOnlyStudio: boolean;
	readonly children: React.ReactNode;
}> = ({compositionId, readOnlyStudio, children}) => {
	const {previewServerState, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);

	const [canSaveDefaultPropsObjectState, setCanSaveDefaultProps] =
		useState<AllCompStates>({});

	const canSaveDefaultProps = useMemo(() => {
		if (compositionId === null) {
			return null;
		}

		return canSaveDefaultPropsObjectState[compositionId] ?? null;
	}, [canSaveDefaultPropsObjectState, compositionId]);

	const clientId =
		previewServerState.type === 'connected'
			? previewServerState.clientId
			: null;

	useEffect(() => {
		if (readOnlyStudio || !clientId || compositionId === null) {
			return;
		}

		callApi('/api/subscribe-to-default-props', {compositionId, clientId})
			.then((can) => {
				if (can.canUpdate) {
					setCanSaveDefaultProps((prevState) => ({
						...prevState,
						[compositionId]: {canUpdate: true},
					}));
				} else {
					setCanSaveDefaultProps((prevState) => ({
						...prevState,
						[compositionId]: {
							canUpdate: false,
							reason: can.reason,
							determined: true,
						},
					}));
				}
			})
			.catch((err) => {
				setCanSaveDefaultProps((prevState) => ({
					...prevState,
					[compositionId]: {
						canUpdate: false,
						reason: (err as Error).message,
						determined: true,
					},
				}));
			});

		return () => {
			callApi('/api/unsubscribe-from-default-props', {
				compositionId,
				clientId,
			}).catch(() => {
				// Ignore errors during cleanup
			});
		};
	}, [readOnlyStudio, clientId, compositionId]);

	useEffect(() => {
		const unsub = subscribeToEvent('default-props-updatable-changed', (e) => {
			if (e.type !== 'default-props-updatable-changed') {
				return;
			}

			if (e.compositionId !== compositionId) {
				return;
			}

			const {result} = e;
			if (result.canUpdate) {
				setCanSaveDefaultProps((prevState) => ({
					...prevState,
					[e.compositionId]: {canUpdate: true},
				}));
				Internals.editorPropsProviderRef.current?.setProps((prev) => ({
					...prev,
					[e.compositionId]: result.currentDefaultProps,
				}));
			} else {
				setCanSaveDefaultProps((prevState) => ({
					...prevState,
					[e.compositionId]: {
						canUpdate: false,
						reason: result.reason,
						determined: true,
					},
				}));
			}
		});

		return () => {
			unsub();
		};
	}, [subscribeToEvent, compositionId]);

	const value = useMemo(() => ({canSaveDefaultProps}), [canSaveDefaultProps]);

	return (
		<ObserveDefaultPropsContext.Provider value={value}>
			{children}
		</ObserveDefaultPropsContext.Provider>
	);
};
