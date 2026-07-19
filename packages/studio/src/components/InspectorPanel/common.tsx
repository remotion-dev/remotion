import React from 'react';
import {LIGHT_TEXT, TRANSPARENT, WHITE} from '../../helpers/colors';
import {InlineAction} from '../InlineAction';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import type {RenderModalWarning} from '../RenderModal/DataEditor';
import {
	centeredMessage,
	defaultPropsWarningMessages,
	detailLabel,
	detailRow,
	detailValue,
	inspectorSectionDivider,
	resolveLinkStyle,
	sectionHeader,
	sectionHeaderRow,
	sectionHeaderStart,
} from './styles';

export const InspectorSectionHeader: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => <div style={sectionHeader}>{children}</div>;

const backIcon: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	height: 12,
	justifyContent: 'center',
	width: 12,
};

const BackChevron: React.FC<{
	readonly color: string;
}> = ({color}) => {
	return (
		<svg viewBox="0 0 8 12" style={backIcon}>
			<path
				d="M6 1L2 6L6 11"
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
			/>
		</svg>
	);
};

export const InspectorBackHeaderWithDivider: React.FC<{
	readonly children: React.ReactNode;
	readonly disabled: boolean;
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly title: string;
}> = ({children, disabled, onClick, title}) => {
	return (
		<>
			<InspectorSectionHeader>
				<div style={sectionHeaderRow}>
					<div style={sectionHeaderStart}>
						<InlineAction
							disabled={disabled}
							onClick={onClick}
							title={title}
							renderAction={(color) => <BackChevron color={color} />}
						/>
						{children}
					</div>
				</div>
			</InspectorSectionHeader>
			<div style={inspectorSectionDivider} />
		</>
	);
};

export const InspectorMessage: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => <div style={centeredMessage}>{children}</div>;

export const InspectorDetailRow: React.FC<{
	readonly label: string;
	readonly children: React.ReactNode;
}> = ({label, children}) => (
	<div style={detailRow}>
		<div style={detailLabel}>{label}</div>
		<div style={detailValue}>{children}</div>
	</div>
);

const inlineLabelButton: React.CSSProperties = {
	alignItems: 'center',
	appearance: 'none',
	backgroundColor: TRANSPARENT,
	border: 'none',
	color: LIGHT_TEXT,
	cursor: 'default',
	display: 'flex',
	fontFamily: 'sans-serif',
	fontSize: 13,
	gap: 8,
	lineHeight: '18px',
	margin: 0,
	padding: '5px 0',
};

const inlineLabelButtonDisabled: React.CSSProperties = {
	...inlineLabelButton,
	opacity: 0.35,
};

const inlineLabelText: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '18px',
};

const inlineLabelIcon: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexShrink: 0,
	height: 13,
	justifyContent: 'center',
	width: 13,
};

export const InspectorInlineAction: React.FC<{
	readonly children: React.ReactNode;
	readonly disabled: boolean;
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly renderIcon: (color: string) => React.ReactNode;
}> = ({children, disabled, onClick, renderIcon}) => {
	const [hovered, setHovered] = React.useState(false);
	const color = hovered && !disabled ? WHITE : LIGHT_TEXT;
	const buttonStyle = React.useMemo(
		(): React.CSSProperties => ({
			...(disabled ? inlineLabelButtonDisabled : inlineLabelButton),
			color,
		}),
		[color, disabled],
	);
	const textStyle = React.useMemo(
		(): React.CSSProperties => ({
			...inlineLabelText,
			color,
		}),
		[color],
	);

	const onPointerEnter = React.useCallback(() => {
		setHovered(true);
	}, []);
	const onPointerLeave = React.useCallback(() => {
		setHovered(false);
	}, []);

	return (
		<button
			type="button"
			disabled={disabled}
			style={buttonStyle}
			onClick={onClick}
			onPointerEnter={disabled ? undefined : onPointerEnter}
			onPointerLeave={onPointerLeave}
		>
			<span style={inlineLabelIcon}>{renderIcon(color)}</span>
			<span style={textStyle}>{children}</span>
		</button>
	);
};

export const InspectorDefaultPropsWarnings: React.FC<{
	readonly warnings: RenderModalWarning[];
}> = ({warnings}) => {
	return (
		<div style={defaultPropsWarningMessages}>
			{warnings.map((warning) => (
				<ValidationMessage
					key={warning.id}
					message={warning.message}
					align="flex-start"
					type="warning"
					size="compact"
					action={
						warning.resolveLink ? (
							<a
								href={warning.resolveLink}
								target="_blank"
								rel="noopener noreferrer"
								style={resolveLinkStyle}
							>
								Resolve
							</a>
						) : null
					}
				/>
			))}
		</div>
	);
};
