import type {LogLevel} from '@remotion/renderer';
import {getRolePolicy} from '../../../api/iam-validation/suggested-policy';
import {Log} from '../../log';
export const ROLE_SUBCOMMAND = 'role';

export const roleSubcommand = (logLevel: LogLevel) => {
	Log.infoAdvanced({indent: false, logLevel}, getRolePolicy());
};
