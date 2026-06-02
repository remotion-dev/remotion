import React, {useMemo} from 'react';
import type {
	CanUpdateSequencePropStatus,
	CanUpdaterSequencePropStatusStatic,
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
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly keyframeDisplayOffset: number;
}> = ({field, propStatus, keyframeDisplayOffset}) => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const jsxFrame = timelinePosition - keyframeDisplayOffset;

	const computedValue = useMemo(() => {
		if (!('keyframes' in propStatus)) {
			return null;
		}

		const raw = Internals.interpolateKeyframedStatus({
			frame: jsxFrame,
			status: propStatus,
		});
		if (typeof raw === 'number') {
			return Math.round(raw * 100) / 100;
		}

		return raw;
	}, [jsxFrame, propStatus]);

	const fakeStatus: CanUpdaterSequencePropStatusStatic = useMemo(
		() => ({
			canUpdate: true,
			codeValue: computedValue,
			keyframed: false,
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
