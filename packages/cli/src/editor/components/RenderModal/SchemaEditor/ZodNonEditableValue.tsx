import React, {useCallback} from 'react';
import {VERY_LIGHT_TEXT} from '../../../helpers/colors';
import {narrowOption, optionRow} from '../layout';
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
	jsonPath: JSONPath;
	label: string;
	compact: boolean;
	showSaveButton: boolean;
	saving: boolean;
}> = ({jsonPath, label, compact, showSaveButton, saving}) => {
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
				saving={saving}
				valid
				saveDisabledByParent={false}
			/>
			<div style={fullWidth}>
				<em style={compact ? emptyLabel : wideEmptyLabel}>{label}</em>
			</div>
		</div>
	);
};
