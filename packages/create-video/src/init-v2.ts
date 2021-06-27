import chalk from 'chalk';
import execa from 'execa';
import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import * as CreateDirectory from './create-directory';
import {Log} from './log';

const FEATURED_TEMPLATES = [
	{
		shortName: 'helloworld',
		name: 'template-helloworld',
		description: 'a helloworld app with react logo',
	},
	{
		shortName: 'helloworld (Javascript)',
		name: 'template-helloworld-javascript',
		description: 'same as helloworld but with Javascript configuration',
	},
];

function assertValidName(folderName: string) {
	const validation = CreateDirectory.validateName(folderName);
	if (typeof validation === 'string') {
		throw new Error(
			`Cannot create an app named ${chalk.red(
				`"${folderName}"`
			)}. ${validation}`
		);
	}
}

async function assertFolderEmptyAsync(
	projectRoot: string,
	folderName?: string
) {
	if (
		!(await CreateDirectory.assertFolderEmptyAsync({
			projectRoot,
			folderName,
			overwrite: false,
		}))
	) {
		const message = 'Try using a new directory name, or moving these files.';
		Log.newLine();
		Log.info(message);
		Log.newLine();
		throw new Error(message);
	}
}

const initGitRepoAsync = async (
	root: string,
	flags: {silent: boolean; commit: boolean} = {silent: false, commit: true}
) => {
	// let's see if we're in a git tree
	try {
		await execa('git', ['rev-parse', '--is-inside-work-tree'], {
			cwd: root,
		});
		!flags.silent &&
			Log.info(
				'New project is already inside of a git repo, skipping git init.'
			);
	} catch (e) {
		if (e.errno === 'ENOENT') {
			!flags.silent &&
				Log.warn('Unable to initialize git repo. `git` not in PATH.');
			return false;
		}
	}

	// not in git tree, so let's init
	try {
		await execa('git', ['init'], {cwd: root});
		!flags.silent && Log.info('Initialized a git repository.');

		if (flags.commit) {
			await execa('git', ['add', '--all'], {cwd: root, stdio: 'ignore'});
			await execa('git', ['commit', '-m', 'Created a new Remotion app'], {
				cwd: root,
				stdio: 'ignore',
			});
			await execa('git', ['branch', '-M', 'main'], {
				cwd: root,
				stdio: 'ignore',
			});
		}
		return true;
	} catch (e) {
		Log.verbose('git error:', e);
		// no-op -- this is just a convenience and we don't care if it fails
		return false;
	}
};

const resolveProjectRootAsync = async () => {
	let projectName = '';
	try {
		const {answer} = await prompts({
			type: 'text',
			name: 'answer',
			message: 'What would you like to name your app?',
			initial: 'my-app',
			validate: (name) => {
				const validation = CreateDirectory.validateName(
					path.basename(path.resolve(name))
				);
				if (typeof validation === 'string') {
					return 'Invalid project name: ' + validation;
				}
				return true;
			},
		});

		if (typeof answer === 'string') {
			projectName = answer.trim();
		}
	} catch (error) {
		// Handle the aborted message in a custom way.
		if (error.code !== 'ABORTED') {
			throw error;
		}
	}

	const projectRoot = path.resolve(projectName);
	const folderName = path.basename(projectRoot);

	assertValidName(folderName);

	await fs.ensureDir(projectRoot);

	await assertFolderEmptyAsync(projectRoot, folderName);

	return projectRoot;
};

export const init = async () => {
	// let projectName = process.argv[2];
	// console.log(projectName, 'new');
	const projectRoot = await resolveProjectRootAsync();
	await execa('git', [
		'clone',
		`https://github.com/remotion-dev/${FEATURED_TEMPLATES[0].name}`,
		projectRoot,
	]);
	await execa('rm', ['-r', path.join(projectRoot, '.git')]);

	const isGitInitialized = await initGitRepoAsync(projectRoot, {
		silent: true,
		commit: true,
	});

	console.log(projectRoot, isGitInitialized, 'nice');
};
