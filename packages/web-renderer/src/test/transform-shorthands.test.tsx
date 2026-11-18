import {test} from 'vitest';
import '../symbol-dispose';
import {issue10441TransformShorthands} from './fixtures/transforms/issue-10441-transform-shorthands';
import {transformWithAllShorthands} from './fixtures/transforms/transform-with-all-shorthands';
import {transformWithAxisRotate} from './fixtures/transforms/transform-with-axis-rotate';
import {transformWithMultiComponentScale} from './fixtures/transforms/transform-with-multi-component-scale';
import {transformWithRotate} from './fixtures/transforms/transform-with-rotate';
import {transformWithScale} from './fixtures/transforms/transform-with-scale';
import {transformWithTranslate} from './fixtures/transforms/transform-with-translate';
import {testCompositions} from './utils';

test('combines transform properties with translate, rotate and scale shorthands', async () => {
	await testCompositions({
		scale: 0.25,
		cases: [
			issue10441TransformShorthands,
			transformWithScale,
			transformWithMultiComponentScale,
			transformWithRotate,
			transformWithAxisRotate,
			transformWithTranslate,
			transformWithAllShorthands,
		].map((composition) => ({composition, frame: 0})),
		columns: 3,
		testId: 'transform-shorthands',
	});
});
