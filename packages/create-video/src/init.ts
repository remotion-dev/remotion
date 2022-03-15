import chalk from 'chalk';
import execa from 'execa';
import {stripAnsi} from './strip-ansi';
import {Log} from './log';
import {openInEditorFlow} from './open-in-editor-flow';
import {
	getRenderCommand,
	getStartCommand,
	selectPackageManager,
} from './pkg-managers';
import prompts, {selectAsync} from './prompts';
import {resolveProjectRoot} from './resolve-project-root';
import {patchReadmeMd} from './patch-readme';
import {patchPackageJson} from './patch-package-json';
import {degit} from './degit';

type TEMPLATES = {
	shortName: string;
	description: string;
	org: string;
	repoName: string;
};

const FEATURED_TEMPLATES: TEMPLATES[] = [
	{
		shortName: 'Hello World',
		org: 'remotion-dev',
		repoName: 'template-helloworld',
		description: 'The default starter template (recommended)',
	},
	{
		shortName: 'Blank',
		description: 'Nothing except an empty canvas',
		org: 'remotion-dev',
		repoName: 'template-empty',
	},
	{
		shortName: 'Hello World (Javascript)',
		org: 'remotion-dev',
		repoName: 'template-helloworld-javascript',
		description: 'The default starter template in plain JS',
	},
	{
		shortName: 'React Three Fiber',
		org: 'remotion-dev',
		repoName: 'template-three',
		description: 'Remotion + React Three Fiber Starter Template',
	},
	{
		shortName: 'Still images',
		org: 'remotion-dev',
		repoName: 'template-still',
		description: 'Dynamic PNG/JPEG template with built-in server',
	},
	{
		shortName: 'Text To Speech',
		org: 'FelippeChemello',
		repoName: 'Remotion-TTS-Example',
		description: 'Turns text into speech and makes a video',
	},
	{
		shortName: 'Audiogram',
		org: 'marcusstenbeck',
		repoName: 'remotion-template-audiogram',
		description: 'Text and waveform visualization for podcasts',
	},
];

function padEnd(str: string, width: number): string {
	// Pulled from commander for overriding
	const len = Math.max(0, width - stripAnsi(str).length);
	return str + Array(len + 1).join(' ');
}

const isGitExecutableAvailable = async () => {
	try {
		await execa('git', ['--version']);
		return true;
	} catch (e) {
		if ((e as {errno: string}).errno === 'ENOENT') {
			Log.warn('Unable to find `git` command. `git` not in PATH.');
			return false;
		}
	}
};

const initGitRepoAsync = async (root: string): Promise<void> => {
	// not in git tree, so let's init
	try {
		await execa('git', ['init'], {cwd: root});
		await execa('git', ['add', '--all'], {cwd: root, stdio: 'ignore'});
		await execa('git', ['commit', '-m', 'Create new Remotion video'], {
			cwd: root,
			stdio: 'ignore',
		});
		await execa('git', ['branch', '-M', 'main'], {
			cwd: root,
			stdio: 'ignore',
		});
	} catch (e) {
		Log.error('Error creating git repository:', e);
		Log.error('Project has been created nonetheless.');
		// no-op -- this is just a convenience and we don't care if it fails
	}
};

export const init = async () => {
	const [projectRoot, folderName] = await resolveProjectRoot();
	await isGitExecutableAvailable();

	const descriptionColumn =
		Math.max(
			...FEATURED_TEMPLATES.map((t) =>
				typeof t === 'object' ? t.shortName.length : 0
			)
		) + 2;

	const selectedTemplate = (await selectAsync(
		{
			message: 'Choose a template:',
			optionsPerPage: 20,
			choices: FEATURED_TEMPLATES.map((template) => {
				if (typeof template === 'string') {
					return prompts.separator(template);
				}

				return {
					value: template,
					title:
						chalk.bold(padEnd(template.shortName, descriptionColumn)) +
						template.description.trim(),
				};
			}),
		},
		{}
	)) as TEMPLATES;

	const pkgManager = selectPackageManager();

	try {
		await degit({
			repoOrg: selectedTemplate.org,
			repoName: selectedTemplate.repoName,
			dest: projectRoot,
		});
		patchReadmeMd(projectRoot, pkgManager);
		patchPackageJson(projectRoot, folderName);
	} catch (e) {
		Log.error(e);
		Log.error('Error with template cloning. Aborting');
		process.exit(1);
	}

	Log.info(
		`Created project at ${chalk.blueBright(
			folderName
		)}. Installing dependencies...`
	);

	if (pkgManager === 'yarn') {
		Log.info('> yarn');
		const promise = execa('yarn', [], {
			cwd: projectRoot,
			stdio: 'inherit',
			env: {...process.env, ADBLOCK: '1', DISABLE_OPENCOLLECTIVE: '1'},
		});
		promise.stderr?.pipe(process.stderr);
		promise.stdout?.pipe(process.stdout);
		await promise;
	} else if (pkgManager === 'pnpm') {
		Log.info('> pnpm i');
		const promise = execa('pnpm', ['i'], {
			cwd: projectRoot,
			stdio: 'inherit',
			env: {...process.env, ADBLOCK: '1', DISABLE_OPENCOLLECTIVE: '1'},
		});
		promise.stderr?.pipe(process.stderr);
		promise.stdout?.pipe(process.stdout);
		await promise;
	} else {
		Log.info('> npm install');
		const promise = execa('npm', ['install', '--no-fund'], {
			stdio: 'inherit',
			cwd: projectRoot,
			env: {...process.env, ADBLOCK: '1', DISABLE_OPENCOLLECTIVE: '1'},
		});
		promise.stderr?.pipe(process.stderr);
		promise.stdout?.pipe(process.stdout);
		await promise;
	}

	await initGitRepoAsync(projectRoot);

	Log.info();
	Log.info(`Welcome to ${chalk.blueBright('Remotion')}!`);
	Log.info(
		`✨ Your video has been created at ${chalk.blueBright(folderName)}.`
	);
	await openInEditorFlow(projectRoot);

	Log.info('Get started by running');
	Log.info(chalk.blueBright(`cd ${folderName}`));
	Log.info(chalk.blueBright(getStartCommand(pkgManager)));
	Log.info('');
	Log.info('To render a video, run');
	Log.info(chalk.blueBright(getRenderCommand(pkgManager)));
	Log.info('');
	Log.info(
		'Docs to get you started:',
		chalk.underline('https://www.remotion.dev/docs/the-fundamentals')
	);
	Log.info('Enjoy Remotion!');
};
