import React from 'react';
import {
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	getBackgroundFromHoverState,
} from '../../helpers/colors';
import {InlineAction} from '../InlineAction';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import type {RenderModalWarning} from '../RenderModal/DataEditor';
import {
	centeredMessage,
	defaultPropsWarningMessages,
	detailLabel,
	detailRow,
	detailValue,
	inspectorSectionBody,
	inspectorSectionDivider,
	resolveLinkStyle,
	sectionHeader,
	sectionHeaderRow,
	sectionHeaderStart,
} from './styles';

export const InspectorSectionHeader: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => <div style={sectionHeader}>{children}</div>;

export const InspectorSectionDivider: React.FC = () => (
	<div style={inspectorSectionDivider} />
);

export const InspectorSection: React.FC<{
	readonly children: React.ReactNode;
	readonly header: React.ReactNode;
}> = ({children, header}) => {
	return (
		<>
			<InspectorSectionDivider />
			<InspectorSectionHeader>{header}</InspectorSectionHeader>
			{children === null ? null : (
				<div style={inspectorSectionBody}>{children}</div>
			)}
		</>
	);
};

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

export const InspectorBackHeader: React.FC<{
	readonly children: React.ReactNode;
	readonly disabled: boolean;
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly title: string;
}> = ({children, disabled, onClick, title}) => {
	return (
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
	borderRadius: 4,
	boxSizing: 'border-box',
	color: LIGHT_TEXT,
	cursor: 'default',
	display: 'flex',
	fontFamily: 'sans-serif',
	fontSize: 13,
	gap: 8,
	height: 32,
	lineHeight: '18px',
	margin: '0 4px',
	padding: `5px ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
	textAlign: 'left',
	width: 'calc(100% - 8px)',
};

const inlineLabelButtonDisabled: React.CSSProperties = {
	...inlineLabelButton,
	opacity: 0.35,
};

const inlineLabelText: React.CSSProperties = {
	color: LIGHT_TEXT,
	flex: 1,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '18px',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const inlineLabelIcon: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexShrink: 0,
	height: 18,
	justifyContent: 'center',
	width: 18,
};

export const InspectorInlineAction: React.FC<{
	readonly children: React.ReactNode;
	readonly disabled: boolean;
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly renderIcon: (color: string) => React.ReactNode;
	readonly style?: React.CSSProperties;
}> = ({children, disabled, onClick, renderIcon, style}) => {
	const [hovered, setHovered] = React.useState(false);
	const color = hovered && !disabled ? WHITE : LIGHT_TEXT;
	const buttonStyle = React.useMemo(
		(): React.CSSProperties => ({
			...(disabled ? inlineLabelButtonDisabled : inlineLabelButton),
			backgroundColor: getBackgroundFromHoverState({
				hovered: hovered && !disabled,
				selected: false,
			}),
			color,
			...style,
		}),
		[color, disabled, hovered, style],
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
