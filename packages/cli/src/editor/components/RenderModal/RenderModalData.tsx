import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {AnyComposition} from 'remotion';
import {getInputProps} from 'remotion';
import {BORDER_COLOR} from '../../helpers/colors';
import {ValidationMessage} from '../NewComposition/ValidationMessage';

import {Spacing} from '../layout';
import {
	canUpdateDefaultProps,
	updateDefaultProps,
} from '../RenderQueue/actions';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {RenderModalJSONInputPropsEditor} from './RenderModalJSONInputPropsEditor';
import {SchemaEditor} from './SchemaEditor/SchemaEditor';

type Mode = 'json' | 'schema';

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
};

const spacer: React.CSSProperties = {
	flex: 1,
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

	const cliProps = getInputProps();
	const [canSaveDefaultProps, setCanSaveDefaultProps] = useState(false);

	const showSaveButton = mayShowSaveButton && canSaveDefaultProps;

	// TODO: Show reason
	// TODO: Update if root file is updated
	useEffect(() => {
		canUpdateDefaultProps(composition.id)
			.then((can) => {
				setCanSaveDefaultProps(can.canUpdate);
			})
			.catch(() => {
				// TODO: Use error as reason
				setCanSaveDefaultProps(false);
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

	return (
		<div style={outer}>
			<div style={controlContainer}>
				<div style={tabWrapper}>
					<SegmentedControl items={modeItems} needsWrapping={false} />
					<div style={spacer} />
				</div>
				{Object.keys(cliProps).length > 0 ? (
					<>
						<Spacing y={1} />
						<ValidationMessage
							message="The data that was passed using --props takes priority over the data you enter here."
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
				/>
			)}
		</div>
	);
};
