import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {_InternalTypes, SerializedJSONWithCustomFields} from 'remotion';
import {getInputProps} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BACKGROUND, BLUE, BLACK_HEX, LIGHT_TEXT} from '../../helpers/colors';
import {CompactExplanation} from '../CompactExplanation';
import {useZodIfPossible} from '../get-zod-if-possible';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import {Flex, Spacing} from '../layout';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import type {
	RenderModalWarning,
	TypeCanSaveState,
} from './get-render-modal-warnings';
import {getRenderModalWarnings} from './get-render-modal-warnings';
import {RenderModalJSONPropsEditor} from './RenderModalJSONPropsEditor';
import {SchemaEditor} from './SchemaEditor/SchemaEditor';
import {
	NoDefaultProps,
	NoSchemaDefined,
	type SchemaErrorMode,
	ZodNotInstalled,
} from './SchemaEditor/SchemaErrorMessages';
import type {
	AnyZodSchema,
	ZodSafeParseResult,
} from './SchemaEditor/zod-schema-type';
import {getZodSchemaType, zodSafeParse} from './SchemaEditor/zod-schema-type';
import type {UpdaterFunction} from './SchemaEditor/ZodSwitch';
import {WarningIndicatorButton} from './WarningIndicatorButton';

export type {RenderModalWarning};

export type DataEditorMode = 'json' | 'schema';

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
export type DataEditorLayout = 'default' | 'inspector';

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
	padding: 12,
	alignItems: 'flex-start',
	textAlign: 'left',
};

const outer: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	overflow: 'hidden',
	backgroundColor: BACKGROUND,
};

const inspectorOuter: React.CSSProperties = {
	...outer,
	flex: 'none',
	overflow: 'visible',
};

const controlContainer: React.CSSProperties = {
	flexDirection: 'column',
	display: 'flex',
	padding: 12,
	borderBottom: `1px solid ${BLACK_HEX}`,
};

const inspectorControlContainer: React.CSSProperties = {
	...controlContainer,
	borderBottom: 'none',
};

const tabWrapper: React.CSSProperties = {
	display: 'flex',
	marginBottom: '4px',
	flexDirection: 'row',
	alignItems: 'center',
};

const resolveLinkStyle: React.CSSProperties = {
	color: BLUE,
	fontSize: 13,
	fontFamily: 'sans-serif',
	textDecoration: 'underline',
	whiteSpace: 'nowrap',
};

const compactResolveLinkStyle: React.CSSProperties = {
	...resolveLinkStyle,
	fontSize: 12,
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

export const useDataEditorWarnings = ({
	canSaveDefaultProps,
	defaultProps,
	mode,
	propsEditType,
	showCannotSaveDefaultPropsWarning,
}: {
	readonly canSaveDefaultProps: TypeCanSaveState | null;
	readonly defaultProps: Record<string, unknown>;
	readonly mode: DataEditorMode;
	readonly propsEditType: PropsEditType;
	readonly showCannotSaveDefaultPropsWarning: boolean;
}) => {
	const inJSONEditor = mode === 'json';
	const serializedJSON: SerializedJSONWithCustomFields | null = useMemo(() => {
		if (!inJSONEditor) {
			return null;
		}

		return NoReactInternals.serializeJSONWithSpecialTypes({
			data: defaultProps,
			indent: 2,
			staticBase: window.remotion_staticBase,
		});
	}, [inJSONEditor, defaultProps]);

	const cliProps = getInputProps();

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
			showCannotSaveDefaultPropsWarning,
		});
	}, [
		cliProps,
		canSaveDefaultProps,
		inJSONEditor,
		propsEditType,
		serializedJSON,
		showCannotSaveDefaultPropsWarning,
	]);

	return {serializedJSON, warnings};
};

export const useDataEditorWarningVisibility = () => {
	const [showWarning, setShowWarningWithoutPersistance] = useState<boolean>(
		() => getPersistedShowWarningState(),
	);

	const setShowWarning: React.Dispatch<React.SetStateAction<boolean>> =
		useCallback((val) => {
			setShowWarningWithoutPersistance((prevVal) => {
				if (typeof val === 'boolean') {
					setPersistedShowWarningState(val);
					return val;
				}

				const nextVal = val(prevVal);
				setPersistedShowWarningState(nextVal);
				return nextVal;
			});
		}, []);

	return {setShowWarning, showWarning};
};

