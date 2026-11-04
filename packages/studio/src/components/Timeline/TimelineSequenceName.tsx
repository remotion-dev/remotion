import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {BLACK, TRANSPARENT, WHITE_ALPHA_72} from '../../helpers/colors';
import {ClippedTextTooltip} from '../ActionTooltip';
import {
	getTimelineColor,
	getTimelineSelectedLabelStyle,
	TIMELINE_SELECTED_LABEL_BACKGROUND,
} from './TimelineSelection';

const MAX_DISPLAY_NAME_LENGTH = 1000;
const MAX_RENAME_INPUT_WIDTH = 240;
const RENAME_INPUT_CLASS_NAME = 'remotion-timeline-sequence-name-input';
const LABEL_FONT_FAMILY = 'Arial, Helvetica, sans-serif';
// 4px gap + 12px chevron + 4px chevron margin.
const CHEVRON_SLOT_WIDTH = 20;

const nameTextStyle: React.CSSProperties = {
	fontFamily: LABEL_FONT_FAMILY,
	fontSize: 12,
	lineHeight: 'normal',
	color: 'inherit',
	minWidth: 0,
	paddingRight: 10,
	maskImage: 'linear-gradient(to right, black calc(100% - 10px), transparent)',
	WebkitMaskImage:
		'linear-gradient(to right, black calc(100% - 10px), transparent)',
	overflow: 'hidden',
	whiteSpace: 'nowrap',
};

const getTruncatedDisplayName = (displayName: string): string => {
	if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
		return displayName.slice(0, MAX_DISPLAY_NAME_LENGTH) + '...';
	}

	return displayName;
};

export const TimelineSequenceName: React.FC<{
	readonly displayName: string;
	readonly fallbackDisplayName: string;
	readonly selected: boolean;
	readonly containsSelection: boolean;
	readonly editing: boolean;
	readonly onCancelEditing: () => void;
	readonly onSaveName: (name: string) => Promise<void>;
	readonly chevronSlot: 'none' | 'empty' | 'occupied';
}> = ({
	displayName,
	fallbackDisplayName,
	selected,
	containsSelection,
	editing,
	onCancelEditing,
	onSaveName,
	chevronSlot,
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const nameTextRef = useRef<HTMLSpanElement>(null);
	const [draftName, setDraftName] = useState(displayName);
	const cancelNextBlurRef = useRef(false);
	const style = useMemo((): React.CSSProperties => {
		return {
			alignItems: 'center',
			alignSelf: 'stretch',
			...getTimelineSelectedLabelStyle(selected, false),
			display: 'inline-flex',
			flexShrink: 1,
			fontFamily: LABEL_FONT_FAMILY,
			fontSize: 12,
			lineHeight: 'normal',
			minWidth: 0,
			overflow: chevronSlot === 'none' ? 'hidden' : 'visible',
			position: chevronSlot === 'none' ? undefined : 'relative',
			whiteSpace: 'nowrap',
			color: getTimelineColor(selected, false),
			userSelect: 'none',
			WebkitUserSelect: 'none',
			textDecoration: 'none',
			boxShadow:
				containsSelection && !selected
					? `inset 0 0 0 2px ${TIMELINE_SELECTED_LABEL_BACKGROUND}`
					: undefined,
		};
	}, [selected, containsSelection, chevronSlot]);

	const inputStyle = useMemo((): React.CSSProperties => {
		return {
			...style,
			background: TRANSPARENT,
			border: 0,
			color: getTimelineColor(false, false),
			fontFamily: LABEL_FONT_FAMILY,
			fontSize: 12,
			outline: 'none',
			paddingBottom: 0,
			paddingTop: 0,
			boxSizing: 'border-box',
			maxWidth: MAX_RENAME_INPUT_WIDTH,
			minWidth: 0,
			userSelect: 'text',
			WebkitUserSelect: 'text',
		};
	}, [style]);

	const editableDisplayName = displayName || fallbackDisplayName;
	const text = getTruncatedDisplayName(editableDisplayName);

	useEffect(() => {
		if (!editing) {
			setDraftName(editableDisplayName);
			return;
		}

		const input = inputRef.current;
		if (!input) {
			return;
		}

		input.focus();
		input.select();
	}, [editableDisplayName, editing]);

	const save = useCallback(() => {
		onSaveName(draftName).catch(() => undefined);
	}, [draftName, onSaveName]);

	const onKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Escape') {
				cancelNextBlurRef.current = true;
				e.preventDefault();
				onCancelEditing();
				return;
			}

			if (e.key === 'Enter') {
				cancelNextBlurRef.current = true;
				e.preventDefault();
				save();
			}
		},
		[onCancelEditing, save],
	);

	const onBlur = useCallback(() => {
		if (cancelNextBlurRef.current) {
			cancelNextBlurRef.current = false;
			return;
		}

		save();
	}, [save]);

	if (editing) {
		return (
			<>
				<style>
					{`.${RENAME_INPUT_CLASS_NAME}::selection { background: ${WHITE_ALPHA_72}; color: ${BLACK}; }`}
				</style>
				<input
					ref={inputRef}
					className={RENAME_INPUT_CLASS_NAME}
					value={draftName}
					onChange={(e) => setDraftName(e.target.value)}
					onBlur={onBlur}
					onKeyDown={onKeyDown}
					size={Math.max(1, draftName.length)}
					style={inputStyle}
				/>
			</>
		);
	}

	if (chevronSlot !== 'none') {
		// Keep the name's flex width fixed while its visible text uses the empty slot.
		return (
			<div
				className="remotion-timeline-sequence-name-measure"
				data-name={text}
				style={{
					...style,
					backgroundColor: undefined,
					boxShadow: undefined,
					clipPath: chevronSlot === 'occupied' ? 'inset(0)' : undefined,
				}}
			>
				<ClippedTextTooltip
					overflowTarget={nameTextRef}
					label={editableDisplayName}
					shortcut={null}
					delay={800}
					dismissOnClick
					triggerStyle={{
						...getTimelineSelectedLabelStyle(selected, false),
						alignItems: 'center',
						boxShadow: style.boxShadow,
						boxSizing: 'border-box',
						color: getTimelineColor(selected, false),
						display: 'inline-flex',
						fontFamily: LABEL_FONT_FAMILY,
						fontSize: 12,
						height: '100%',
						left: 0,
						lineHeight: 'normal',
						maxWidth:
							chevronSlot === 'occupied'
								? 'calc(100% + 4px)'
								: `calc(100% + ${CHEVRON_SLOT_WIDTH}px)`,
						overflow: 'hidden',
						position: 'absolute',
						top: 0,
						whiteSpace: 'nowrap',
						width: 'max-content',
					}}
				>
					<span ref={nameTextRef} style={nameTextStyle}>
						{text}
					</span>
				</ClippedTextTooltip>
			</div>
		);
	}

	return (
		<ClippedTextTooltip
			overflowTarget={nameTextRef}
			label={editableDisplayName}
			shortcut={null}
			delay={800}
			dismissOnClick
			triggerStyle={style}
		>
			<span
				ref={nameTextRef}
				role="group"
				aria-label={text}
				style={nameTextStyle}
			>
				{text}
			</span>
		</ClippedTextTooltip>
	);
};
