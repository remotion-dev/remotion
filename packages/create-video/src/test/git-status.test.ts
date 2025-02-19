import {expect, test} from 'bun:test';
import path from 'node:path';
import {checkGitAvailability} from '../init';

test('Get git status', async () => {
	const status = await checkGitAvailability(process.cwd(), 'git', [
		'--version',
	]);
	if (status.type !== 'is-git-repo') {
		throw new Error('is git repo');
	}

	expect(
		status.location ===
			path.posix.join(__dirname, '..', '..', '..', '..').replace(/\\/g, '/') ||
			status.location ===
				path.join(__dirname, '..', '..', '..', '..').replace(/\\/g, '/') ||
			status.location === 'D:/a/remotion/remotion',
	).toEqual(true);

	if (status.type !== 'is-git-repo') {
		throw new Error('is git repo');
	}

	const status2 = await checkGitAvailability(
		path.dirname(status.location),
		'git',
		['--version'],
	);
	expect(status2).toEqual({type: 'no-git-repo'});

	const status3 = await checkGitAvailability(
		path.dirname(status.location),
		'wronggitbinary',
		['--version'],
	);
	expect(status3).toEqual({type: 'git-not-installed'});
});
