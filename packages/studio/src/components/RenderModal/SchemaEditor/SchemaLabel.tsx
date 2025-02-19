import React, {useCallback, useMemo, useState} from 'react';
import {FAIL_COLOR, LIGHT_TEXT} from '../../../helpers/colors';
import {Flex} from '../../layout';
import {InlineRemoveButton} from '../InlineRemoveButton';
import {SchemaResetButton} from './SchemaResetButton';
import {SchemaSaveButton} from './SchemaSaveButton';
import {getSchemaLabel} from './get-schema-label';
import {DEFAULT_PROPS_PATH_CLASSNAME} from './scroll-to-default-props-path';
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

export const SchemaLabel: React.FC<{
	readonly jsonPath: JSONPath;
	readonly isDefaultValue: boolean;
	readonly onReset: () => void;
	readonly onSave: () => void;
	readonly onRemove: null | (() => void);
	readonly showSaveButton: boolean;
	readonly saving: boolean;
	readonly valid: boolean;
	readonly saveDisabledByParent: boolean;
	readonly suffix: string | null;
	readonly handleClick: null | (() => void);
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
	const [clickableButtonHovered, setClickableButtonHovered] = useState(false);

	const disableSave = saving || !valid || saveDisabledByParent;
	const labelStyle: React.CSSProperties = useMemo(() => {
		return {
			fontFamily: 'monospace',
			fontSize: 14,
			color: valid
				? clickableButtonHovered
					? 'white'
					: LIGHT_TEXT
				: FAIL_COLOR,
			lineHeight: '24px',
		};
	}, [clickableButtonHovered, valid]);

	const onClickablePointerEnter = useCallback(() => {
		setClickableButtonHovered(true);
	}, []);

	const onClickablePointerLeave = useCallback(() => {
		setClickableButtonHovered(false);
	}, []);

	const labelContent = (
		<span style={labelStyle}>
			{getSchemaLabel(jsonPath)} {suffix ? suffix : null}
		</span>
	);

	return (
		<div
			style={compactStyles}
			className={DEFAULT_PROPS_PATH_CLASSNAME}
			data-json-path={jsonPath.join('.')}
		>
			{handleClick ? (
				// Minus the padding that a button has (user agent padding-line-start)
				<button
					onPointerEnter={onClickablePointerEnter}
					onPointerLeave={onClickablePointerLeave}
					type="button"
					onClick={handleClick}
					style={{border: 'none', marginLeft: -6}}
				>
					{labelContent}
				</button>
			) : (
				labelContent
			)}
			<Flex />
			{isDefaultValue ? null : <SchemaResetButton onClick={onReset} />}
			{isDefaultValue ? null : showSaveButton ? (
				<SchemaSaveButton onClick={onSave} disabled={disableSave} />
			) : null}
			{onRemove ? <InlineRemoveButton onClick={onRemove} /> : null}
		</div>
	);
};
