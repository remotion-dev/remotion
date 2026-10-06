import React, {useMemo, useState} from 'react';
import {addSequenceStackTraces} from './enable-sequence-stack-traces.js';
import {sequenceSchema} from './interactivity-schema.js';
import {SequenceWithoutSchema, type SequenceProps} from './Sequence.js';
import {TimelineTrackContext} from './timeline-track-context.js';
import {withInteractivitySchema} from './with-interactivity-schema.js';

export type TrackProps = Pick<
	SequenceProps,
	| 'children'
	| 'name'
	| 'from'
	| 'durationInFrames'
	| 'hidden'
	| 'showInTimeline'
>;

const trackSchema = {
	name: sequenceSchema.name,
	hidden: sequenceSchema.hidden,
};

// Series variants share the Track foundation while retaining their own
// Sequence props, layout defaults, and interactivity schemas.
export const TrackWithoutSchema: React.FC<SequenceProps> = ({
	name = 'Track',
	children,
	layout = 'none',
	...props
}) => {
	const [id] = useState(() => String(Math.random()));
	const value = useMemo(() => ({id, name}), [id, name]);

	return (
		<TimelineTrackContext.Provider value={value}>
			<SequenceWithoutSchema
				{...props}
				name={name}
				layout={layout}
				_remotionInternalTimelineTrack={{role: 'track'}}
			>
				{children}
			</SequenceWithoutSchema>
		</TimelineTrackContext.Provider>
	);
};

/** Groups clips on one Studio timeline row and applies Sequence timing. */
export const Track = withInteractivitySchema<typeof trackSchema, TrackProps>({
	Component: TrackWithoutSchema,
	componentName: '<Track>',
	componentIdentity: 'dev.remotion.remotion.Track',
	schema: trackSchema,
	supportsEffects: false,
});

addSequenceStackTraces(Track);
