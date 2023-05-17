import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {AnyComposition} from 'remotion';
import {getInputProps, Internals} from 'remotion';
import type {z} from 'zod';
import {PreviewServerConnectionCtx} from '../../helpers/client-id';
import {BORDER_COLOR, LIGHT_TEXT} from '../../helpers/colors';
import {useZodIfPossible} from '../get-zod-if-possible';
import {Flex, Spacing} from '../layout';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {sendErrorNotification} from '../Notifications/NotificationCenter';
import {
	canUpdateDefaultProps,
	updateDefaultProps,
} from '../RenderQueue/actions';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import type {TypeCanSaveState} from './get-render-modal-warnings';
import {
	defaultTypeCanSaveState,
	getRenderModalWarnings,
} from './get-render-modal-warnings';
import {RenderModalJSONPropsEditor} from './RenderModalJSONPropsEditor';
import {extractEnumJsonPaths} from './SchemaEditor/extract-enum-json-paths';
import type {SerializedJSONWithCustomFields} from './SchemaEditor/input-props-serialization';
import {
	deserializeJSONWithCustomFields,
	serializeJSONWithDate,
} from './SchemaEditor/input-props-serialization';
import {SchemaEditor} from './SchemaEditor/SchemaEditor';
import {
	NoDefaultProps,
	NoSchemaDefined,
	ZodNotInstalled,
} from './SchemaEditor/SchemaErrorMessages';
import {WarningIndicatorButton} from './WarningIndicatorButton';

type Mode = 'json' | 'schema';

type AllCompStates = {
	[key: string]: TypeCanSaveState;
};

