import React, {useMemo} from 'react';
import {FAIL_COLOR, LIGHT_TEXT} from '../../../helpers/colors';
import {Flex} from '../../layout';
import {InlineRemoveButton} from '../InlineRemoveButton';
import {getSchemaLabel} from './get-schema-label';
import {SchemaResetButton} from './SchemaResetButton';
import {SchemaSaveButton} from './SchemaSaveButton';
import type {JSONPath} from './zod-types';

const compactStyles: React.CSSProperties = {
	fontSize: 15,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	flex: 1,
};

export const ClickableSchemaLabel: React.FC<{
	jsonPath: JSONPath;
	isDefaultValue: boolean;
	onReset: () => void;
	onSave: () => void;
	onRemove: null | (() => void);
	showSaveButton: boolean;
	saving: boolean;
	valid: boolean;
	saveDisabledByParent: boolean;
	suffix: string | null;
	handleClick: () => void;
}> = ({
	jsonPath,
	isDefaultValue,
	onReset,
	onSave,
	showSaveButton,
	onRemove,
	saving,
	valid,
	saveDisabledByParent,
	suffix,
	handleClick,
}) => {
	const disableSave = saving || !valid || saveDisabledByParent;
	const labelStyle: React.CSSProperties = useMemo(() => {
		return {
			cursor: 'pointer',
			fontFamily: 'monospace',
			fontSize: 14,
			color: valid ? LIGHT_TEXT : FAIL_COLOR,
			lineHeight: '24px',
		};
	}, [valid]);

	return (
		<div style={compactStyles}>
			<button type="button" onClick={handleClick} style={{border: 'none'}}>
				<span style={labelStyle}>
					{getSchemaLabel(jsonPath)} {suffix ? suffix : null}
				</span>
			</button>

			<Flex />
			{isDefaultValue ? null : <SchemaResetButton onClick={onReset} />}
			{isDefaultValue ? null : showSaveButton ? (
				<SchemaSaveButton onClick={onSave} disabled={disableSave} />
			) : null}
			{onRemove ? <InlineRemoveButton onClick={onRemove} /> : null}
		</div>
	);
};
