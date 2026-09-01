import {expect, test} from 'bun:test';
import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';

test('the upgrade skill update command lists every public Remotion skill', () => {
	const skillsDirectory = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'skills',
		'skills',
	);
	const publicSkillNames = readdirSync(skillsDirectory, {withFileTypes: true})
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
	const upgradeSkill = readFileSync(
		path.join(skillsDirectory, 'remotion-upgrade', 'SKILL.md'),
		'utf8',
	);
	const updateCommand = upgradeSkill.match(
		/^\s*npx skills update (?<skillNames>.+) --yes\s*$/m,
	);

	if (!updateCommand?.groups?.skillNames) {
		throw new Error('Could not find the skills update command');
	}

	expect(updateCommand.groups.skillNames.split(/\s+/).sort()).toEqual(
		publicSkillNames,
	);
});
