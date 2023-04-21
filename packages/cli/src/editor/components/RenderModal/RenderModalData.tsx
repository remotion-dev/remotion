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
import {Spacing} from '../layout';
import {
	canUpdateDefaultProps,
	updateDefaultProps,
} from '../RenderQueue/actions';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {RenderModalJSONInputPropsEditor} from './RenderModalJSONInputPropsEditor';
import {SchemaEditor} from './SchemaEditor/SchemaEditor';
import {
	NoDefaultProps,
	NoSchemaDefined,
} from './SchemaEditor/SchemaErrorMessages';
import {WarningIndicatorButton} from './WarningIndicatorButton';

type Mode = 'json' | 'schema';

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

const spacer: React.CSSProperties = {
	flex: 1,
};

type TypeCanSaveState =
	| {
			canUpdate: true;
	  }
	| {
			canUpdate: false;
			reason: string;
			determined: boolean;
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
	const [showWarning, setShowWarning] = useState<boolean>(true);
	const cliProps = getInputProps();
	const [canSaveDefaultProps, setCanSaveDefaultProps] =
		useState<TypeCanSaveState>({
			canUpdate: false,
			reason: 'Loading...',
			determined: false,
		});

	const showSaveButton = mayShowSaveButton && canSaveDefaultProps.canUpdate;

	// TODO: Update if root file is updated
	// TODO: Segment the state for different compositions

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

	const warningCount = useMemo(() => {
		let count = 0;
		if (Object.keys(cliProps).length > 0) {
			count += 1;
		}

		if (
			canSaveDefaultProps.canUpdate === false &&
			canSaveDefaultProps.determined
		) {
			count += 1;
		}

		return count;
	}, [canSaveDefaultProps, cliProps]);
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
					<div style={spacer} />
					<WarningIndicatorButton
						setShowWarning={setShowWarning}
						showWarning={showWarning}
						warningCount={warningCount}
					/>
				</div>
				{Object.keys(cliProps).length > 0 && showWarning ? (
					<>
						<Spacing y={1} />
						<ValidationMessage
							message="The data that was passed using --props takes priority over the data you enter here."
							align="flex-start"
							type="warning"
						/>
					</>
				) : null}
				{showWarning &&
				canSaveDefaultProps.canUpdate === false &&
				canSaveDefaultProps.determined ? (
					<>
						<Spacing y={1} />
						<ValidationMessage
							message={`Can't save default props: ${canSaveDefaultProps.reason}`}
							align="flex-start"
							type="warning"
						/>
					</>
				) : null}
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
				<RenderModalJSONInputPropsEditor
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
