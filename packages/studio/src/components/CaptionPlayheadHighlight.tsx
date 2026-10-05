import type {Caption} from '@remotion/captions';
import type React from 'react';
import {useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {WHITE_ALPHA_06} from '../helpers/colors';
import {getCurrentFps} from './Timeline/imperative-state';
import {
	useCurrentTimelineSelectionStateAsRef,
	type TimelineSelection,
} from './Timeline/TimelineSelection';

// Subscribe beside the editor so frame changes do not render the caption rows.
export const CaptionPlayheadHighlight: React.FC<{
	readonly captions: Caption[];
	readonly getSequenceFrame: () => number;
	readonly containerRef: React.RefObject<HTMLDivElement | null>;
	readonly onInitialCaptionScrollRef: React.RefObject<(() => void) | null>;
}> = ({
	captions,
	getSequenceFrame,
	containerRef,
	onInitialCaptionScrollRef,
}) => {
	const frame = Internals.Timeline.useTimelinePosition();
	const {seek} = useContext(Internals.SetTimelineContext);
	const selection = useCurrentTimelineSelectionStateAsRef();
	const seekRevision = seek?.revision.current ?? 0;
	const {selectedItems} = selection.current;
	const suspended = useRef<{
		seekRevision: number;
		selectedItems: readonly TimelineSelection[];
	} | null>(null);
	const scrollContainer = useRef<{
		element: HTMLElement;
		scrollTop: number;
	} | null>(null);
	const highlighted = useRef<{
		captions: Caption[];
		index: number;
		row: HTMLDivElement | null;
	} | null>(null);

	useEffect(() => {
		let element = containerRef.current?.parentElement ?? null;
		while (
			element &&
			!['auto', 'scroll'].includes(getComputedStyle(element).overflowY)
		) {
			element = element.parentElement;
		}

		if (!element) {
			return;
		}

		const scroller = element;
		scrollContainer.current = {
			element: scroller,
			scrollTop: scroller.scrollTop,
		};
		onInitialCaptionScrollRef.current = () => {
			// The selection reveal is programmatic too: keep following after it
			// centers the caption instead of treating it as manual scrolling.
			suspended.current = null;
			if (scrollContainer.current) {
				scrollContainer.current.scrollTop = scroller.scrollTop;
			}
		};

		const onScroll = () => {
			// Ignore our own scrollIntoView. Any other scroll pauses following until
			// the user seeks or selects a sequence again, without React state.
			if (scroller.scrollTop === scrollContainer.current?.scrollTop) {
				return;
			}

			suspended.current = {
				seekRevision: seek?.revision.current ?? 0,
				selectedItems: selection.current.selectedItems,
			};
		};

		scroller.addEventListener('scroll', onScroll);

		return () => {
			scroller.removeEventListener('scroll', onScroll);
			scrollContainer.current = null;
			onInitialCaptionScrollRef.current = null;
		};
	}, [containerRef, onInitialCaptionScrollRef, seek, selection]);

	useEffect(() => {
		// Read after the Sequence has committed its local clock, including freezes
		// and loops. Only touch the DOM when the active caption or rows change,
		// or when a seek resumes following after editing or manual scrolling.
		const timeMs = (getSequenceFrame() / getCurrentFps()) * 1000;
		const index = captions.findIndex(
			(caption) => caption.startMs <= timeMs && caption.endMs > timeMs,
		);
		const isSuspended =
			suspended.current?.seekRevision === seekRevision &&
			suspended.current.selectedItems === selectedItems;
		const shouldResume = suspended.current !== null && !isSuspended;
		if (
			highlighted.current?.index === index &&
			highlighted.current.captions === captions &&
			!shouldResume
		) {
			return;
		}

		const row =
			index === -1
				? null
				: (containerRef.current?.querySelector<HTMLDivElement>(
						`[data-caption-row-index="${index}"]`,
					) ?? null);
		if (highlighted.current?.row !== row) {
			highlighted.current?.row?.style.removeProperty(
				'--remotion-active-caption-background',
			);
			row?.style.setProperty(
				'--remotion-active-caption-background',
				WHITE_ALPHA_06,
			);
		}

		highlighted.current = {captions, index, row};
		if (containerRef.current?.querySelector('[data-caption-index]:focus')) {
			suspended.current = {
				seekRevision,
				selectedItems,
			};
			return;
		}

		if (isSuspended) {
			return;
		}

		suspended.current = null;
		row?.scrollIntoView({block: 'nearest'});
		if (scrollContainer.current) {
			scrollContainer.current.scrollTop =
				scrollContainer.current.element.scrollTop;
		}
	}, [
		captions,
		containerRef,
		frame,
		getSequenceFrame,
		seekRevision,
		selectedItems,
	]);

	useEffect(() => {
		return () => {
			highlighted.current?.row?.style.removeProperty(
				'--remotion-active-caption-background',
			);
			highlighted.current = null;
		};
	}, []);

	return null;
};
