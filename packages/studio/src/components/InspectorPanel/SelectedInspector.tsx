import React, {useLayoutEffect, useRef, useState} from 'react';
import {startSlideViewTransition} from '../../helpers/slide-view-transition';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {
	getTimelineSequenceSelectionKey,
	type TimelineSelection,
} from '../Timeline/TimelineSelection';
import {InspectorMessage} from './common';
import {EasingInspector} from './EasingInspector';
import {GuideInspector} from './GuideInspector';
import {isSequenceSectionSelection} from './inspector-selection';
import {KeyframeInspector} from './KeyframeInspector';
import {SequenceInspectorSections} from './SequenceInspectorHeader';
import {SequenceSelectionInspector} from './SequenceSelectionInspector';
import {scrollableContainer} from './styles';
import {useTrackForSelection} from './use-track-for-selection';

const headerStyle: React.CSSProperties = {
	flexShrink: 0,
};

const contentStyle: React.CSSProperties = {
	display: 'flex',
	flex: '1 0 auto',
	flexDirection: 'column',
};

const SelectedInspectorContent: React.FC<{
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

export const SelectedInspector: React.FC<{
	readonly selection: TimelineSelection;
	readonly readOnlyStudio: boolean;
}> = ({selection, readOnlyStudio}) => {
	const [displayedSelection, setDisplayedSelection] = useState(selection);
	const displayedSelectionRef = useRef(selection);
	const panelRef = useRef<HTMLDivElement>(null);
	const track = useTrackForSelection(displayedSelection);

	useLayoutEffect(() => {
		const previous = displayedSelectionRef.current;
		if (previous === selection) {
			return;
		}

		const forward =
			isSequenceSectionSelection(previous) &&
			(selection.type === 'keyframe' || selection.type === 'easing');
		const backward =
			(previous.type === 'keyframe' || previous.type === 'easing') &&
			isSequenceSectionSelection(selection);
		const panel = panelRef.current;
		if (
			(!forward && !backward) ||
			getTimelineSequenceSelectionKey(previous.nodePathInfo) !==
				getTimelineSequenceSelectionKey(selection.nodePathInfo) ||
			panel === null
		) {
			displayedSelectionRef.current = selection;
			setDisplayedSelection(selection);
			return;
		}

		// Defer only the inspector DOM swap; timeline selection stays synchronous.
		const update = () => {
			displayedSelectionRef.current = selection;
			setDisplayedSelection(selection);
		};

		const cancel = startSlideViewTransition({
			panels: [{element: panel, name: 'remotion-inspector', clipY: null}],
			direction: forward ? 'forward' : 'backward',
			update,
		});
		if (cancel === null) {
			update();
			return;
		}

		return cancel;
	}, [selection]);

	return (
		<div style={scrollableContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			{track === null ? null : (
				<div style={headerStyle}>
					<SequenceInspectorSections
						key={
							track.nodePathInfo
								? getTimelineSequenceSelectionKey(track.nodePathInfo)
								: track.sequence.id
						}
						track={track}
					/>
				</div>
			)}
			<div ref={panelRef} style={contentStyle}>
				<SelectedInspectorContent
					selection={displayedSelection}
					readOnlyStudio={readOnlyStudio}
				/>
			</div>
		</div>
	);
};
