import React from 'react';
import {WHITE_ALPHA_30} from '../../../helpers/colors';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

const emptyLabel: React.CSSProperties = {
	width: '100%',
	color: WHITE_ALPHA_30,
	fontFamily: 'sans-serif',
	fontSize: 14,
};

const wideEmptyLabel: React.CSSProperties = {
	...emptyLabel,
	fontSize: 12,
	lineHeight: '28px',
};

export const ZonNonEditableValue: React.FC<{
	readonly jsonPath: JSONPath;
	readonly label: string;
	readonly mayPad: boolean;
}> = ({jsonPath, label, mayPad}) => {
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
				<em style={wideEmptyLabel}>{label}</em>
			</div>
		</Fieldset>
	);
};
