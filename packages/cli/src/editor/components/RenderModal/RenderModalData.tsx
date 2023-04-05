import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {AnyComposition} from 'remotion';
import {BORDER_COLOR} from '../../helpers/colors';

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
	flexDirection: 'row',
	display: 'flex',
	paddingLeft: 12,
	paddingTop: 12,
	paddingBottom: 12,
	borderBottom: `1px solid ${BORDER_COLOR}`,
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
				<SegmentedControl items={modeItems} needsWrapping={false} />
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
