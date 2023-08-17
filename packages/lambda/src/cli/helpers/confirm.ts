import {forceFlagProvided} from '../args';
import {yesOrNo} from './yes-or-no';

export const confirmCli = async ({
	delMessage,
	allowForceFlag,
}: {
	delMessage: string;
	allowForceFlag: boolean;
}) => {
	if (allowForceFlag && forceFlagProvided) {
		return;
	}

	const result = await yesOrNo({question: delMessage, defaultValue: true});

	return result;
};
