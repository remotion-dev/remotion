import {test} from 'vitest';
import '../symbol-dispose';
import {svgAtRuleText} from './fixtures/svg-at-rule-text';
import {testCompositions} from './utils';

test('preserves SVG style predicates around comments, strings and URL tokens', async () => {
	await testCompositions({
		cases: (
			[
				{mode: 'comment-import', positive: false, frame: 0},
				{mode: 'double-string', positive: true, frame: 1},
				{mode: 'url-close-bracket', positive: false, frame: 1},
				{mode: 'url-escaped-name', positive: true, frame: 1},
				{mode: 'unterminated-comment', positive: true, frame: 0},
			] as const
		).map(({mode, positive, frame}) => ({
			composition: svgAtRuleText({mode, positive, literal: false}),
			frame,
		})),
		columns: 3,
		testId: 'svg-at-rule-text',
	});
});
