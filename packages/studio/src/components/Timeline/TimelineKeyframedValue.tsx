import React, {useMemo} from 'react';
import type {
	CanUpdateSequencePropStatusKeyframed,
	CanUpdateSequencePropStatusTrue,
} from 'remotion';
import {Internals} from 'remotion';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {TimelineFieldValue} from './TimelineSchemaField';

const wrapperStyle: React.CSSProperties = {
	opacity: 0.5,
	pointerEvents: 'none',
};

const noop = () => undefined;
const noopAsync = () => Promise.resolve();

export const TimelineKeyframedValue: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatusKeyframed;
	readonly keyframeDisplayOffset: number;
}> = ({field, propStatus, keyframeDisplayOffset}) => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const jsxFrame = timelinePosition - keyframeDisplayOffset;

	const computedValue = useMemo(
		() =>
			Internals.interpolateKeyframedStatus({
				frame: jsxFrame,
				status: propStatus,
			}),
		[jsxFrame, propStatus],
	);

	const fakeStatus: CanUpdateSequencePropStatusTrue = useMemo(
		() => ({
			canUpdate: true,
			codeValue: computedValue,
		}),
		[computedValue],
	);

	if (computedValue === null) {
		return null;
	}

	return (
		<div style={wrapperStyle}>
			<TimelineFieldValue
				field={field}
				propStatus={fakeStatus}
				effectiveValue={computedValue}
				onSave={noopAsync}
				onDragValueChange={noop}
				onDragEnd={noop}
			/>
		</div>
	);
};
