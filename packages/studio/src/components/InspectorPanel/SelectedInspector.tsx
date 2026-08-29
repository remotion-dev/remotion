import React from 'react';
import type {TimelineSelection} from '../Timeline/TimelineSelection';
import {InspectorMessage} from './common';
import {EasingInspector} from './EasingInspector';
import {GuideInspector} from './GuideInspector';
import {isSequenceSectionSelection} from './inspector-selection';
import {KeyframeInspector} from './KeyframeInspector';
import {SequenceSelectionInspector} from './SequenceSelectionInspector';

export const SelectedInspector: React.FC<{
	readonly selection: TimelineSelection;
	readonly readOnlyStudio: boolean;
}> = ({selection, readOnlyStudio}) => {
	if (isSequenceSectionSelection(selection)) {
		return (
			<SequenceSelectionInspector
				selection={selection}
				readOnlyStudio={readOnlyStudio}
			/>
		);
	}

	if (selection.type === 'keyframe') {
		return <KeyframeInspector selection={selection} />;
	}

	if (selection.type === 'easing') {
		return <EasingInspector selection={selection} />;
	}

	if (selection.type === 'guide') {
		return <GuideInspector selection={selection} />;
	}

	return <InspectorMessage>Inspector unavailable</InspectorMessage>;
};
