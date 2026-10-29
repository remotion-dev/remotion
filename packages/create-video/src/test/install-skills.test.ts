import {expect, test} from 'bun:test';
import {getSkillsAddArgs} from '../install-skills';

test('Install all skills selects every skill from remotion-dev/skills', () => {
	const args = getSkillsAddArgs('recommended');

	expect(args).toEqual([
		'-y',
		'--loglevel=error',
		'skills@1.7.0',
		'add',
		'remotion-dev/skills',
		'--agent',
		'universal',
		'--skill',
		'*',
		'--yes',
	]);
});

test('Choose individual skills leaves selection to the skills prompt', () => {
	const args = getSkillsAddArgs('choose');

	expect(args).toEqual([
		'-y',
		'--loglevel=error',
		'skills@1.7.0',
		'add',
		'remotion-dev/skills',
		'--agent',
		'universal',
	]);
});
