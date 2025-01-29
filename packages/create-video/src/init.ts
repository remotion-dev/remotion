import chalk from 'chalk';
import execa from 'execa';
import path from 'node:path';
import {
	addPostcssConfig,
	addTailwindRootCss,
	addTailwindToConfig,
} from './add-tailwind';
import {createYarnYmlFile} from './add-yarn2-support';
import {askTailwind} from './ask-tailwind';
import {createPublicFolder} from './create-public-folder';
import {degit} from './degit';
import {getLatestRemotionVersion} from './latest-remotion-version';
import {Log} from './log';
import {openInEditorFlow} from './open-in-editor-flow';
import {patchPackageJson} from './patch-package-json';
import {patchReadmeMd} from './patch-readme';
import {
	getDevCommand,
	getInstallCommand,
	getPackageManagerVersionOrNull,
	getRenderCommand,
	selectPackageManager,
} from './pkg-managers';
import {resolveProjectRoot} from './resolve-project-root';
import {selectTemplate} from './select-template';
import {yesOrNo} from './yesno';

const gitExists = (commandToCheck: string, argsToCheck: string[]) => {
	try {
		execa.sync(commandToCheck, argsToCheck);
		return true;
	} catch {
		return false;
	}
};

export const checkGitAvailability = async (
	cwd: string,
	commandToCheck: string,
	argsToCheck: string[],
): Promise<
	| {type: 'no-git-repo'}
	| {type: 'is-git-repo'; location: string}
	| {type: 'git-not-installed'}
> => {
	if (!gitExists(commandToCheck, argsToCheck)) {
		return {type: 'git-not-installed'};
	}

	try {
		const result = await execa('git', ['rev-parse', '--show-toplevel'], {
			cwd,
		});
		return {type: 'is-git-repo', location: result.stdout};
	} catch {
		return {
			type: 'no-git-repo',
		};
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
	Log.info(`Welcome to ${chalk.blue('Remotion')}!`);
	const {projectRoot, folderName} = await resolveProjectRoot();
	Log.info();

	const result = await checkGitAvailability(projectRoot, 'git', ['--version']);

	if (result.type === 'git-not-installed') {
		Log.error(
			'Git is not installed or not in the path. Install Git to continue.',
		);
		process.exit(1);
	}

	if (result.type === 'is-git-repo') {
		const should = await yesOrNo({
			defaultValue: false,
			question: `You are already inside a Git repo (${path.resolve(
				result.location,
			)}).\nThis might lead to a Git Submodule being created. Do you want to continue? (y/N):`,
		});
		if (!should) {
			process.exit(1);
		}
	}

	const latestRemotionVersionPromise = getLatestRemotionVersion();

	const selectedTemplate = await selectTemplate();

	const shouldOverrideTailwind = selectedTemplate.allowEnableTailwind
		? await askTailwind()
		: false;

	const pkgManager = selectPackageManager();
	const pkgManagerVersion = await getPackageManagerVersionOrNull(pkgManager);

	try {
		await degit({
			repoOrg: selectedTemplate.org,
			repoName: selectedTemplate.repoName,
			dest: projectRoot,
		});
		patchReadmeMd(projectRoot, pkgManager, selectedTemplate);
		if (shouldOverrideTailwind) {
			addTailwindToConfig(projectRoot);
			addPostcssConfig(projectRoot);
			addTailwindRootCss(projectRoot);
		}

		createPublicFolder(projectRoot);

		const latestVersion = await latestRemotionVersionPromise;
		patchPackageJson({
			projectRoot,
			projectName: folderName,
			latestRemotionVersion: latestVersion,
			packageManager: pkgManager,
			addTailwind: shouldOverrideTailwind,
		});
	} catch (e) {
		Log.error(e);
		Log.error('Error with template cloning. Aborting');
		process.exit(1);
	}

	createYarnYmlFile({
		pkgManager,
		pkgManagerVersion,
		projectRoot,
	});

	await getGitStatus(projectRoot);

	const relativeToCurrent = path.relative(process.cwd(), projectRoot);
	const cdToFolder = relativeToCurrent.startsWith('.')
		? projectRoot
		: relativeToCurrent;

	Log.info();
	Log.info(
		`Copied ${chalk.blue(
			selectedTemplate.shortName,
		)} to ${chalk.blue(cdToFolder)}.`,
	);
	Log.info();

	Log.info('Get started by running:');
	Log.info(' ' + chalk.blue(`cd ${cdToFolder}`));
	Log.info(' ' + chalk.blue(getInstallCommand(pkgManager)));
	Log.info(' ' + chalk.blue(getDevCommand(pkgManager, selectedTemplate)));
	Log.info('');
	Log.info('To render a video, run:');
	Log.info(' ' + chalk.blue(getRenderCommand(pkgManager)));
	Log.info('');
	Log.info(
		'Docs to get you started:',
		chalk.underline('https://www.remotion.dev/docs/the-fundamentals'),
	);
	Log.info();
	await openInEditorFlow(projectRoot);
	Log.info('Enjoy Remotion!');
};
