import React, {useCallback} from 'react';
import {VERY_LIGHT_TEXT} from '../../../helpers/colors';
import {Fieldset} from './Fieldset';
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
	readonly showSaveButton: boolean;
	readonly saving: boolean;
	readonly mayPad: boolean;
}> = ({jsonPath, label, showSaveButton, saving, mayPad}) => {
	const save = useCallback(() => undefined, []);
	const reset = useCallback(() => undefined, []);
	return (
		<Fieldset shouldPad={mayPad} success>
			<SchemaLabel
				handleClick={null}
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
