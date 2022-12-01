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
	getPackageManagerVersion,
	getRenderCommandForTemplate,
	selectPackageManager,
} from './pkg-managers';
import {resolveProjectRoot} from './resolve-project-root';
import {selectTemplate} from './select-template';

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
	const latestRemotionVersionPromise = getLatestRemotionVersion();

	const selectedTemplate = await selectTemplate();

	const pkgManager = selectPackageManager();
	const pkgManagerVersion = await getPackageManagerVersion(pkgManager);

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
			packageManager: `${pkgManager}@${pkgManagerVersion}`
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

	await initGitRepoAsync(projectRoot);

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
