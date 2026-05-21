import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {_InternalTypes, SerializedJSONWithCustomFields} from 'remotion';
import {getInputProps} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BACKGROUND, BLUE, BORDER_COLOR, LIGHT_TEXT} from '../../helpers/colors';
import {useZodIfPossible} from '../get-zod-if-possible';
import {Flex, Spacing} from '../layout';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import type {TypeCanSaveState} from './get-render-modal-warnings';
import {getRenderModalWarnings} from './get-render-modal-warnings';
import {RenderModalJSONPropsEditor} from './RenderModalJSONPropsEditor';
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
import type {UpdaterFunction} from './SchemaEditor/ZodSwitch';
import {WarningIndicatorButton} from './WarningIndicatorButton';

type Mode = 'json' | 'schema';

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

const resolveLinkStyle: React.CSSProperties = {
	color: BLUE,
	fontSize: 13,
	fontFamily: 'sans-serif',
	textDecoration: 'underline',
	whiteSpace: 'nowrap',
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
	readonly setDefaultProps: UpdaterFunction<Record<string, unknown>>;
	readonly propsEditType: PropsEditType;
	readonly canSaveDefaultProps: TypeCanSaveState | null;
}> = ({
	unresolvedComposition,
	defaultProps,
	setDefaultProps,
	propsEditType,
	canSaveDefaultProps,
}) => {
	const [mode, setMode] = useState<Mode>('schema');
	const [showWarning, setShowWarningWithoutPersistance] = useState<boolean>(
		() => getPersistedShowWarningState(),
	);

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
	}, [mode]);

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
							<React.Fragment key={warning.id}>
								<Spacing y={1} />
								<ValidationMessage
									align="flex-start"
									type="warning"
									message={
										warning.resolveLink ? (
											<>
												{warning.message}{' '}
												<a
													href={warning.resolveLink}
													target="_blank"
													rel="noopener noreferrer"
													style={resolveLinkStyle}
												>
													Resolve.
												</a>
											</>
										) : (
											warning.message
										)
									}
								/>
							</React.Fragment>
						))
					: null}
			</div>

			{mode === 'schema' ? (
				<SchemaEditor
					value={defaultProps}
					setValue={setDefaultProps}
					schema={schema}
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
				/>
			)}
		</div>
	);
};
