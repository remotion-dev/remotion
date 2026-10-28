import type {transformerTwoslash} from '@remotion/typescript-tools/shiki-twoslash';
import {createTwoslasher} from '@remotion/typescript-tools/twoslash';
import {createNativeTwoslasher} from './native-twoslash';
import {getTwoslashCompilerOptions, getTwoslashEngine} from './twoslash-cache';

type DocsTwoslasher = {
	twoslasher: NonNullable<
		NonNullable<Parameters<typeof transformerTwoslash>[0]>['twoslasher']
	>;
	dispose: () => void;
};

export const createDocsTwoslasher = ({
	rootDirectory,
}: {
	rootDirectory: string;
}): DocsTwoslasher => {
	if (getTwoslashEngine() === 'native') {
		const native = createNativeTwoslasher({rootDirectory});
		return {
			twoslasher: (code: string, lang: string | undefined) =>
				native(code, lang ?? 'ts'),
			dispose: () => native.dispose(),
		};
	}

	return {
		twoslasher: createTwoslasher({
			vfsRoot: rootDirectory,
			compilerOptions: getTwoslashCompilerOptions(),
		}),
		dispose: () => undefined,
	};
};
