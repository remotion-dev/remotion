import React from 'react';
import {LIGHT_TEXT} from '../../../helpers/colors';
import {Flex, Spacing} from '../../layout';
import {label} from '../layout';
import {SchemaResetButton} from './SchemaResetButton';
import {SchemaSaveButton} from './SchemaSaveButton';
import type {JSONPath} from './zod-types';

const commonStyles: React.CSSProperties = {
	fontSize: 15,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	lineHeight: '40px',
};

const compactStyles: React.CSSProperties = {
	...commonStyles,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const wideStyles: React.CSSProperties = {
	...commonStyles,
	width: label.width,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

export const SchemaLabel: React.FC<{
	jsonPath: JSONPath;
	isDefaultValue: boolean;
	onReset: () => void;
	onSave: () => void;
	showSaveButton: boolean;
	compact: boolean;
}> = ({jsonPath, isDefaultValue, onReset, onSave, showSaveButton, compact}) => {
	return (
		<div style={compact ? compactStyles : wideStyles}>
			{jsonPath[jsonPath.length - 1]} {compact ? <Flex /> : <Spacing x={1} />}
			{isDefaultValue ? null : <SchemaResetButton onClick={onReset} />}
			{isDefaultValue ? null : showSaveButton ? (
				<SchemaSaveButton onClick={onSave} />
			) : null}
		</div>
	);
};
