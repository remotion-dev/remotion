import type {executablePath as original} from '../../../functions/helpers/get-chromium-executable-path';

export const executablePath: typeof original = () => {
	return undefined;
};
