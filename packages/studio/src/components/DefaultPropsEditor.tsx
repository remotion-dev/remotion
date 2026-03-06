import {useContext, useEffect, useMemo, useState} from 'react';
import type {_InternalTypes} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {callApi} from './call-api';
import type {PropsEditType} from './RenderModal/DataEditor';
import {DataEditor} from './RenderModal/DataEditor';
import {
	defaultTypeCanSaveState,
	type TypeCanSaveState,
} from './RenderModal/get-render-modal-warnings';

type AllCompStates = {
	[key: string]: TypeCanSaveState;
};

export const DefaultPropsEditor = ({
	unresolvedComposition,
	defaultProps,
	setDefaultProps,
	mayShowSaveButton,
	propsEditType,
	saving,
	setSaving,
	readOnlyStudio,
}: {
	readonly unresolvedComposition: _InternalTypes['AnyComposition'];
	readonly defaultProps: Record<string, unknown>;
	readonly setDefaultProps: React.Dispatch<
		React.SetStateAction<Record<string, unknown>>
	>;
	readonly mayShowSaveButton: boolean;
	readonly propsEditType: PropsEditType;
	readonly saving: boolean;
	readonly setSaving: React.Dispatch<React.SetStateAction<boolean>>;
	readonly readOnlyStudio: boolean;
}) => {
	const [canSaveDefaultPropsObjectState, setCanSaveDefaultProps] =
		useState<AllCompStates>({
			[unresolvedComposition.id]: defaultTypeCanSaveState,
		});

	const canSaveDefaultProps = useMemo(() => {
		return canSaveDefaultPropsObjectState[unresolvedComposition.id]
			? canSaveDefaultPropsObjectState[unresolvedComposition.id]
			: defaultTypeCanSaveState;
	}, [canSaveDefaultPropsObjectState, unresolvedComposition.id]);

	const showSaveButton = mayShowSaveButton && canSaveDefaultProps.canUpdate;

	const {previewServerState, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);

	const clientId =
		previewServerState.type === 'connected'
			? previewServerState.clientId
			: null;

	useEffect(() => {
		if (readOnlyStudio || !clientId) {
			setCanSaveDefaultProps((prevState) => ({
				...prevState,
				[unresolvedComposition.id]: {
					canUpdate: false,
					reason: readOnlyStudio
						? 'Read-only studio'
						: 'Not connected to server',
					determined: true,
				},
			}));
			return;
		}

		const compositionId = unresolvedComposition.id;
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
	}, [readOnlyStudio, clientId, unresolvedComposition.id]);

	useEffect(() => {
		const unsub = subscribeToEvent('default-props-updatable-changed', (e) => {
			if (e.type !== 'default-props-updatable-changed') {
				return;
			}

			if (e.compositionId !== unresolvedComposition.id) {
				return;
			}

			const {result} = e;
			if (result.canUpdate) {
				setCanSaveDefaultProps((prevState) => ({
					...prevState,
					[e.compositionId]: {canUpdate: true},
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
	}, [subscribeToEvent, unresolvedComposition.id]);

	return (
		<DataEditor
			unresolvedComposition={unresolvedComposition}
			defaultProps={defaultProps}
			setDefaultProps={setDefaultProps}
			propsEditType={propsEditType}
			saving={saving}
			setSaving={setSaving}
			showSaveButton={showSaveButton}
			canSaveDefaultProps={canSaveDefaultProps}
		/>
	);
};
