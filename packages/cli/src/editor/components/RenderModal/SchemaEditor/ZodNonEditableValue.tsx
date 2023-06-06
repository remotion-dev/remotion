import React, {useCallback} from 'react';
import {VERY_LIGHT_TEXT} from '../../../helpers/colors';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import {Fieldset} from './Fieldset';

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
	showSaveButton: boolean;
	saving: boolean;
	mayPad: boolean;
}> = ({jsonPath, label, showSaveButton, saving, mayPad}) => {
	const save = useCallback(() => undefined, []);
	const reset = useCallback(() => undefined, []);
	return (
		<Fieldset shouldPad={mayPad} success>
			<SchemaLabel
				isDefaultValue
				jsonPath={jsonPath}
				onReset={reset}
				onSave={save}
				showSaveButton={showSaveButton}
				onRemove={null}
				saving={saving}
				valid
				saveDisabledByParent
				suffix={null}
			/>
			<div style={fullWidth}>
				<em style={wideEmptyLabel}>{label}</em>
			</div>
		</Fieldset>
	);
};
