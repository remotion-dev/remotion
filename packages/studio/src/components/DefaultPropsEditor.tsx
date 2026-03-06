import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {_InternalTypes} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {callApi} from './call-api';
import {useZodIfPossible, useZodTypesIfPossible} from './get-zod-if-possible';
import {showNotification} from './Notifications/NotificationCenter';
import type {PropsEditType} from './RenderModal/DataEditor';
import {DataEditor} from './RenderModal/DataEditor';
import {
	defaultTypeCanSaveState,
	type TypeCanSaveState,
} from './RenderModal/get-render-modal-warnings';
import {extractEnumJsonPaths} from './RenderModal/SchemaEditor/extract-enum-json-paths';
import type {AnyZodSchema} from './RenderModal/SchemaEditor/zod-schema-type';
import {callUpdateDefaultPropsApi} from './RenderQueue/actions';

type AllCompStates = {
	[key: string]: TypeCanSaveState;
};

export const DefaultPropsEditor = ({
	unresolvedComposition,
	defaultProps,
	setDefaultProps,
	propsEditType,
	readOnlyStudio,
}: {
	readonly unresolvedComposition: _InternalTypes['AnyComposition'];
	readonly defaultProps: Record<string, unknown>;
	readonly setDefaultProps: React.Dispatch<
		React.SetStateAction<Record<string, unknown>>
	>;
	readonly propsEditType: PropsEditType;
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

	const {previewServerState, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);

	const z = useZodIfPossible();
	const zodTypes = useZodTypesIfPossible();

	const schema = useMemo(() => {
		if (!z) {
			return 'no-zod' as const;
		}

		if (!unresolvedComposition.schema) {
			return 'no-schema' as const;
		}

		if (
			!(
				typeof (unresolvedComposition.schema as {safeParse?: unknown})
					.safeParse === 'function'
			)
		) {
			throw new Error(
				'A value which is not a Zod schema was passed to `schema`',
			);
		}

		return unresolvedComposition.schema as AnyZodSchema;
	}, [unresolvedComposition.schema, z]);

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

	const [saving, setSaving] = useState(false);

	const onSave = useCallback(
		(
			updater: (oldState: Record<string, unknown>) => Record<string, unknown>,
		) => {
			if (schema === 'no-zod' || schema === 'no-schema' || z === null) {
				showNotification('Cannot update default props: No Zod schema', 2000);
				return;
			}

			setSaving(true);
			const oldDefaultProps = unresolvedComposition.defaultProps ?? {};
			const newDefaultProps = updater(oldDefaultProps);
			callUpdateDefaultPropsApi(
				unresolvedComposition.id,
				newDefaultProps,
				extractEnumJsonPaths({
					schema,
					zodRuntime: z,
					currentPath: [],
					zodTypes,
				}),
			)
				.then((response) => {
					if (!response.success) {
						// eslint-disable-next-line no-console
						console.log(response.stack);
						showNotification(
							`Cannot update default props: ${response.reason}. See console for more information.`,
							2000,
						);
					}
				})
				.catch((err) => {
					showNotification(`Cannot update default props: ${err.message}`, 2000);
				})
				.finally(() => {
					setSaving(false);
				});
		},
		[
			schema,
			setSaving,
			unresolvedComposition.defaultProps,
			unresolvedComposition.id,
			z,
			zodTypes,
		],
	);

	console.log('onSave', onSave, saving);

	return (
		<DataEditor
			unresolvedComposition={unresolvedComposition}
			defaultProps={defaultProps}
			setDefaultProps={setDefaultProps}
			propsEditType={propsEditType}
			canSaveDefaultProps={canSaveDefaultProps}
		/>
	);
};
