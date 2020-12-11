import execa from 'execa';
import xns from 'xns';

xns(async () => {
	await execa('rm', ['-rf', 'template']);
	await execa('git', [
		'clone',
		'https://github.com/jonnyburger/remotion-template',
		'template',
	]);
	return 'Done.';
});
