import {expect, test} from 'bun:test';
import {getConfigFileChangeMessage} from '../config-file-change';

test('returns the config file change messages', () => {
	expect(getConfigFileChangeMessage('runtime')).toBe('Config file changed');
	expect(getConfigFileChangeMessage('reload')).toBe(
		'Reload page to apply config file changes',
	);
	expect(getConfigFileChangeMessage('restart')).toBe(
		'Restart Studio to apply config file changes',
	);
});
