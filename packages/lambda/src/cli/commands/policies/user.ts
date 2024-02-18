import type {LogLevel} from '@remotion/renderer';
import {getUserPolicy} from '../../../api/iam-validation/suggested-policy';
import {Log} from '../../log';

export const USER_SUBCOMMAND = 'user';

export const userSubcommand = (logLevel: LogLevel) => {
	Log.infoAdvanced({indent: false, logLevel}, getUserPolicy());
};
