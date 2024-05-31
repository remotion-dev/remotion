import type {LogLevel} from '@remotion/renderer';
import {getUserPolicy} from '../../../api/iam-validation/suggested-policy';
import {Log} from '../../log';

export const USER_SUBCOMMAND = 'user';

export const userSubcommand = (logLevel: LogLevel) => {
	Log.info({indent: false, logLevel}, getUserPolicy());
};
