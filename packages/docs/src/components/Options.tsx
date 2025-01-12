import type {AnyRemotionOption} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type React from 'react';
import type {JSX} from 'react';

const options = Object.values(BrowserSafeApis.options);

const getOption = (id: string): AnyRemotionOption<unknown> => {
	const option = options.find((o) => o.cliFlag === id);

	if (!option) {
		throw new Error(
			`Unknown option "${id}". Available: ${options
				.map((o) => o.cliFlag)
				.join(', ')}`,
		);
	}

	return option;
};

export const Options: React.FC<{
	id: string;
	cli?: boolean;
}> = ({id, cli}) => {
	const option = getOption(id);

	return option.description(cli ? 'cli' : 'ssr') as JSX.Element;
};
