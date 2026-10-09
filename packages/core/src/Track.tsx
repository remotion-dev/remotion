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

type TrackContainerProps = AbsoluteFillLayout &
	Pick<SequenceProps, 'cropLeft' | 'cropRight' | 'cropTop' | 'cropBottom'>;

export type TrackProps = Omit<
	SequenceProps,
	keyof TrackContainerProps | `_remotionInternal${string}` | 'outlineRef'
> &
	(
		| (TrackContainerProps & {layout: 'absolute-fill'})
		| ({layout?: 'none'} & {
				[Key in Exclude<keyof TrackContainerProps, 'layout'>]?: never;
		  })
	);

// A packed row has no container bar to drag. Expose its linear timing in the
// inspector, but keep looping and freezing as programmatic operations.
const {freeze: _freeze, ...trackSequenceSchema} = sequenceSchema;

const trackSchema = {
	...trackSequenceSchema,
	from: {
		...sequenceSchema.from,
		description: 'Start',
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
	layout: {
		...sequenceSchema.layout,
		default: 'none',
		variants: {
			...sequenceSchema.layout.variants,
			'absolute-fill': {
				...sequenceSchema.layout.variants['absolute-fill'],
				// Switching to layout="none" must remove the entire container
				// props, including CSS properties without individual controls.
				style: {type: 'hidden'},
				className: {type: 'hidden'},
				styleWhilePremounted: {type: 'hidden'},
				styleWhilePostmounted: {type: 'hidden'},
			},
		},
	},
} as const satisfies InteractivitySchema;

// Series variants share the Track foundation while retaining their own
// Sequence props, layout defaults, and interactivity schemas.
export const TrackWithoutSchema: React.FC<SequenceProps> = ({
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
	Component: TrackWithoutSchema,
	componentName: '<Track>',
	componentIdentity: 'dev.remotion.remotion.Track',
	schema: trackSchema,
	supportsEffects: false,
});

addSequenceStackTraces(Track);
