import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {border} from './fixtures/border';
import {testImage} from './utils';

test('should render border', async () => {
	const blob = await renderStillOnWeb({
		composition: border,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'border'});
});

// TODO: Implement different borders for each side
// https://github.com/remotion-dev/remotion/pull/6060#discussion_r2611487707
test.todo(
	'should render border for all sides, https://github.com/remotion-dev/remotion/pull/6060#discussion_r2611487707',
);
