import {forceFlagProvided} from '../args';
import {yesOrNo} from './yes-or-no';

export const confirmCli = async ({
	delMessage,
	allowForceFlag,
}: {
	delMessage: string;
	allowForceFlag: boolean;
}): Promise<boolean> => {
	if (allowForceFlag && forceFlagProvided) {
		return true;
	}

	const result = await yesOrNo({question: delMessage, defaultValue: true});

	return result;
};
