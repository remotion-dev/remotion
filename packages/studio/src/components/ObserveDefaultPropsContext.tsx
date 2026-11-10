import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {resolvedStackToSymbolicated} from '../helpers/resolved-stack-to-symbolicated';
import {
	subscribeToDefaultProps,
	unsubscribeFromDefaultProps,
} from './default-props-api';
import type {TypeCanSaveState} from './RenderModal/get-render-modal-warnings';
import {
	getCachedResolvedStack,
	hasResolvedStack,
	useResolvedStack,
} from './Timeline/use-resolved-stack';

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
	const {updateProps} = useContext(Internals.EditorPropsContext);
	const {compositions} = useContext(Internals.CompositionManager);
	const stack = compositions.find((c) => c.id === compositionId)?.stack ?? null;
	// Re-renders once the stack is resolved, including when it resolves to null.
	// The location is read from the shared cache, so it always belongs to the
	// current composition, not the previously selected one.
	useResolvedStack(stack);
	const resolvedLocation = getCachedResolvedStack(stack);
	const symbolicatedStack = useMemo(
		() => resolvedStackToSymbolicated(resolvedLocation),
		[resolvedLocation],
	);
	// Wait for the registration location so the server checks the right file
	const stackResolved = hasResolvedStack(stack);

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

	const lastAppliedDefaultProps = useRef<Record<string, string>>({});

	const applyResult = useCallback(
		(
			compId: string,
			result:
				| {canUpdate: true; currentDefaultProps: Record<string, unknown>}
				| {canUpdate: false; reason: string},
		) => {
			if (result.canUpdate) {
				setCanSaveDefaultProps((prevState) => ({
					...prevState,
					[compId]: {canUpdate: true},
				}));
				// Fast Refresh resubscribes and gets the same file contents again.
				// Applying them again would discard edits made since the last change.
				const serialized = JSON.stringify(result.currentDefaultProps);
				if (lastAppliedDefaultProps.current[compId] === serialized) {
					return;
				}

				lastAppliedDefaultProps.current[compId] = serialized;
				// Resolve `remotion-file:` and `remotion-date:` tokens that the
				// server emits for staticFile() and new Date() values
				const deserialized =
					NoReactInternals.deserializeJSONWithSpecialTypes<
						Record<string, unknown>
					>(serialized);
				updateProps({
					id: compId,
					defaultProps: deserialized,
					newProps: deserialized,
				});
			} else {
				setCanSaveDefaultProps((prevState) => ({
					...prevState,
					[compId]: {
						canUpdate: false,
						reason: result.reason,
						determined: true,
					},
				}));
			}
		},
		[updateProps],
	);

	useEffect(() => {
		if (
			(readOnlyStudio && !getBrowserStudioOperations()) ||
			!clientId ||
			compositionId === null ||
			!stackResolved
		) {
			return;
		}

		subscribeToDefaultProps({compositionId, clientId, symbolicatedStack})
			.then((can) => {
				applyResult(compositionId, can);
			})
			.catch((err) => {
				applyResult(compositionId, {
					canUpdate: false,
					reason: (err as Error).message,
				});
			});

		return () => {
			unsubscribeFromDefaultProps({
				compositionId,
				clientId,
			}).catch(() => {
				// Ignore errors during cleanup
			});
		};
	}, [
		readOnlyStudio,
		clientId,
		compositionId,
		applyResult,
		stackResolved,
		symbolicatedStack,
	]);

	useEffect(() => {
		const unsub = subscribeToEvent('default-props-updatable-changed', (e) => {
			if (e.type !== 'default-props-updatable-changed') {
				return;
			}

			if (e.compositionId !== compositionId) {
				return;
			}

			applyResult(e.compositionId, e.result);
		});

		return () => {
			unsub();
		};
	}, [subscribeToEvent, compositionId, applyResult]);

	const value = useMemo(() => ({canSaveDefaultProps}), [canSaveDefaultProps]);

	return (
		<ObserveDefaultPropsContext.Provider value={value}>
			{children}
		</ObserveDefaultPropsContext.Provider>
	);
};
