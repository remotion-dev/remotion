import React, {useCallback, useRef, useState} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {inputBaseStyle} from '../NewComposition/RemInput';

const inputStyle: React.CSSProperties = {
	...inputBaseStyle,
	backgroundColor: 'transparent',
	borderColor: 'transparent',
	color: 'var(--remotion-cli-internals-blue)',
	fontSize: 12,
	height: 20,
	padding: '1px 6px',
	width: 100,
};

export const TimelineTransformOriginField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly effectiveValue: unknown;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
}> = ({
	field,
	propStatus,
	effectiveValue,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	if (field.fieldSchema.type !== 'transform-origin') {
		throw new Error(
			'TimelineTransformOriginField rendered for non-transform-origin field',
		);
	}

	const [draftValue, setDraftValue] = useState<string | null>(null);
	const cancelCommitRef = useRef(false);
	const value =
		draftValue ?? String(effectiveValue ?? field.fieldSchema.default);

	const commitValue = useCallback(
		(rawValue: string) => {
			const normalized = NoReactInternals.normalizeTransformOrigin(rawValue);
			if (normalized === propStatus.codeValue) {
				setDraftValue(null);
				onDragEnd();
				return;
			}

			onDragValueChange(normalized);
			onSave(normalized).finally(() => {
				setDraftValue(null);
				onDragEnd();
			});
		},
		[propStatus, onDragValueChange, onSave, onDragEnd],
	);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			setDraftValue(event.target.value);
		},
		[],
	);

	const onBlur: React.FocusEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			if (cancelCommitRef.current) {
				cancelCommitRef.current = false;
				return;
			}

			commitValue(event.target.value);
		},
		[commitValue],
	);

	const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			if (event.key === 'Enter') {
				event.currentTarget.blur();
			}

			if (event.key === 'Escape') {
				cancelCommitRef.current = true;
				setDraftValue(null);
				event.currentTarget.blur();
			}
		},
		[],
	);

	return (
		<input
			value={value}
			onChange={onChange}
			onBlur={onBlur}
			onKeyDown={onKeyDown}
			style={inputStyle}
		/>
	);
};
