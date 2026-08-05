import React from 'react';
import {
	CURRENT_COLOR,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	getBackgroundFromHoverState,
} from '../../helpers/colors';
import {
	HOVERABLE_CLASS_NAME,
	HOVER_GROUP_CLASS_NAME,
	HOVER_GROUP_REVEAL_CLASS_NAME,
	hoverableStyle,
} from '../../helpers/hoverable';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import {COMPACT_CONTROL_ROW_HEIGHT, COMPACT_INLINE_ROW_HEIGHT} from '../layout';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import type {RenderModalWarning} from '../RenderModal/DataEditor';
import {
	centeredMessage,
	defaultPropsWarningMessages,
	detailLabel,
	detailRow,
	detailValue,
	inspectorActionSection,
	inspectorSectionBody,
	inspectorSectionDivider,
	resolveLinkStyle,
	sectionHeader,
} from './styles';

export const InspectorSectionHeader: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => <div style={sectionHeader}>{children}</div>;

export const InspectorSectionDivider: React.FC = () => (
	<div style={inspectorSectionDivider} />
);

export const InspectorActionSection: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => (
	<>
		<InspectorSectionDivider />
		<div style={inspectorActionSection}>{children}</div>
	</>
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

const backArrowIcon: React.CSSProperties = {
	display: 'block',
	height: 15,
	width: 15,
};

const BackArrow: React.FC<{
	readonly color: string;
}> = ({color}) => {
	return (
		<svg viewBox="0 0 512 512" style={backArrowIcon}>
			<path
				d="M7 239c-9.4 9.4-9.4 24.6 0 33.9L175 441c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L81.9 280 488 280c13.3 0 24-10.7 24-24s-10.7-24-24-24L81.9 232 209 105c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L7 239z"
				fill={color}
			/>
		</svg>
	);
};

export const InspectorBackAction: React.FC<{
	readonly children: React.ReactNode;
	readonly disabled: boolean;
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly title: string;
}> = ({children, disabled, onClick, title}) => {
	return (
		<div style={inspectorActionSection}>
			<InspectorInlineAction
				disabled={disabled}
				onClick={onClick}
				renderIcon={(color) => <BackArrow color={color} />}
				title={title}
			>
				{children}
			</InspectorInlineAction>
		</div>
	);
};

export const InspectorMessage: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => <div style={centeredMessage}>{children}</div>;

export const InspectorDetailRow: React.FC<{
	readonly label: React.ReactNode | ((hovered: boolean) => React.ReactNode);
	readonly children: React.ReactNode;
}> = ({label, children}) => {
	const [hovered, setHovered] = React.useState(false);

	return (
		<div
			style={detailRow}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
		>
			<div style={detailLabel}>
				{typeof label === 'function' ? label(hovered) : label}
			</div>
			<div style={detailValue}>{children}</div>
		</div>
	);
};

const INLINE_LABEL_BUTTON_MARGIN = 4;

const inlineLabelButton: React.CSSProperties = {
	alignItems: 'center',
	appearance: 'none',
	border: 'none',
	borderRadius: 4,
	boxSizing: 'border-box',
	cursor: 'default',
	display: 'flex',
	fontFamily: 'sans-serif',
	fontSize: 13,
	gap: 8,
	height: COMPACT_CONTROL_ROW_HEIGHT,
	lineHeight: '18px',
	margin: `0 ${INLINE_LABEL_BUTTON_MARGIN}px`,
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING - INLINE_LABEL_BUTTON_MARGIN}px`,
	textAlign: 'left',
	width: `calc(100% - ${INLINE_LABEL_BUTTON_MARGIN * 2}px)`,
};

const inlineLabelButtonDisabled: React.CSSProperties = {
	...inlineLabelButton,
	opacity: 0.35,
};

const compactInlineLabelButton: React.CSSProperties = {
	height: COMPACT_INLINE_ROW_HEIGHT,
};

const inlineLabelText: React.CSSProperties = {
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

const segmentedInlineAction: React.CSSProperties = {
	display: 'flex',
	gap: 1,
	margin: `0 ${INLINE_LABEL_BUTTON_MARGIN}px`,
	width: `calc(100% - ${INLINE_LABEL_BUTTON_MARGIN * 2}px)`,
};

const segmentedMainAction: React.CSSProperties = {
	borderRadius: '4px 0 0 4px',
	flex: 1,
	margin: 0,
	minWidth: 0,
	width: 'auto',
};

const segmentedTrailingAction: React.CSSProperties = {
	alignItems: 'center',
	appearance: 'none',
	border: 'none',
	borderRadius: '0 4px 4px 0',
	display: 'flex',
	flex: '0 0 28px',
	justifyContent: 'center',
	margin: 0,
	padding: 0,
	width: 28,
};

export type InspectorInlineActionSegment = {
	readonly disabled: boolean;
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly renderIcon: (color: string) => React.ReactNode;
	readonly title?: string;
};

export type InspectorInlineActionProps = {
	readonly children: React.ReactNode;
	readonly disabled: boolean;
	readonly iconContainerStyle?: React.CSSProperties;
	readonly onClick: React.MouseEventHandler<HTMLButtonElement> | null;
	readonly renderIcon?: (color: string) => React.ReactNode;
	readonly size?: 'default' | 'compact';
	readonly style?: React.CSSProperties;
	readonly title?: string;
	readonly variant?:
		| {readonly type: 'single'}
		| {
				readonly type: 'segmented';
				readonly trailing: InspectorInlineActionSegment;
		  };
};

export const InspectorInlineAction: React.FC<InspectorInlineActionProps> = ({
	children,
	disabled,
	iconContainerStyle,
	onClick,
	renderIcon,
	size = 'default',
	style,
	title,
	variant = {type: 'single'},
}) => {
	const isSegmented = variant.type === 'segmented';
	// A non-clickable single action (onClick === null) never shows a hover
	// effect. In the segmented variant, the main segment highlights whenever
	// the group is hovered, even if it is not clickable itself.
	const showsHover = !disabled && (onClick !== null || isSegmented);
	const buttonStyle = React.useMemo(
		(): React.CSSProperties => ({
			...(disabled ? inlineLabelButtonDisabled : inlineLabelButton),
			...hoverableStyle({
				idleBackground: TRANSPARENT,
				hoverBackground: showsHover
					? getBackgroundFromHoverState({hovered: true, selected: false})
					: TRANSPARENT,
				idleColor: LIGHT_TEXT,
				hoverColor: showsHover ? WHITE : LIGHT_TEXT,
			}),
			...(size === 'compact' ? compactInlineLabelButton : null),
			...(isSegmented ? segmentedMainAction : null),
			...style,
		}),
		[disabled, showsHover, isSegmented, size, style],
	);

	const mainContent = (
		<>
			{renderIcon ? (
				<span style={{...inlineLabelIcon, ...iconContainerStyle}}>
					{renderIcon(CURRENT_COLOR)}
				</span>
			) : null}
			<span style={inlineLabelText}>{children}</span>
		</>
	);
	const mainAction = onClick ? (
		<button
			className={`__remotion-inspector-inline-action ${HOVERABLE_CLASS_NAME}`}
			type="button"
			disabled={disabled}
			style={buttonStyle}
			title={title}
			onClick={onClick}
		>
			{mainContent}
		</button>
	) : (
		<div className={HOVERABLE_CLASS_NAME} style={buttonStyle} title={title}>
			{mainContent}
		</div>
	);

	if (variant.type === 'segmented') {
		const trailingStyle: React.CSSProperties = {
			...segmentedTrailingAction,
			...hoverableStyle({
				idleBackground: TRANSPARENT,
				hoverBackground: variant.trailing.disabled
					? TRANSPARENT
					: getBackgroundFromHoverState({hovered: true, selected: false}),
				idleColor: LIGHT_TEXT,
				hoverColor: variant.trailing.disabled ? LIGHT_TEXT : WHITE,
			}),
			height:
				size === 'compact'
					? COMPACT_INLINE_ROW_HEIGHT
					: COMPACT_CONTROL_ROW_HEIGHT,
			opacity: variant.trailing.disabled ? 0.35 : 1,
		};

		return (
			<div className={HOVER_GROUP_CLASS_NAME} style={segmentedInlineAction}>
				{mainAction}
				<button
					type="button"
					className={HOVERABLE_CLASS_NAME}
					disabled={variant.trailing.disabled}
					style={trailingStyle}
					title={variant.trailing.title}
					onClick={variant.trailing.onClick}
				>
					<span
						className={HOVER_GROUP_REVEAL_CLASS_NAME}
						style={inlineLabelIcon}
					>
						{variant.trailing.renderIcon(CURRENT_COLOR)}
					</span>
				</button>
			</div>
		);
	}

	return mainAction;
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
