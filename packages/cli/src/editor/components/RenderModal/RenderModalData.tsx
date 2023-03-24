import React, {useMemo, useState} from 'react';
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
}> = ({composition}) => {
	const [mode, setMode] = useState<Mode>('json');
	const [inputProps, setInputProps] = useState(() => composition.defaultProps);

	const modeItems = useMemo((): SegmentedControlItem[] => {
		return [
			{
				key: 'json',
				label: 'JSON',
				onClick: () => {
					setMode('json');
				},
				selected: mode === 'json',
			},
			{
				key: 'schema',
				label: 'Schema',
				onClick: () => {
					setMode('schema');
				},
				selected: mode === 'schema',
			},
		];
	}, [mode]);
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
				/>
			) : (
				<RenderModalJSONInputPropsEditor
					value={inputProps ?? {}}
					setValue={setInputProps}
				/>
			)}
		</div>
	);
};
