import {forceFlagProvided} from '../args';
import {quit} from './quit';
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

	if (result === false) {
		quit(1);
	}
};
