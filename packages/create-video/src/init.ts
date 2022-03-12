import chalk from 'chalk';
import degit from 'degit';
import execa from 'execa';
import fs from 'fs';
import path from 'path';
import {stripAnsi} from './strip-ansi';
import {Log} from './log';
import {openInEditorFlow} from './open-in-editor-flow';
import {
	getRenderCommand,
	getStartCommand,
	selectPackageManager,
} from './pkg-managers';
import prompts, {selectAsync} from './prompts';
import {homedir, tmpdir} from 'os';
import {resolveProjectRoot} from './resolve-project-root';
import {patchReadmeMd} from './patch-readme';
import {patchPackageJson} from './patch-package-json';

type TEMPLATES = {
	shortName: string;
	name: string;
	description: string;
};

const FEATURED_TEMPLATES: TEMPLATES[] = [
	{
		shortName: 'Hello World',
		name: 'remotion-dev/template-helloworld',
		description: 'The default starter template (recommended)',
	},
	{
		shortName: 'Blank',
		name: 'remotion-dev/template-empty',
		description: 'Nothing except an empty canvas',
	},
	{
		shortName: 'Hello World (Javascript)',
		name: 'remotion-dev/template-helloworld-javascript',
		description: 'The default starter template in plain JS',
	},
	{
		shortName: 'React Three Fiber',
		name: 'remotion-dev/template-three',
		description: 'Remotion + React Three Fiber Starter Template',
	},
	{
		shortName: 'Still images',
		name: 'remotion-dev/template-still',
		description: 'Dynamic PNG/JPEG template with built-in server',
	},
	{
		shortName: 'Text To Speech',
		name: 'FelippeChemello/Remotion-TTS-Example',
		description: 'Turns text into speech and makes a video',
	},
	{
		shortName: 'Audiogram',
		name: 'marcusstenbeck/remotion-template-audiogram',
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
					value: template.name,
					title:
						chalk.bold(padEnd(template.shortName, descriptionColumn)) +
						template.description.trim(),
				};
			}),
		},
		{}
	)) as string;

	const pkgManager = selectPackageManager();

	try {
		const homeOrTmp = homedir() || tmpdir();

		// Remove degit cache because of https://github.com/remotion-dev/remotion/issues/852
		// https://github.com/Rich-Harris/degit/issues/313
		const degitFolder = path.join(
			homeOrTmp,
			'.degit',
			'github',
			...selectedTemplate.split('/')
		);

		if (fs.existsSync(degitFolder)) {
			await (fs.promises.rm ?? fs.promises.rmdir)(degitFolder, {
				recursive: true,
			});
		}

		const emitter = degit(`https://github.com/${selectedTemplate}`);
		await emitter.clone(projectRoot);
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
