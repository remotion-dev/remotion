import path from 'path';
import {expect, test} from 'vitest';
import {checkGitAvailability} from '../init';

test('Get git status', async () => {
	const status = await checkGitAvailability(process.cwd(), 'git');
	expect(status).toEqual({
		type: 'is-git-repo',
		location: path.join(__dirname, '..', '..', '..', '..'),
	});

	if (status.type !== 'is-git-repo') {
		throw new Error('is git repo');
	}

	const status2 = await checkGitAvailability(
		path.dirname(status.location),
		'git'
	);
	expect(status2).toEqual({type: 'no-git-repo'});

	const status3 = await checkGitAvailability(
		path.dirname(status.location),
		'wronggitbinary'
	);
	expect(status3).toEqual({type: 'git-not-installed'});
});
