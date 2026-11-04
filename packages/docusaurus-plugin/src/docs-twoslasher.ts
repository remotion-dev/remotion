import type {createTransformerFactory} from '@shikijs/twoslash/core';
import {createNativeTwoslasher} from './native-twoslash';

type DocsTwoslasher = {
	twoslasher: Parameters<typeof createTransformerFactory>[0];
	dispose: () => void;
};

export const createDocsTwoslasher = ({
	rootDirectory,
}: {
	rootDirectory: string;
}): DocsTwoslasher => {
	const native = createNativeTwoslasher({rootDirectory});
	return {
		twoslasher: (code: string, lang: string | undefined) =>
			native(code, lang ?? 'ts'),
		dispose: () => native.dispose(),
	};
};
