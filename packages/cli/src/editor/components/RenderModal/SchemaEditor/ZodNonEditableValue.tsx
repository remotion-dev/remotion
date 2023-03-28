import React, {useCallback} from 'react';
import {LIGHT_TEXT} from '../../../helpers/colors';
import {narrowOption, optionRow} from '../layout';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

const emptyLabel: React.CSSProperties = {
	width: '100%',
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
};

export const ZonNonEditableValue: React.FC<{
	jsonPath: JSONPath;
	label: string;
	compact: boolean;
	showSaveButton: boolean;
}> = ({jsonPath, label, compact, showSaveButton}) => {
	const save = useCallback(() => undefined, []);
	const reset = useCallback(() => undefined, []);
	return (
		<div style={compact ? narrowOption : optionRow}>
			<SchemaLabel
				isDefaultValue
				jsonPath={jsonPath}
				onReset={reset}
				onSave={save}
				showSaveButton={showSaveButton}
				compact={compact}
				onRemove={null}
			/>
			<div style={fullWidth}>
				<em style={emptyLabel}>{label}</em>
			</div>
		</div>
	);
};
