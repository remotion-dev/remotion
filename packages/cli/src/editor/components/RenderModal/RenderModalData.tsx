import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {AnyComposition} from 'remotion';
import {getInputProps, z} from 'remotion';
import {BORDER_COLOR, LIGHT_TEXT} from '../../helpers/colors';
import {ValidationMessage} from '../NewComposition/ValidationMessage';

import {PreviewServerConnectionCtx} from '../../helpers/client-id';
import {Flex, Spacing} from '../layout';
import {
	canUpdateDefaultProps,
	updateDefaultProps,
} from '../RenderQueue/actions';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import type {TypeCanSaveState} from './get-render-modal-warnings';
import {getRenderModalWarnings} from './get-render-modal-warnings';
import {RenderModalJSONPropsEditor} from './RenderModalJSONPropsEditor';
import {SchemaEditor} from './SchemaEditor/SchemaEditor';
import {
	NoDefaultProps,
	NoSchemaDefined,
} from './SchemaEditor/SchemaErrorMessages';
import {WarningIndicatorButton} from './WarningIndicatorButton';

type Mode = 'json' | 'schema';

export type PropsEditType = 'inputProps' | 'defaultProps';

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
}> = ({composition, inputProps, setInputProps, compact, mayShowSaveButton}) => {
	const [mode, setMode] = useState<Mode>('schema');
	const [valBeforeSafe, setValBeforeSafe] = useState<unknown>(inputProps);
	const zodValidationResult = useMemo(() => {
		return composition.schema.safeParse(inputProps);
	}, [composition.schema, inputProps]);
	const [showWarning, setShowWarningWithoutPersistance] = useState<boolean>(
		() => getPersistedShowWarningState()
	);
	const cliProps = getInputProps();
	const [canSaveDefaultProps, setCanSaveDefaultProps] =
		useState<TypeCanSaveState>({
			canUpdate: false,
			reason: 'Loading...',
			determined: false,
		});

	const propsEditType: PropsEditType = compact ? 'defaultProps' : 'inputProps';

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

	const showSaveButton = mayShowSaveButton && canSaveDefaultProps.canUpdate;

	useEffect(() => {
		canUpdateDefaultProps(composition.id)
			.then((can) => {
				if (can.canUpdate) {
					setCanSaveDefaultProps({
						canUpdate: true,
					});
				} else {
					setCanSaveDefaultProps({
						canUpdate: false,
						reason: can.reason,
						determined: true,
					});
				}
			})
			.catch((err) => {
				setCanSaveDefaultProps({
					canUpdate: false,
					reason: (err as Error).message,
					determined: true,
				});
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
		setValBeforeSafe(inputProps);
		updateDefaultProps(composition.id, inputProps);
	}, [composition.id, inputProps]);

	const onSave = useCallback(
		(updater: (oldState: unknown) => unknown) => {
			updateDefaultProps(composition.id, updater(composition.defaultProps));
		},
		[composition.defaultProps, composition.id]
	);

	const connectionStatus = useContext(PreviewServerConnectionCtx).type;

	const warnings = useMemo(() => {
		return getRenderModalWarnings({
			canSaveDefaultProps,
			cliProps,
			propsEditType,
		});
	}, [canSaveDefaultProps, cliProps, propsEditType]);

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

	const def: z.ZodTypeDef = composition.schema._def;
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
					schema={composition.schema}
					zodValidationResult={zodValidationResult}
					compact={compact}
					defaultProps={composition.defaultProps}
					onSave={onSave}
					showSaveButton={showSaveButton}
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
				/>
			)}
		</div>
	);
};
