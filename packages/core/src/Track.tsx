import React, {useContext, useMemo, useState} from 'react';
import {addSequenceStackTraces} from './enable-sequence-stack-traces.js';
import {
	sequenceSchema,
	type InteractivitySchema,
} from './interactivity-schema.js';
import {
	SequenceWithoutSchema,
	type AbsoluteFillLayout,
	type SequenceProps,
} from './Sequence.js';
import {
	ExperimentalTracksEnabledContext,
	TimelineTrackContext,
} from './timeline-track-context.js';
import {withInteractivitySchema} from './with-interactivity-schema.js';

export type TrackProps = Omit<
	SequenceProps,
	| keyof AbsoluteFillLayout
	| 'cropLeft'
	| 'cropRight'
	| 'cropTop'
	| 'cropBottom'
	| `_remotionInternal${string}`
	| 'outlineRef'
>;

// A packed row has no container bar to drag. Expose its linear timing in the
// inspector, but keep looping and freezing as programmatic operations.
const {
	freeze: _freeze,
	layout: _layout,
	...trackSequenceSchema
} = sequenceSchema;

const trackSchema = {
	...trackSequenceSchema,
	from: {
		...sequenceSchema.from,
		description: 'From',
		hiddenFromList: false,
		keyframable: false,
	},
	durationInFrames: {
		...sequenceSchema.durationInFrames,
		description: 'Duration',
		hiddenFromList: false,
		keyframable: false,
	},
	trimBefore: {
		...sequenceSchema.trimBefore,
		description: 'Trim before',
		hiddenFromList: false,
		keyframable: false,
	},
} as const satisfies InteractivitySchema;

// Series variants share the Track foundation while retaining their own
// Sequence props, layout defaults, and interactivity schemas.
export type TrackWithoutSchemaProps = Omit<
	SequenceProps,
	keyof AbsoluteFillLayout
> &
	(
		| (AbsoluteFillLayout & {layout: 'absolute-fill'})
		| ({layout?: 'none'} & {
				[Key in Exclude<keyof AbsoluteFillLayout, 'layout'>]?: never;
		  })
	);

export const TrackWithoutSchema: React.FC<TrackWithoutSchemaProps> = ({
	name = 'Track',
	children,
	layout = 'none',
	...props
}) => {
	const [id] = useState(() => String(Math.random()));
	const tracksEnabled = useContext(ExperimentalTracksEnabledContext);
	const value = useMemo(
		() => (tracksEnabled ? {id, name} : null),
		[id, name, tracksEnabled],
	);

	return (
		<TimelineTrackContext.Provider value={value}>
			<SequenceWithoutSchema
				_remotionInternalDocumentationLink="https://www.remotion.dev/docs/track"
				{...props}
				name={name}
				layout={layout}
				_remotionInternalTimelineTrack={{role: 'track', seriesOffset: null}}
			>
				{children}
			</SequenceWithoutSchema>
		</TimelineTrackContext.Provider>
	);
};

/** Groups clips on one Studio timeline row and applies Sequence timing. */
export const Track = withInteractivitySchema<typeof trackSchema, TrackProps>({
	Component: (props) => <TrackWithoutSchema {...props} layout="none" />,
	componentName: '<Track>',
	componentIdentity: 'dev.remotion.remotion.Track',
	schema: trackSchema,
	supportsEffects: false,
});

addSequenceStackTraces(Track);
