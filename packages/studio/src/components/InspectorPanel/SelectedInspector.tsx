import React, {useLayoutEffect, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
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
import {container} from './styles';
import {useTrackForSelection} from './use-track-for-selection';

const headerStyle: React.CSSProperties = {
	flexShrink: 0,
};

const contentStyle: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minHeight: 0,
	overflow: 'hidden',
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
			panel === null ||
			typeof document.startViewTransition !== 'function' ||
			typeof flushSync !== 'function' ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			displayedSelectionRef.current = selection;
			setDisplayedSelection(selection);
			return;
		}

		// Defer only the inspector DOM swap; timeline selection stays synchronous.
		const root = document.documentElement;
		const transitionClass = forward
			? '__remotion-inspector-forward'
			: '__remotion-inspector-backward';
		root.classList.add(transitionClass);
		panel.style.setProperty('view-transition-name', 'remotion-inspector');
		let cancelled = false;

		const cleanup = () => {
			root.classList.remove(transitionClass);
			panel.style.removeProperty('view-transition-name');
		};

		const transition = document.startViewTransition(() => {
			if (cancelled) {
				return;
			}

			flushSync(() => {
				displayedSelectionRef.current = selection;
				setDisplayedSelection(selection);
			});
		});
		// A skipped transition still applies its update, but rejects `ready`.
		transition.ready.catch(() => undefined);
		transition.finished.then(
			() => {
				if (!cancelled) {
					cleanup();
				}
			},
			() => {
				if (!cancelled) {
					cleanup();
				}
			},
		);

		return () => {
			cancelled = true;
			transition.skipTransition();
			cleanup();
		};
	}, [selection]);

	return (
		<div style={container}>
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