export const DataEditor: React.FC<{
	readonly unresolvedComposition: _InternalTypes['AnyComposition'];
	readonly defaultProps: Record<string, unknown>;
	readonly setDefaultProps: UpdaterFunction<Record<string, unknown>>;
	readonly propsEditType: PropsEditType;
	readonly canSaveDefaultProps: TypeCanSaveState | null;
	readonly schemaErrorMode?: SchemaErrorMode;
	readonly layout?: DataEditorLayout;
	readonly mode?: DataEditorMode;
	readonly onModeChange?: (mode: DataEditorMode) => void;
	readonly hideModeControls?: boolean;
	readonly warnings?: RenderModalWarning[];
	readonly showWarning?: boolean;
	readonly setShowWarning?: React.Dispatch<React.SetStateAction<boolean>>;
	readonly hideWarningButton?: boolean;
}> = ({
	unresolvedComposition,
	defaultProps,
	setDefaultProps,
	propsEditType,
	canSaveDefaultProps,
	schemaErrorMode = 'full',
	layout = 'default',
	mode: controlledMode,
	onModeChange,
	hideModeControls = false,
	warnings: controlledWarnings,
	showWarning: controlledShowWarning,
	setShowWarning: controlledSetShowWarning,
	hideWarningButton = false,
}) => {
	const [internalMode, setInternalMode] = useState<DataEditorMode>('schema');

	const mode = controlledMode ?? internalMode;
	const setMode = useCallback(
		(nextMode: DataEditorMode) => {
			if (onModeChange) {
				onModeChange(nextMode);
				return;
			}

			setInternalMode(nextMode);
		},
		[onModeChange],
	);

	const {
		setShowWarning: internalSetShowWarning,
		showWarning: internalShowWarning,
	} = useDataEditorWarningVisibility();
	const showWarning = controlledShowWarning ?? internalShowWarning;
	const setShowWarning = controlledSetShowWarning ?? internalSetShowWarning;
	const {serializedJSON, warnings: computedWarnings} = useDataEditorWarnings({
		canSaveDefaultProps,
		defaultProps,
		mode,
		propsEditType,
		showCannotSaveDefaultPropsWarning: true,
	});
	const warnings = controlledWarnings ?? computedWarnings;

	const jsonEditorSetValue: React.Dispatch<
		React.SetStateAction<Record<string, unknown>>
	> = useCallback(
		(newProps) => {
			setDefaultProps(
				typeof newProps === 'function' ? newProps : () => newProps,
				{shouldSave: false},
			);
		},
		[setDefaultProps],
	);

	const onSave = useCallback(() => {
		setDefaultProps((p) => p, {shouldSave: true});
	}, [setDefaultProps]);

	const z = useZodIfPossible();

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

	const {previewServerState} = useContext(StudioServerConnectionCtx);

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
	}, [mode, setMode]);

	const connectionStatus = previewServerState.type;

	if (connectionStatus === 'disconnected') {
		const message =
			'The studio server has disconnected. Reconnect to edit the schema.';

		if (schemaErrorMode === 'compact') {
			return <CompactExplanation>{message}</CompactExplanation>;
		}

		return (
			<div style={explainer}>
				<Spacing y={5} />
				<div style={errorExplanation}>{message}</div>
				<Spacing y={2} block />
			</div>
		);
	}

	if (schema === 'no-zod') {
		return <ZodNotInstalled mode={schemaErrorMode} />;
	}

	if (schema === 'no-schema') {
		return <NoSchemaDefined mode={schemaErrorMode} />;
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
		return <NoSchemaDefined mode={schemaErrorMode} />;
	}

	if (!unresolvedComposition.defaultProps) {
		return <NoDefaultProps mode={schemaErrorMode} />;
	}

	const shouldRenderControlRow =
		!hideModeControls || (!hideWarningButton && warnings.length > 0);
	const shouldRenderWarningMessages = showWarning && warnings.length > 0;
	const compactLayout = layout === 'inspector';

	return (
		<div style={layout === 'inspector' ? inspectorOuter : outer}>
			{shouldRenderControlRow || shouldRenderWarningMessages ? (
				<div
					style={
						layout === 'inspector'
							? inspectorControlContainer
							: controlContainer
					}
				>
					{shouldRenderControlRow ? (
						<div style={tabWrapper}>
							{hideModeControls ? null : (
								<SegmentedControl items={modeItems} needsWrapping={false} />
							)}
							<Flex />
							{!hideWarningButton && warnings.length > 0 ? (
								<WarningIndicatorButton
									setShowWarning={setShowWarning}
									showWarning={showWarning}
									warningCount={warnings.length}
								/>
							) : null}
						</div>
					) : null}
					{shouldRenderWarningMessages
						? warnings.map((warning) => (
								<React.Fragment key={warning.id}>
									<Spacing y={1} />
									<ValidationMessage
										message={warning.message}
										align="flex-start"
										type="warning"
										size={compactLayout ? 'compact' : 'default'}
										action={
											warning.resolveLink ? (
												<a
													href={warning.resolveLink}
													target="_blank"
													rel="noopener noreferrer"
													style={
														compactLayout
															? compactResolveLinkStyle
															: resolveLinkStyle
													}
												>
													Resolve
												</a>
											) : null
										}
									/>
								</React.Fragment>
							))
						: null}
				</div>
			) : null}

			{mode === 'schema' ? (
				<SchemaEditor
					value={defaultProps}
					setValue={setDefaultProps}
					schema={schema}
					scrollableContainer={!compactLayout}
					contentInset={
						compactLayout ? INSPECTOR_PANEL_HORIZONTAL_PADDING : undefined
					}
					errorMode={schemaErrorMode}
				/>
			) : (
				<RenderModalJSONPropsEditor
					value={defaultProps ?? {}}
					setValue={jsonEditorSetValue}
					onSave={onSave}
					serializedJSON={serializedJSON}
					defaultProps={unresolvedComposition.defaultProps}
					schema={schema}
					compositionId={unresolvedComposition.id}
					layout={layout}
				/>
			)}
		</div>
	);
};
