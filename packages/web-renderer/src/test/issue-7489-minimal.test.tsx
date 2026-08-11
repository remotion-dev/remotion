import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {issue7489Minimal} from './fixtures/issue-7489-minimal';
import {testImage} from './utils';

test('should render issue-7489-minimal without collapsing inter-word spaces', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: issue7489Minimal,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'issue-7489-minimal', threshold: 0.02});
});
