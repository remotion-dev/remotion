import {CliInternals} from '@remotion/cli';
import {deleteFunction} from '../../../api/delete-function';
import {getFunctionInfo} from '../../../api/get-function-info';
import {getFunctions} from '../../../api/get-functions';
import {getAwsRegion} from '../../get-aws-region';
import {confirmCli} from '../../helpers/confirm';
import {Log} from '../../log';

export const FUNCTIONS_RMALL_SUBCOMMAND = 'rmall';
const LEFT_COL = 16;

export const functionsRmallCommand = async () => {
	const region = getAwsRegion();
	const functions = await getFunctions({
		region,
		compatibleOnly: false,
	});

	for (const fun of functions) {
		const infoOutput = CliInternals.createOverwriteableCliOutput(
			CliInternals.quietFlagProvided()
		);
		infoOutput.update('Getting function info...');
		const info = await getFunctionInfo({
			region,
			functionName: fun.functionName,
		});

		infoOutput.update(
			[
				'Function name: '.padEnd(LEFT_COL, ' ') + ' ' + info.functionName,
				'Memory: '.padEnd(LEFT_COL, ' ') + ' ' + info.memorySizeInMb + 'MB',
				'Timeout: '.padEnd(LEFT_COL, ' ') + ' ' + info.timeoutInSeconds + 'sec',
				'Version: '.padEnd(LEFT_COL, ' ') + ' ' + info.version,
			].join('\n')
		);
		Log.info();

		await confirmCli({delMessage: 'Delete? (Y/n)', allowForceFlag: true});
		const output = CliInternals.createOverwriteableCliOutput(
			CliInternals.quietFlagProvided()
		);
		output.update('Deleting...');
		await deleteFunction({region, functionName: fun.functionName});
		output.update('Deleted!\n');
	}
};
