import {expect, test} from 'bun:test';
import {getClampedSplitterFlex} from '../components/Splitter/SplitterContext';

const getTimelineLabelsWidth = (availableSize: number, flexValue: number) => {
	return (
		getClampedSplitterFlex({
			availableSize,
			flexValue,
			maxAntiFlexerSize: null,
			maxFlex: 0.5,
			maxFlexerSize: null,
			minFlex: 0.15,
			minFlexerSize: 240,
		}) * availableSize
	);
};

test('keeps the timeline labels pane at least 240px wide while resizing', () => {
	expect(getTimelineLabelsWidth(1600, 0.2)).toBe(320);
	expect(getTimelineLabelsWidth(1000, 0.2)).toBe(240);
	expect(getTimelineLabelsWidth(800, 0.2)).toBe(240);
	expect(getTimelineLabelsWidth(400, 0.2)).toBe(240);
	expect(getTimelineLabelsWidth(1000, 0.8)).toBe(500);
});