export type State =
	| {
			str: string;
			value: unknown;
			validJSON: true;
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

const parseJSON = (str: string): State => {
	try {
		const value = deserializeJSONWithCustomFields(str);
		return {str, value, validJSON: true};
	} catch (e) {
		return {str, validJSON: false, error: (e as Error).message};
	}
};

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

export const RenderModalData: React.FC<{
	composition: AnyComposition;
	inputProps: unknown;
	setInputProps: React.Dispatch<React.SetStateAction<unknown>>;
	compact: boolean;
	mayShowSaveButton: boolean;
	propsEditType: PropsEditType;
}> = ({
	composition,
	inputProps,
	setInputProps,
	compact,
	mayShowSaveButton,
	propsEditType,
}) => {
	const [mode, setMode] = useState<Mode>('schema');
	const [valBeforeSafe, setValBeforeSafe] = useState<unknown>(inputProps);
	const [saving, setSaving] = useState(false);
	const [showWarning, setShowWarningWithoutPersistance] = useState<boolean>(
		() => getPersistedShowWarningState()
	);

	const inJSONEditor = mode === 'json';
	const serializedJSON: SerializedJSONWithCustomFields | null = useMemo(() => {
		if (!inJSONEditor) {
			return null;
		}

		const value = inputProps ?? {};
		return serializeJSONWithDate({
			data: value,
			indent: 2,
			staticBase: window.remotion_staticBase,
		});
	}, [inJSONEditor, inputProps]);

	const cliProps = getInputProps();
	const [canSaveDefaultProps, setCanSaveDefaultProps] = useState<AllCompStates>(
		{
			[composition.id]: defaultTypeCanSaveState,
		}
	);

	const z = useZodIfPossible();

	const schema = useMemo(() => {
		if (!z) {
			return 'no-zod' as const;
		}

		if (!composition.schema) {
			return z.any();
		}

		if (!(typeof composition.schema.safeParse === 'function')) {
			throw new Error(
				'A value which is not a Zod schema was passed to `schema`'
			);
		}

		return composition.schema;
	}, [composition.schema, z]);

	const zodValidationResult = useMemo(() => {
		if (schema === 'no-zod') {
			return 'no-zod' as const;
		}

		return schema.safeParse(inputProps);
	}, [inputProps, schema]);

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

	const derivedCurrentState = useMemo(() => {
		return canSaveDefaultProps[composition.id]
			? canSaveDefaultProps[composition.id]
			: defaultTypeCanSaveState;
	}, [canSaveDefaultProps, composition.id]);

	const showSaveButton = mayShowSaveButton && derivedCurrentState.canUpdate;

	const {fastRefreshes} = useContext(Internals.NonceContext);

	useEffect(() => {
		canUpdateDefaultProps(composition.id)
			.then((can) => {
				if (can.canUpdate) {
					setCanSaveDefaultProps((prevState) => ({
						...prevState,
						[composition.id]: {
							canUpdate: true,
						},
					}));
				} else {
					setCanSaveDefaultProps((prevState) => ({
						...prevState,
						[composition.id]: {
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
					[composition.id]: {
						canUpdate: false,
						reason: (err as Error).message,
						determined: true,
					},
				}));
			});
	}, [composition.id]);

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

	const switchToSchema = useCallback(() => {
		setMode('schema');
	}, []);

	const onUpdate = useCallback(() => {
		if (schema === 'no-zod' || z === null) {
			sendErrorNotification('Cannot update default props: No Zod schema');
			return;
		}

		setValBeforeSafe(inputProps);
		updateDefaultProps(
			composition.id,
			inputProps,
			extractEnumJsonPaths(schema, z, [])
		);
	}, [composition.id, inputProps, schema, z]);

	useEffect(() => {
		setSaving(false);
	}, [fastRefreshes]);

	const onSave = useCallback(
		(updater: (oldState: unknown) => unknown) => {
			if (schema === 'no-zod' || z === null) {
				sendErrorNotification('Cannot update default props: No Zod schema');
				return;
			}

			setSaving(true);
			updateDefaultProps(
				composition.id,
				updater(composition.defaultProps),
				extractEnumJsonPaths(schema, z, [])
			).catch((err) => {
				sendErrorNotification(`Cannot update default props: ${err.message}`);
				setSaving(false);
			});
		},
		[composition.defaultProps, composition.id, schema, z]
	);

	const connectionStatus = useContext(PreviewServerConnectionCtx).type;

	const warnings = useMemo(() => {
		return getRenderModalWarnings({
			canSaveDefaultProps: derivedCurrentState,
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
		derivedCurrentState,
		inJSONEditor,
		propsEditType,
		serializedJSON,
	]);

	if (connectionStatus === 'disconnected') {
		return (
			<div style={explainer}>
				<Spacing y={5} />
				<div style={errorExplanation}>
					The preview server has disconnected. Reconnect to edit the schema.
				</div>
				<Spacing y={2} block />
			</div>
		);
	}

	if (schema === 'no-zod') {
		return <ZodNotInstalled />;
	}

	if (!z) {
		throw new Error('expected zod');
	}

	if (zodValidationResult === 'no-zod') {
		throw new Error('expected zod');
	}

	const def: z.ZodTypeDef = schema._def;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typeName = (def as any).typeName as z.ZodFirstPartyTypeKind;

	if (typeName === z.ZodFirstPartyTypeKind.ZodAny) {
		return <NoSchemaDefined />;
	}

	if (!composition.defaultProps) {
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
					value={inputProps}
					setValue={setInputProps}
					schema={schema}
					zodValidationResult={zodValidationResult}
					compact={compact}
					defaultProps={composition.defaultProps}
					onSave={onSave}
					showSaveButton={showSaveButton}
					saving={saving}
				/>
			) : (
				<RenderModalJSONPropsEditor
					value={inputProps ?? {}}
					setValue={setInputProps}
					zodValidationResult={zodValidationResult}
					switchToSchema={switchToSchema}
					onSave={onUpdate}
					valBeforeSafe={valBeforeSafe}
					showSaveButton={showSaveButton}
					serializedJSON={serializedJSON}
					parseJSON={parseJSON}
				/>
			)}
		</div>
	);
};
