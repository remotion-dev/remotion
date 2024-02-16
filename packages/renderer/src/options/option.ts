// eslint-disable-next-line no-restricted-imports
import type React from 'react';

export type RemotionOption<SsrName extends string, Type> = {
	name: string;
	cliFlag: string;
	ssrName: SsrName | null;
	description: (mode: 'ssr' | 'cli') => React.ReactNode;
	docLink: string;
	type: Type;
	getValue?: (values: {commandLine: Record<string, unknown>}) => {
		value: Type;
		source: string;
	};
	setConfig?: (value: Type) => void;
};

export type AnyRemotionOption<T = unknown> = RemotionOption<string, T>;

export type ToOptions<T extends Record<string, AnyRemotionOption>> = {
	[K in keyof T]: T[K]['type'];
};
