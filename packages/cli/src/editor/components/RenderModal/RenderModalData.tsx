import React, {useCallback, useMemo, useState} from 'react';
import type {AnyComposition} from 'remotion';

import {Spacing} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {updateDefaultProps} from '../RenderQueue/actions';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {RenderModalJSONInputPropsEditor} from './RenderModalJSONInputPropsEditor';
import {SchemaEditor} from './SchemaEditor/SchemaEditor';

type Mode = 'json' | 'schema';

const outer: React.CSSProperties = {
	padding: '8px 16px',
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	overflow: 'auto',
};

const controlContainer: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
};

export const RenderModalData: React.FC<{
	composition: AnyComposition;
	inputProps: unknown;
	setInputProps: React.Dispatch<React.SetStateAction<unknown>>;
	compact: boolean;
	showSaveButton: boolean;
}> = ({composition, inputProps, setInputProps, compact, showSaveButton}) => {
	const [mode, setMode] = useState<Mode>('schema');

	const zodValidationResult = useMemo(() => {
		return composition.schema.safeParse(inputProps);
	}, [composition.schema, inputProps]);

	// TODO: Put Schema/JSON tab one component above, so no scrolling to reach them is needed

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
		updateDefaultProps(composition.id, inputProps);
	}, [composition.id, inputProps]);

	const onSave = useCallback(
		(updater: (oldState: unknown) => unknown) => {
			updateDefaultProps(composition.id, updater(composition.defaultProps));
		},
		[composition.defaultProps, composition.id]
	);

	return (
		<div style={outer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<div style={controlContainer}>
				<SegmentedControl items={modeItems} needsWrapping={false} />
			</div>
			<Spacing y={2} block />
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
				/>
			)}
		</div>
	);
};
