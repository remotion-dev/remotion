import React from 'react';
import {BLUE, LIGHT_TEXT, WHITE} from '../helpers/colors';
import {FOCUS_VISIBLE_ONLY_CLASS_NAME} from '../helpers/hoverable';
import type {SettingId} from './settings-catalog';
import {getSettingDomId, settingsCatalog} from './settings-catalog';

const row: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 24,
	padding: '12px 16px',
	minWidth: 0,
	flexWrap: 'wrap',
	scrollMarginBlock: 16,
};

const text: React.CSSProperties = {flex: '1 1 240px', minWidth: 0};
const name: React.CSSProperties = {color: WHITE, fontSize: 14, lineHeight: 1.5};
const description: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
	lineHeight: 1.5,
	marginTop: 4,
};
const link: React.CSSProperties = {
	color: BLUE,
	fontSize: 13,
	lineHeight: 1.5,
	cursor: 'default',
};

export const SettingsRow: React.FC<{
	readonly settingId: SettingId;
	readonly children: React.ReactNode;
}> = ({settingId, children}) => {
	const setting = settingsCatalog[settingId];
	const id = getSettingDomId(settingId);
	return (
		<div
			id={id}
			style={row}
			tabIndex={-1}
			className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
			role="group"
			aria-labelledby={`${id}-label`}
			aria-describedby={`${id}-description`}
		>
			<div style={text}>
				<label id={`${id}-label`} htmlFor={`${id}-control`} style={name}>
					{setting.name}
				</label>
				<div id={`${id}-description`} style={description}>
					{setting.description}
					{setting.documentation === null ? null : (
						<>
							{' '}
							<a
								className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
								style={link}
								href={setting.documentation}
								target="_blank"
								rel="noopener noreferrer"
							>
								Learn more
							</a>
						</>
					)}
				</div>
			</div>
			<div
				data-setting-control
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					gap: 8,
					marginLeft: 'auto',
				}}
			>
				{children}
			</div>
		</div>
	);
};
