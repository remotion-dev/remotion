import {expect, test} from 'bun:test';
import {getTimelineSequenceRenameSelection} from '../components/Timeline/TimelineSequenceName';

test('selects the full sequence name for renaming', () => {
	expect(getTimelineSequenceRenameSelection('<Interactive.Span>')).toEqual([
		0, 18,
	]);
	expect(getTimelineSequenceRenameSelection('clip.final.mp4')).toEqual([0, 14]);
	expect(getTimelineSequenceRenameSelection('')).toEqual([0, 0]);
});
