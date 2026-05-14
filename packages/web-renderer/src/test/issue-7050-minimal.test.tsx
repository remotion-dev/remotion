import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {issue7050Minimal} from './fixtures/issue-7050-minimal';
import {testImage} from './utils';

test('should render issue-7050-minimal', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: issue7050Minimal,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'issue-7050-minimal'});
});
