import path from 'path';
import execa from 'execa';
import xns from 'xns';
import {templateDirName, turnIntoUnderscore} from './dotfiles';

xns(async () => {
	await execa('rm', ['-rf', templateDirName]);
	await execa('git', [
		'clone',
		'https://github.com/jonnyburger/remotion-template',
		templateDirName,
	]);
	await execa('rm', ['-r', path.join(templateDirName, '.git')]);
	await turnIntoUnderscore(templateDirName);
	return 'Done.';
});
