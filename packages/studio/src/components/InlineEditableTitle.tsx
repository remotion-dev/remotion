import type * as React from 'react';
import type {
	ChangeEventHandler,
	FocusEventHandler,
	KeyboardEventHandler,
} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
	WHITE_ALPHA_06,
	INPUT_BACKGROUND,
	TRANSPARENT,
	WHITE,
} from '../helpers/colors';

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
	fontSize: 12,
	gridArea: '1 / 1',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const titleInput: React.CSSProperties = {
	appearance: 'none',
	backgroundColor: TRANSPARENT,
	border: 'none',
	boxShadow: 'none',
	color: WHITE,
	fontFamily: 'inherit',
	fontSize: 12,
	height: 18,
	lineHeight: '18px',
	margin: 0,
	minWidth: 0,
	outline: 'none',
	overflow: 'hidden',
	padding: 0,
	WebkitAppearance: 'none',
	width: '100%',
};

export const InlineEditableTitle: React.FC<{
	readonly value: string;
	readonly canRename: boolean;
	readonly getInitialSelection?: (value: string) => [number, number];
	readonly onCommit: (newValue: string) => void;
	readonly title?: string;
}> = ({value, canRename, getInitialSelection, onCommit, title}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
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
			onCommit(newValue);
		},
		[onCommit],
	);

	const startEditing = useCallback(() => {
		if (!canRename) {
			return;
		}

		cancelledRef.current = false;
		setDraftValue(value);
		setIsEditing(true);
	}, [canRename, value]);

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
			}
		},
		[value],
	);

	const backgroundColor = isEditing
		? INPUT_BACKGROUND
		: isHovered && canRename
			? WHITE_ALPHA_06
			: TRANSPARENT;

	const innerStyle = useMemo((): React.CSSProperties => {
		return {
			...titleInner,
			backgroundColor,
			cursor: isEditing ? 'text' : canRename ? 'pointer' : 'default',
			userSelect: isEditing ? 'text' : 'none',
			width: isEditing ? '100%' : undefined,
		};
	}, [backgroundColor, canRename, isEditing]);

	return (
		<div style={titleWrapper} title={title ?? value}>
			<span
				style={innerStyle}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={isEditing || !canRename ? undefined : startEditing}
			>
				<span
					aria-hidden={isEditing}
					style={{
						...titleGridItem,
						visibility: isEditing ? 'hidden' : 'visible',
					}}
				>
					{value}
				</span>
				{isEditing ? (
					<input
						ref={focusInput}
						style={{...titleGridItem, ...titleInput}}
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
