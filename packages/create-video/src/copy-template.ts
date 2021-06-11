import execa from 'execa';
import path from 'path';
import xns from 'xns';
import {templateFolderName, turnIntoUnderscore} from './dotfiles';

xns(async () => {
	await execa('rm', ['-rf', templateFolderName]);
	await execa('git', [
		'clone',
		'https://github.com/remotion-dev/template',
		templateFolderName,
	]);
	await execa('rm', ['-r', path.join(templateFolderName, '.git')]);
	await turnIntoUnderscore(templateFolderName);
	return 'Done.';
});
