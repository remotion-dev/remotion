import React, {useMemo} from 'react';
import {VERY_LIGHT_TEXT} from '../../../helpers/colors';
import {Fieldset} from './Fieldset';
import {useSchemaEditorDensity} from './SchemaEditorDensity';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

const emptyLabel: React.CSSProperties = {
	width: '100%',
	color: VERY_LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
};

const wideEmptyLabel: React.CSSProperties = {
	...emptyLabel,
	lineHeight: '37px',
};

export const ZonNonEditableValue: React.FC<{
	readonly jsonPath: JSONPath;
	readonly label: string;
	readonly mayPad: boolean;
}> = ({jsonPath, label, mayPad}) => {
	const density = useSchemaEditorDensity();
	const nonEditableLabel = useMemo((): React.CSSProperties => {
		return {
			...wideEmptyLabel,
			fontSize: density === 'compact' ? 12 : 14,
			lineHeight: density === 'compact' ? '28px' : '37px',
		};
	}, [density]);

	return (
		<Fieldset shouldPad={mayPad}>
			<SchemaLabel
				handleClick={null}
				jsonPath={jsonPath}
				onRemove={null}
				valid
				suffix={null}
			/>
			<div style={fullWidth}>
				<em style={nonEditableLabel}>{label}</em>
			</div>
		</Fieldset>
	);
};
