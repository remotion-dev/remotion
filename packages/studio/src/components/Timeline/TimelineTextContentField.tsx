import {parsePath} from '@remotion/paths';
import React, {useCallback, useRef, useState} from 'react';
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

const textAreaStyle: React.CSSProperties = {
	boxSizing: 'border-box',
	maxHeight: 160,
	minHeight: 40,
	minWidth: 0,
	overflowY: 'auto',
	width: '100%',
	...({
		fieldSizing: 'content',
	} satisfies React.CSSProperties & {fieldSizing: 'content'}),
};

const isValidPathData = (value: string): boolean => {
	if (value.trim() === '') {
		return true;
	}

	try {
		parsePath(value);
		return true;
	} catch {
		return false;
	}
};

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
	const [valid, setValid] = useState(true);
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
		if (field.typeName === 'svg-path' && !isValidPathData(value)) {
			latestRef.current.onDragEnd();
			return false;
		}

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
	}, [field.typeName]);

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
			const nextValid = field.typeName !== 'svg-path' || isValidPathData(value);
			setValid(nextValid);
			if (nextValid) {
				latestRef.current.onDragValueChange(value);
			}
		},
		[field.typeName],
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
				setValid(true);
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
			status={valid ? 'ok' : 'error'}
			aria-invalid={!valid}
			small
			defaultValue={currentValue}
			onBlur={commitPending}
			onChange={onChange}
			onDoubleClick={(event) => event.stopPropagation()}
			onKeyDownCapture={onKeyDownCapture}
			style={textAreaStyle}
		/>
	);
};
