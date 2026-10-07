import React, {useContext, useMemo} from 'react';
import {SplitterOriginContext} from '../Splitter/SplitterContext';
import {SPLITTER_HANDLE_SIZE} from '../Splitter/SplitterHandle';
import {TimelineSlider} from './TimelineSlider';
import {
	TimelineTimeIndicators,
	TimelineTimePlaceholders,
} from './TimelineTimeIndicators';
import {TimelineViewportBoundsContext} from './TimelineWidthProvider';

const TimelineTimeControlsInner: React.FC = () => {
	const origin = useContext(SplitterOriginContext);
	const viewport = useContext(TimelineViewportBoundsContext);
	const left = origin !== null && viewport ? viewport.left - origin : null;
	const labelsStyle = useMemo<React.CSSProperties>(
		() => ({
			position: 'absolute',
			left: 0,
			width: left === null ? 0 : left - SPLITTER_HANDLE_SIZE,
		}),
		[left],
	);
	const tracksStyle = useMemo<React.CSSProperties>(
		() => ({
			position: 'absolute',
			left: left ?? 0,
			width: viewport?.width ?? 0,
		}),
		[left, viewport?.width],
	);

	if (left === null) {
		return null;
	}

	// The enclosing horizontal splitter pane is the positioned ancestor.
	// Share its origin and the track viewport's existing measurement, keeping
	// these overlays outside the scrolling tracks without reading layout again.
	return (
		<>
			<div style={labelsStyle}>
				<TimelineTimePlaceholders />
			</div>
			<div style={tracksStyle}>
				<TimelineTimeIndicators />
				<TimelineSlider />
			</div>
		</>
	);
};

export const TimelineTimeControls = React.memo(TimelineTimeControlsInner);
