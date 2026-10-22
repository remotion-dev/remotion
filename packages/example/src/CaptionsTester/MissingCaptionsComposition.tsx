import type {Caption} from '@remotion/captions';
import React from 'react';
import {Interactive, Sequence, type SequenceControls} from 'remotion';

type MissingCaptionsProps = {
	readonly captions: Caption[] | undefined;
};

const MissingCaptionsInner: React.FC<
	MissingCaptionsProps & {readonly controls: SequenceControls | undefined}
> = ({controls}) => {
	return (
		<Sequence controls={controls} name="Missing Captions">
			<div>Import captions in the inspector</div>
		</Sequence>
	);
};

const MissingCaptions = Interactive.withSchema({
	Component: MissingCaptionsInner,
	componentName: '<MissingCaptions>',
	schema: Interactive.captionsSchema,
	supportsEffects: false,
});

export const MissingCaptionsComposition: React.FC = () => {
	// @ts-expect-error This fixture intentionally omits the schema-declared prop.
	return <MissingCaptions />;
};
