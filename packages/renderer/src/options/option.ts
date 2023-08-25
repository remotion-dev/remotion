import type React from 'react';

export type RemotionOption<SsrName extends string, Type> = {
	name: string;
	cliFlag: string;
	ssrName: SsrName;
	description: (mode: 'ssr' | 'cli') => React.ReactNode;
	docLink: string;
	type: Type;
};

export type AnyRemotionOption = RemotionOption<string, unknown>;

export type ToOptions<T extends readonly AnyRemotionOption[]> = {
	[K in T[number]['ssrName']]: T[number]['type'];
};
