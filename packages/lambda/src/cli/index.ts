import {parsedCli} from './args';
import {cleanupCommand, CLEANUP_COMMAND} from './cleanup';
import {deployCommand, DEPLOY_COMMAND} from './deploy';
import {printHelp} from './help';
import {infoCommand} from './info';
import {Log} from './log';
import {renderCommand, RENDER_COMMAND} from './render';
import {uploadCommand, UPLOAD_COMMAND} from './upload';

export const cli = async () => {
	if (parsedCli.help || parsedCli._.length === 0) {
		printHelp();
		process.exit(0);
	}

	if (parsedCli._[0] === 'info') {
		await infoCommand();
		return;
	}

	if (parsedCli._[0] === DEPLOY_COMMAND) {
		return deployCommand();
	}

	if (parsedCli._[0] === UPLOAD_COMMAND) {
		return uploadCommand();
	}

	if (parsedCli._[0] === RENDER_COMMAND) {
		return renderCommand();
	}

	if (parsedCli._[0] === CLEANUP_COMMAND) {
		return cleanupCommand(parsedCli._.slice(1));
	}

	Log.error(`Command ${parsedCli._[0]} not found.`);
	printHelp();
	process.exit(1);
};
