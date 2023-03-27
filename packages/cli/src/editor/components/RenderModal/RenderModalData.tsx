import React, {useCallback, useMemo, useState} from 'react';
import type {AnyComposition} from 'remotion';

import {Spacing} from '../layout';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {RenderModalJSONInputPropsEditor} from './RenderModalJSONInputPropsEditor';
import {SchemaEditor} from './SchemaEditor/SchemaEditor';

type Mode = 'json' | 'schema';

const outer: React.CSSProperties = {
	padding: '8px 16px',
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
}> = ({composition, inputProps, setInputProps, compact}) => {
	const [mode, setMode] = useState<Mode>('schema');

	const zodValidationResult = useMemo(() => {
		return composition.schema.safeParse(inputProps);
	}, [composition.schema, inputProps]);

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

	return (
		<div style={outer}>
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
				/>
			) : (
				<RenderModalJSONInputPropsEditor
					value={inputProps ?? {}}
					setValue={setInputProps}
					zodValidationResult={zodValidationResult}
					switchToSchema={switchToSchema}
				/>
			)}
		</div>
	);
};
