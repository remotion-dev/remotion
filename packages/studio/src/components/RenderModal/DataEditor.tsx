import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {_InternalTypes, SerializedJSONWithCustomFields} from 'remotion';
import {getInputProps, Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BACKGROUND, BORDER_COLOR, LIGHT_TEXT} from '../../helpers/colors';
import {callApi} from '../call-api';
import {useZodIfPossible, useZodTypesIfPossible} from '../get-zod-if-possible';
import {Flex, Spacing} from '../layout';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {showNotification} from '../Notifications/NotificationCenter';
import {callUpdateDefaultPropsApi} from '../RenderQueue/actions';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import type {TypeCanSaveState} from './get-render-modal-warnings';
import {
	defaultTypeCanSaveState,
	getRenderModalWarnings,
} from './get-render-modal-warnings';
import {RenderModalJSONPropsEditor} from './RenderModalJSONPropsEditor';
import {extractEnumJsonPaths} from './SchemaEditor/extract-enum-json-paths';
import {SchemaEditor} from './SchemaEditor/SchemaEditor';
import {
	NoDefaultProps,
	NoSchemaDefined,
	ZodNotInstalled,
} from './SchemaEditor/SchemaErrorMessages';
import type {
	AnyZodSchema,
	ZodSafeParseResult,
} from './SchemaEditor/zod-schema-type';
import {getZodSchemaType, zodSafeParse} from './SchemaEditor/zod-schema-type';
import {WarningIndicatorButton} from './WarningIndicatorButton';

type Mode = 'json' | 'schema';

type AllCompStates = {
	[key: string]: TypeCanSaveState;
};

export type State =
	| {
			str: string;
			value: Record<string, unknown>;
			validJSON: true;
			zodValidation: ZodSafeParseResult;
	  }
	| {
			str: string;
			validJSON: false;
			error: string;
	  };

export type PropsEditType = 'input-props' | 'default-props';

const errorExplanation: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
};

const explainer: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	padding: '0 12px',
	justifyContent: 'center',
	alignItems: 'center',
	textAlign: 'center',
};

const outer: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	overflow: 'hidden',
	backgroundColor: BACKGROUND,
};

const controlContainer: React.CSSProperties = {
	flexDirection: 'column',
	display: 'flex',
	padding: 12,
	borderBottom: `1px solid ${BORDER_COLOR}`,
};

const tabWrapper: React.CSSProperties = {
	display: 'flex',
	marginBottom: '4px',
	flexDirection: 'row',
	alignItems: 'center',
};

const persistanceKey = 'remotion.show-render-modalwarning';

const getPersistedShowWarningState = () => {
	const val = localStorage.getItem(persistanceKey);
	if (!val) {
		return true;
	}

	return val === 'true';
};

const setPersistedShowWarningState = (val: boolean) => {
	localStorage.setItem(persistanceKey, String(Boolean(val)));
};

