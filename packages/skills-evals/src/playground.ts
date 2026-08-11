import {mkdir, rm, symlink} from 'node:fs/promises';
import {dirname, join, relative, resolve} from 'node:path';
import {runCommand} from './command';
import {
	copyBlankTemplate,
	getSkillNames,
	packageRoot,
	skillsSource,
} from './skill-project';

const playgroundRoot = resolve(packageRoot, '.playground');

const linkSkills = async () => {
	const projectSkillsRoot = join(playgroundRoot, '.agents', 'skills');
	const skillNames = await getSkillNames();

	await rm(projectSkillsRoot, {force: true, recursive: true});
	await mkdir(projectSkillsRoot, {recursive: true});

	for (const skillName of skillNames) {
		const source = join(skillsSource, skillName);
		const destination = join(projectSkillsRoot, skillName);
		const target =
			process.platform === 'win32'
				? source
				: relative(dirname(destination), source);

		await symlink(
			target,
			destination,
			process.platform === 'win32' ? 'junction' : 'dir',
		);
	}

	return skillNames.length;
};

const main = async () => {
	const args = process.argv.slice(2);
	if (args.length > 0) {
		throw new Error(`Unknown option "${args[0]}".`);
	}

	await rm(playgroundRoot, {force: true, recursive: true});
	await copyBlankTemplate({
		projectName: 'remotion-skills-playground',
		projectRoot: playgroundRoot,
	});
	const skillCount = await linkSkills();

	process.stdout.write('Installing the playground dependencies...\n');
	const install = await runCommand({
		command: ['bun', 'install'],
		cwd: playgroundRoot,
		onOutput: ({chunk}) => process.stdout.write(chunk),
	});

	if (install.exitCode !== 0) {
		throw new Error(`bun install failed (${install.exitCode}).`);
	}

	process.stdout.write(
		`\nPlayground ready with ${skillCount} linked skills.\n\n` +
			`Start Codex in:\n${playgroundRoot}\n`,
	);
};

main();
