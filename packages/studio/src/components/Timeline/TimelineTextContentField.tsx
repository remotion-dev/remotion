import React, {useCallback, useRef} from 'react';
import type {
	CanUpdateSequencePropStatusStatic,
	SequencePropsSubscriptionKey,
} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {RemTextarea} from '../NewComposition/RemTextarea';
import {
	registerCommitPendingInspectorField,
	registerFocusInspectorFieldElement,
} from './focus-inspector-field';

export const TimelineTextContentField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly nodePath: SequencePropsSubscriptionKey | null;
	readonly onDragEnd: () => void;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onSave: TimelineFieldOnSave;
}> = ({
	effectiveValue,
	field,
	nodePath,
	onDragEnd,
	onDragValueChange,
	onSave,
	propStatus,
}) => {
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const currentValue = String(effectiveValue ?? '');
	const draftRef = useRef({
		dirty: false,
		value: currentValue,
	});
	const latestRef = useRef({
		codeValue: propStatus.codeValue,
		onDragEnd,
		onDragValueChange,
		onSave,
	});

	latestRef.current = {
		codeValue: propStatus.codeValue,
		onDragEnd,
		onDragValueChange,
		onSave,
	};

	if (!draftRef.current.dirty) {
		draftRef.current.value = currentValue;
	}

	const commitPending = useCallback(() => {
		if (!draftRef.current.dirty) {
			return false;
		}

		const value = inputRef.current?.value ?? draftRef.current.value;
		const savedValue = String(latestRef.current.codeValue ?? '');
		draftRef.current = {
			dirty: false,
			value,
		};

		if (value === savedValue) {
			latestRef.current.onDragEnd();
			return false;
		}

		latestRef.current
			.onSave(value)
			.finally(() => {
				if (!draftRef.current.dirty && draftRef.current.value === value) {
					latestRef.current.onDragEnd();
				}
			})
			.catch(() => undefined);

		return true;
	}, []);

	const setInputRef = useCallback(
		(element: HTMLTextAreaElement | null) => {
			if (element === null && inputRef.current !== null) {
				commitPending();
			}

			inputRef.current = element;
			registerFocusInspectorFieldElement({
				element,
				fieldKey: field.key,
				nodePath,
			});
			registerCommitPendingInspectorField({
				commitPending: element === null ? null : commitPending,
				fieldKey: field.key,
				nodePath,
			});
		},
		[commitPending, field.key, nodePath],
	);

	const onChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>) => {
			const {value} = event.currentTarget;
			draftRef.current = {
				dirty: true,
				value,
			};
			latestRef.current.onDragValueChange(value);
		},
		[],
	);

	const onKeyDownCapture = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key === 'Escape') {
				const savedValue = String(latestRef.current.codeValue ?? '');
				draftRef.current = {
					dirty: false,
					value: savedValue,
				};
				event.currentTarget.value = savedValue;
				latestRef.current.onDragEnd();
				event.currentTarget.blur();
			}
		},
		[],
	);

	return (
		<RemTextarea
			key={String(propStatus.codeValue ?? '')}
			ref={setInputRef}
			status="ok"
			small
			defaultValue={currentValue}
			onBlur={commitPending}
			onChange={onChange}
			onKeyDownCapture={onKeyDownCapture}
			style={{
				boxSizing: 'border-box',
				height: 40,
				width: 160,
			}}
		/>
	);
};
