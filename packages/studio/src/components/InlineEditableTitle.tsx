import type * as React from 'react';
import type {
	ChangeEventHandler,
	FocusEventHandler,
	KeyboardEventHandler,
} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_06,
	WHITE_ALPHA_10,
} from '../helpers/colors';
import {HOVERABLE_CLASS_NAME, hoverableStyle} from '../helpers/hoverable';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from './InspectorPanelLayout';
import {COMPACT_CONTROL_ROW_HEIGHT} from './layout';

const titleWrapper: React.CSSProperties = {
	boxSizing: 'border-box',
	color: WHITE,
	fontSize: 12,
	height: 18,
	lineHeight: '18px',
	marginLeft: -4,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	width: 'calc(100% + 4px)',
};

const titleInner: React.CSSProperties = {
	borderRadius: 4,
	boxSizing: 'border-box',
	display: 'inline-grid',
	fontSize: 12,
	lineHeight: '18px',
	maxWidth: '100%',
	paddingLeft: 4,
	paddingRight: 4,
	verticalAlign: 'top',
};

const titleGridItem: React.CSSProperties = {
	color: 'inherit',
	fontSize: 12,
	gridArea: '1 / 1',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	userSelect: 'none',
	WebkitUserSelect: 'none',
	whiteSpace: 'nowrap',
};

const titleInput: React.CSSProperties = {
	appearance: 'none',
	backgroundColor: TRANSPARENT,
	border: `1px solid ${WHITE_ALPHA_10}`,
	borderRadius: 3,
	boxSizing: 'border-box',
	boxShadow: 'none',
	color: WHITE,
	fontFamily: 'inherit',
	fontSize: 12,
	height: 18,
	lineHeight: '18px',
	margin: 0,
	marginLeft: -4,
	minWidth: 0,
	outline: 'none',
	overflow: 'hidden',
	padding: '0 3px',
	userSelect: 'text',
	WebkitAppearance: 'none',
	width: 'calc(100% + 8px)',
};

const inspectorTitleWrapper: React.CSSProperties = {
	...titleWrapper,
	fontFamily: 'sans-serif',
	fontSize: 14,
	height: COMPACT_CONTROL_ROW_HEIGHT,
	margin: '0 0 0 4px',
	textOverflow: 'clip',
	width: 'calc(100% - 4px)',
};

const inspectorTitleInner: React.CSSProperties = {
	...titleInner,
	alignItems: 'center',
	fontFamily: 'sans-serif',
	fontSize: 14,
	height: COMPACT_CONTROL_ROW_HEIGHT,
	paddingBottom: 0,
	paddingLeft: INSPECTOR_PANEL_HORIZONTAL_PADDING - 4,
	paddingRight: 0,
	paddingTop: 0,
	width: '100%',
};

const inspectorTitleGridItem: React.CSSProperties = {
	...titleGridItem,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: '18px',
	maskImage:
		'linear-gradient(to right, black calc(100% - 16px), transparent calc(100% - 6px))',
	textOverflow: 'clip',
	WebkitMaskImage:
		'linear-gradient(to right, black calc(100% - 16px), transparent calc(100% - 6px))',
};

const inspectorTitleInput: React.CSSProperties = {
	...titleInput,
	fontFamily: 'sans-serif',
	fontSize: 14,
	height: COMPACT_CONTROL_ROW_HEIGHT,
	marginLeft: -6,
	maskImage: 'none',
	padding: '0 5px',
	WebkitMaskImage: 'none',
	width: 'calc(100% + 6px)',
};

export const InlineEditableTitle: React.FC<{
	readonly value: string;
	readonly onEditingChange: ((editing: boolean) => void) | null;
	readonly canRename: boolean;
	readonly getInitialSelection?: (value: string) => [number, number];
	readonly onClick?: () => void;
	readonly onCommit: (newValue: string) => void;
	readonly size?: 'default' | 'inspector';
	readonly 'aria-label'?: string;
}> = ({
	value,
	onEditingChange,
	canRename,
	getInitialSelection,
	onClick,
	onCommit,
	size = 'default',
	'aria-label': ariaLabel,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [draftValue, setDraftValue] = useState(value);
	const inputRef = useRef<HTMLInputElement>(null);
	const cancelledRef = useRef(false);

	useEffect(() => {
		if (!isEditing) {
			setDraftValue(value);
		}
	}, [isEditing, value]);

	const focusInput = useCallback(
		(input: HTMLInputElement | null) => {
			inputRef.current = input;

			if (!input) {
				return;
			}

			input.focus();
			if (getInitialSelection) {
				const [start, end] = getInitialSelection(value);
				input.setSelectionRange(start, end);
				return;
			}

			input.select();
		},
		[getInitialSelection, value],
	);

	const commit = useCallback(
		(newValue: string) => {
			if (cancelledRef.current) {
				return;
			}

			setIsEditing(false);
			onEditingChange?.(false);
			onCommit(newValue);
		},
		[onCommit, onEditingChange],
	);

	const handleClick = useCallback(() => {
		if (onClick) {
			onClick();
			return;
		}

		if (!canRename) {
			return;
		}

		cancelledRef.current = false;
		setDraftValue(value);
		setIsEditing(true);
		onEditingChange?.(true);
	}, [canRename, onClick, onEditingChange, value]);

	const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
		setDraftValue(e.target.value);
	}, []);

	const onBlur: FocusEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			commit(e.currentTarget.value);
		},
		[commit],
	);

	const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				inputRef.current?.blur();
			}

			if (e.key === 'Escape') {
				e.preventDefault();
				cancelledRef.current = true;
				setDraftValue(value);
				setIsEditing(false);
				onEditingChange?.(false);
			}
		},
		[onEditingChange, value],
	);

	const isInteractive = canRename || onClick !== undefined;
	const isInspectorSize = size === 'inspector';

	const innerStyle = useMemo((): React.CSSProperties => {
		return {
			...(isInspectorSize ? inspectorTitleInner : titleInner),
			...hoverableStyle({
				idleBackground: TRANSPARENT,
				hoverBackground:
					!isEditing && isInteractive ? WHITE_ALPHA_06 : TRANSPARENT,
				idleColor: isEditing ? WHITE : LIGHT_TEXT,
				hoverColor: isEditing ? WHITE : LIGHT_TEXT,
			}),
			cursor: isEditing ? 'text' : 'default',
			userSelect: isEditing ? 'text' : 'none',
			width: isEditing || isInspectorSize ? '100%' : undefined,
		};
	}, [isEditing, isInspectorSize, isInteractive]);
	const gridItemStyle = isInspectorSize
		? inspectorTitleGridItem
		: titleGridItem;
	const inputStyle = isInspectorSize ? inspectorTitleInput : titleInput;

	return (
		<div
			style={isInspectorSize ? inspectorTitleWrapper : titleWrapper}
			aria-label={ariaLabel ?? value}
			role="group"
		>
			<span
				style={innerStyle}
				className={HOVERABLE_CLASS_NAME}
				onClick={isEditing || !isInteractive ? undefined : handleClick}
			>
				<span
					aria-hidden={isEditing}
					style={{
						...gridItemStyle,
						visibility: isEditing ? 'hidden' : 'visible',
					}}
				>
					{value}
				</span>
				{isEditing ? (
					<input
						ref={focusInput}
						aria-label={ariaLabel ?? value}
						style={{...gridItemStyle, ...inputStyle}}
						value={draftValue}
						onChange={onChange}
						onBlur={onBlur}
						onKeyDown={onKeyDown}
					/>
				) : null}
			</span>
		</div>
	);
};
