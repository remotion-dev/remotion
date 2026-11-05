import React, {useLayoutEffect, useRef, useState} from 'react';
import {startSlideViewTransition} from '../../helpers/slide-view-transition';
import {EffectPicker} from '../EffectPicker';
import {
	getTimelineSequenceSelectionKey,
	type TimelineSelection,
} from '../Timeline/TimelineSelection';
import {InspectorMessage} from './common';
import {EasingInspector} from './EasingInspector';
import {GuideInspector} from './GuideInspector';
import {isSequenceSectionSelection} from './inspector-selection';
import {KeyframeInspector} from './KeyframeInspector';
import {SequenceSelectionInspector} from './SequenceSelectionInspector';
import {container} from './styles';

const SelectedInspectorContent: React.FC<{
	readonly selection: TimelineSelection;
	readonly readOnlyStudio: boolean;
}> = React.memo(({selection, readOnlyStudio}) => {
	if (selection.type === 'sequence-all-effects') {
		return <EffectPicker selection={selection} />;
	}

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
});

export const SelectedInspector: React.FC<{
	readonly selection: TimelineSelection;
	readonly readOnlyStudio: boolean;
}> = ({selection, readOnlyStudio}) => {
	const panel = useRef<HTMLDivElement>(null);
	const transition = useRef<(() => void) | null>(null);
	const [displayedSelection, setDisplayedSelection] = useState(selection);
	const displayedSelectionRef = useRef(selection);
	const latestSelection = useRef(selection);
	latestSelection.current = selection;

	useLayoutEffect(() => {
		return () => transition.current?.();
	}, []);

	useLayoutEffect(() => {
		transition.current?.();
		transition.current = null;
		const previous = displayedSelectionRef.current;
		const update = () => {
			const next = latestSelection.current;
			displayedSelectionRef.current = next;
			setDisplayedSelection(next);
		};

		if (
			panel.current === null ||
			(previous.type === 'sequence-all-effects') ===
				(selection.type === 'sequence-all-effects') ||
			!isSequenceSectionSelection(previous) ||
			!isSequenceSectionSelection(selection) ||
			getTimelineSequenceSelectionKey(previous.nodePathInfo) !==
				getTimelineSequenceSelectionKey(selection.nodePathInfo)
		) {
			update();
			return;
		}

		transition.current = startSlideViewTransition({
			panels: [
				{
					element: panel.current,
					name: 'remotion-inspector',
					clipY: null,
				},
			],
			direction:
				selection.type === 'sequence-all-effects' ? 'forward' : 'backward',
			update,
		});
		if (transition.current === null) {
			update();
		}
	}, [selection]);

	return (
		<div ref={panel} style={container}>
			<SelectedInspectorContent
				selection={displayedSelection}
				readOnlyStudio={readOnlyStudio}
			/>
		</div>
	);
};
