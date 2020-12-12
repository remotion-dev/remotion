import chalk from 'chalk';
import execa from 'execa';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import xns from 'xns';
import {templateDirName, turnIntoDot} from './dotfiles';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const askQuestion = (question: string) => {
	return new Promise<string>((resolve) => {
		rl.question(question, (s) => resolve(s));
	});
};

xns(async () => {
	const arg = process.argv[2];
	let selectedDirname = arg?.match(/[a-zA-Z0-9-]+/g) ? arg : '';
	while (selectedDirname === '') {
		const answer =
			(await askQuestion(
				`What is the name of your project? ${chalk.gray('(my-video)')} `
			)) || 'my-video';
		if (answer.match(/[a-zA-Z0-9-]+/g)) {
			selectedDirname = answer;
		} else {
			console.log('Name must match /[a-zA-Z0-9-]+/g.');
		}
	}

	const templateDir = path.join(__dirname, '..', templateDirName);
	const outputDir = path.join(process.cwd(), selectedDirname);

	if (fs.existsSync(outputDir)) {
		console.log(`Directory ${selectedDirname} already exists. Quitting.`);
		return;
	}
	await execa('cp', ['-r', templateDir, selectedDirname]);
	await turnIntoDot(templateDirName);
	console.log(
		`Created project at ${chalk.blue(
			selectedDirname
		)}. Installing dependencies...`
	);
	console.log('');
	console.log('> npm install');
	const promise = execa('npm', ['install'], {
		cwd: outputDir,
	});
	promise.stderr?.pipe(process.stderr);
	promise.stdout?.pipe(process.stdout);
	await promise;

	console.log(`Welcome to ${chalk.blue('Remotion')}!`);
	console.log(
		`✨ Your video has been created at ${chalk.blue(selectedDirname)}.\n`
	);

	console.log('Get started by running');
	console.log(chalk.blue(`cd ${selectedDirname}`));
	console.log(chalk.blue('npm start'));
	console.log('');
	console.log('To render an MP4 video, run');
	console.log(chalk.blue('npm run build'));
	console.log('');
	console.log('Enjoy Remotion!');
});
