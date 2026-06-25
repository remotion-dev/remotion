import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {
	CanUpdateSequencePropStatusStatic,
	SequencePropsSubscriptionKey,
} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {RemTextarea} from '../NewComposition/RemTextarea';
import {
	subscribeToFocusInspectorFieldRequests,
	type FocusInspectorFieldRequest,
} from './focus-inspector-field';

export const TimelineTextContentField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly nodePath: SequencePropsSubscriptionKey | null;
	readonly onSave: TimelineFieldOnSave;
}> = ({effectiveValue, field, nodePath, onSave, propStatus}) => {
	const [value, setValue] = useState(String(effectiveValue ?? ''));
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const commit = useCallback(() => {
		if (value !== propStatus.codeValue) {
			onSave(value).catch(() => undefined);
		}
	}, [onSave, propStatus.codeValue, value]);

	const focusIfMatchingRequest = useCallback(
		(request: FocusInspectorFieldRequest) => {
			if (
				nodePath === null ||
				request.fieldKey !== field.key ||
				JSON.stringify(request.nodePath) !== JSON.stringify(nodePath)
			) {
				return;
			}

			requestAnimationFrame(() => {
				inputRef.current?.scrollIntoView({block: 'center'});
				inputRef.current?.focus();
				inputRef.current?.select();
			});
		},
		[field.key, nodePath],
	);

	useEffect(() => {
		return subscribeToFocusInspectorFieldRequests(focusIfMatchingRequest);
	}, [focusIfMatchingRequest]);

	useEffect(() => {
		setValue(String(effectiveValue ?? ''));
	}, [effectiveValue]);

	const onKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key === 'Escape') {
				setValue(String(propStatus.codeValue ?? ''));
				event.currentTarget.blur();
			}
		},
		[propStatus.codeValue],
	);

	return (
		<RemTextarea
			ref={inputRef}
			status="ok"
			small
			value={value}
			onChange={(event) => setValue(event.target.value)}
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
