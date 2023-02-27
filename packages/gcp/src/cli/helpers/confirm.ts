import {forceFlagProvided} from '../args';
import {yesOrNo} from './yes-or-no';

export const confirmCli = ({
	delMessage,
	allowForceFlag,
}: {
	delMessage: string;
	allowForceFlag: boolean;
}) => {
	if (allowForceFlag && forceFlagProvided) {
		return true;
	}

	return yesOrNo({question: delMessage, defaultValue: true});
};
