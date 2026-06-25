import React, {useCallback, useRef} from 'react';
import type {
	CanUpdateSequencePropStatusStatic,
	SequencePropsSubscriptionKey,
} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {RemTextarea} from '../NewComposition/RemTextarea';
import {registerFocusInspectorFieldElement} from './focus-inspector-field';

export const TimelineTextContentField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly nodePath: SequencePropsSubscriptionKey | null;
	readonly onSave: TimelineFieldOnSave;
}> = ({effectiveValue, field, nodePath, onSave, propStatus}) => {
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const currentValue = String(effectiveValue ?? '');

	const setInputRef = useCallback(
		(element: HTMLTextAreaElement | null) => {
			inputRef.current = element;
			registerFocusInspectorFieldElement({
				element,
				fieldKey: field.key,
				nodePath,
			});
		},
		[field.key, nodePath],
	);

	const commit = useCallback(() => {
		const value = inputRef.current?.value ?? currentValue;
		if (value !== propStatus.codeValue) {
			onSave(value).catch(() => undefined);
		}
	}, [currentValue, onSave, propStatus.codeValue]);

	const onKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key === 'Escape') {
				event.currentTarget.value = String(propStatus.codeValue ?? '');
				event.currentTarget.blur();
			}
		},
		[propStatus.codeValue],
	);

	return (
		<RemTextarea
			key={currentValue}
			ref={setInputRef}
			status="ok"
			small
			defaultValue={currentValue}
			onBlur={commit}
			onKeyDown={onKeyDown}
			style={{
				boxSizing: 'border-box',
				height: 40,
				width: 160,
			}}
		/>
	);
};
