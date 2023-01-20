import chalk from 'chalk';
import execa from 'execa';
import {degit} from './degit';
import {getLatestRemotionVersion} from './latest-remotion-version';
import {Log} from './log';
import {openInEditorFlow} from './open-in-editor-flow';
import {patchPackageJson} from './patch-package-json';
import {patchReadmeMd} from './patch-readme';
import {
	getDevCommand,
	getPackageManagerVersionOrNull,
	getRenderCommandForTemplate,
	selectPackageManager,
} from './pkg-managers';
import {resolveProjectRoot} from './resolve-project-root';
import {selectTemplate} from './select-template';

export const checkGitAvailability = async (
	cwd: string,
	command: string
): Promise<
	| {type: 'no-git-repo'}
	| {type: 'is-git-repo'; location: string}
	| {type: 'git-not-installed'}
> => {
	try {
		const result = await execa(command, ['rev-parse', '--show-toplevel'], {
			cwd,
		});
		return {type: 'is-git-repo', location: result.stdout};
	} catch (e) {
		if ((e as Error).message.includes('not a git repository')) {
			return {type: 'no-git-repo'};
		}

		if ((e as {code: string}).code === 'ENOENT') {
			return {type: 'git-not-installed'};
		}

		// win32
		if ((e as {stderr: string}).stderr.includes('is not recognized')) {
			return {type: 'git-not-installed'};
		}

		throw e;
	}
};

const getGitStatus = async (root: string): Promise<void> => {
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
	const result = await checkGitAvailability(process.cwd(), 'git');
	if (result.type === 'git-not-installed') {
		Log.error(
			'Git is not installed or not in the path. Install Git to continue.'
		);
		process.exit(1);
	}

	if (result.type === 'is-git-repo') {
		Log.error(`You are already inside a Git repo (${result.location}).`);
		Log.error('Create a Remotion project somewhere else.');
		process.exit(1);
	}

	const [projectRoot, folderName] = await resolveProjectRoot();

	const latestRemotionVersionPromise = getLatestRemotionVersion();

	const selectedTemplate = await selectTemplate();

	const pkgManager = selectPackageManager();
	const pkgManagerVersion = await getPackageManagerVersionOrNull(pkgManager);

	try {
		await degit({
			repoOrg: selectedTemplate.org,
			repoName: selectedTemplate.repoName,
			dest: projectRoot,
		});
		patchReadmeMd(projectRoot, pkgManager);
		const latestVersion = await latestRemotionVersionPromise;
		patchPackageJson({
			projectRoot,
			projectName: folderName,
			latestRemotionVersion: latestVersion,
			packageManager: pkgManagerVersion
				? `${pkgManager}@${pkgManagerVersion}`
				: null,
		});
	} catch (e) {
		Log.error(e);
		Log.error('Error with template cloning. Aborting');
		process.exit(1);
	}

	Log.info(
		`Copied ${chalk.blueBright(
			selectedTemplate.shortName
		)} to ${chalk.blueBright(folderName)}. Installing dependencies...`
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

	await getGitStatus(projectRoot);

	Log.info();
	Log.info(`Welcome to ${chalk.blueBright('Remotion')}!`);
	Log.info(
		`✨ Your video has been created at ${chalk.blueBright(folderName)}.`
	);
	await openInEditorFlow(projectRoot);

	Log.info('Get started by running');
	Log.info(chalk.blueBright(`cd ${folderName}`));
	Log.info(chalk.blueBright(getDevCommand(pkgManager, selectedTemplate)));
	Log.info('');
	Log.info('To render a video, run');
	Log.info(
		chalk.blueBright(getRenderCommandForTemplate(pkgManager, selectedTemplate))
	);
	Log.info('');
	Log.info(
		'Docs to get you started:',
		chalk.underline('https://www.remotion.dev/docs/the-fundamentals')
	);
	Log.info('Enjoy Remotion!');
};