export const DataEditor: React.FC<{
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
}> = ({
	unresolvedComposition,
	defaultProps,
	setDefaultProps,
	mayShowSaveButton,
	propsEditType,
	saving,
	setSaving,
	readOnlyStudio,
}) => {
	const [mode, setMode] = useState<Mode>('schema');
	const [showWarning, setShowWarningWithoutPersistance] = useState<boolean>(
		() => getPersistedShowWarningState(),
	);
	const {updateCompositionDefaultProps} = useContext(
		Internals.CompositionSetters,
	);

	const inJSONEditor = mode === 'json';
	const serializedJSON: SerializedJSONWithCustomFields | null = useMemo(() => {
		if (!inJSONEditor) {
			return null;
		}

		const value = defaultProps;
		return NoReactInternals.serializeJSONWithSpecialTypes({
			data: value,
			indent: 2,
			staticBase: window.remotion_staticBase,
		});
	}, [inJSONEditor, defaultProps]);

	const cliProps = getInputProps();
	const [canSaveDefaultPropsObjectState, setCanSaveDefaultProps] =
		useState<AllCompStates>({
			[unresolvedComposition.id]: defaultTypeCanSaveState,
		});

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

	const zodValidationResult = useMemo(() => {
		if (schema === 'no-zod') {
			return 'no-zod' as const;
		}

		if (schema === 'no-schema') {
			return 'no-schema' as const;
		}

		return zodSafeParse(schema, defaultProps);
	}, [defaultProps, schema]);

	const setShowWarning: React.Dispatch<React.SetStateAction<boolean>> =
		useCallback((val) => {
			setShowWarningWithoutPersistance((prevVal) => {
				if (typeof val === 'boolean') {
					setPersistedShowWarningState(val);
					return val;
				}

				setPersistedShowWarningState(val(prevVal));
				return val(prevVal);
			});
		}, []);

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
					updateCompositionDefaultProps(compositionId, can.currentDefaultProps);
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
	}, [
		readOnlyStudio,
		clientId,
		unresolvedComposition.id,
		updateCompositionDefaultProps,
	]);

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
				updateCompositionDefaultProps(
					e.compositionId,
					result.currentDefaultProps,
				);
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
	}, [
		subscribeToEvent,
		unresolvedComposition.id,
		updateCompositionDefaultProps,
	]);

	const modeItems = useMemo((): SegmentedControlItem[] => {
		return [
			{
				key: 'schema',
				label: 'Schema',
				onClick: () => {
					setMode('schema');
				},
				selected: mode === 'schema',
			},
			{
				key: 'json',
				label: 'JSON',
				onClick: () => {
					setMode('json');
				},
				selected: mode === 'json',
			},
		];
	}, [mode]);

	const onUpdate = useCallback(() => {
		if (schema === 'no-zod' || schema === 'no-schema' || z === null) {
			showNotification('Cannot update default props: No Zod schema', 2000);
			return;
		}

		callUpdateDefaultPropsApi(
			unresolvedComposition.id,
			defaultProps,
			extractEnumJsonPaths({schema, zodRuntime: z, currentPath: [], zodTypes}),
		).then((response) => {
			if (!response.success) {
				showNotification(
					`Cannot update default props: ${response.reason}`,
					2000,
				);
			}
		});
	}, [schema, z, unresolvedComposition.id, defaultProps, zodTypes]);

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
			updateCompositionDefaultProps(unresolvedComposition.id, newDefaultProps);
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
						updateCompositionDefaultProps(
							unresolvedComposition.id,
							oldDefaultProps,
						);
					}
				})
				.catch((err) => {
					showNotification(`Cannot update default props: ${err.message}`, 2000);
					updateCompositionDefaultProps(
						unresolvedComposition.id,
						oldDefaultProps,
					);
				})
				.finally(() => {
					setSaving(false);
				});
		},
		[
			schema,
			z,
			zodTypes,
			setSaving,
			unresolvedComposition.defaultProps,
			unresolvedComposition.id,
			updateCompositionDefaultProps,
		],
	);

	const connectionStatus = previewServerState.type;

	const warnings = useMemo(() => {
		return getRenderModalWarnings({
			canSaveDefaultProps,
			cliProps,
			isCustomDateUsed: serializedJSON ? serializedJSON.customDateUsed : false,
			customFileUsed: serializedJSON ? serializedJSON.customFileUsed : false,
			inJSONEditor,
			propsEditType,
			jsMapUsed: serializedJSON ? serializedJSON.mapUsed : false,
			jsSetUsed: serializedJSON ? serializedJSON.setUsed : false,
		});
	}, [
		cliProps,
		canSaveDefaultProps,
		inJSONEditor,
		propsEditType,
		serializedJSON,
	]);

	if (connectionStatus === 'disconnected') {
		return (
			<div style={explainer}>
				<Spacing y={5} />
				<div style={errorExplanation}>
					The studio server has disconnected. Reconnect to edit the schema.
				</div>
				<Spacing y={2} block />
			</div>
		);
	}

	if (schema === 'no-zod') {
		return <ZodNotInstalled />;
	}

	if (schema === 'no-schema') {
		return <NoSchemaDefined />;
	}

	if (!z) {
		throw new Error('expected zod');
	}

	if (zodValidationResult === 'no-zod') {
		throw new Error('expected zod');
	}

	if (zodValidationResult === 'no-schema') {
		throw new Error('expected schema');
	}

	const typeName = getZodSchemaType(schema);

	if (typeName === 'any') {
		return <NoSchemaDefined />;
	}

	if (!unresolvedComposition.defaultProps) {
		return <NoDefaultProps />;
	}

	return (
		<div style={outer}>
			<div style={controlContainer}>
				<div style={tabWrapper}>
					<SegmentedControl items={modeItems} needsWrapping={false} />
					<Flex />
					{warnings.length > 0 ? (
						<WarningIndicatorButton
							setShowWarning={setShowWarning}
							showWarning={showWarning}
							warningCount={warnings.length}
						/>
					) : null}
				</div>
				{showWarning && warnings.length > 0
					? warnings.map((warning) => (
							<React.Fragment key={warning}>
								<Spacing y={1} />
								<ValidationMessage
									message={warning}
									align="flex-start"
									type="warning"
								/>
							</React.Fragment>
						))
					: null}
			</div>

			{mode === 'schema' ? (
				<SchemaEditor
					unsavedDefaultProps={defaultProps}
					setValue={setDefaultProps}
					schema={schema}
					zodValidationResult={zodValidationResult}
					savedDefaultProps={unresolvedComposition.defaultProps}
					onSave={onSave}
					showSaveButton={showSaveButton}
					saving={saving}
					saveDisabledByParent={!zodValidationResult.success}
				/>
			) : (
				<RenderModalJSONPropsEditor
					value={defaultProps ?? {}}
					setValue={setDefaultProps}
					onSave={onUpdate}
					showSaveButton={showSaveButton}
					serializedJSON={serializedJSON}
					defaultProps={unresolvedComposition.defaultProps}
					schema={schema}
				/>
			)}
		</div>
	);
};
