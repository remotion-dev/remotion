import type {TypeOfOption} from '../client';

export type RemotionOption<SsrName extends string, Type> = {
	name: string;
	cliFlag: string;
	ssrName: SsrName | null;
	description: (mode: 'ssr' | 'cli') => React.ReactNode;
	docLink: string;
	type: Type;
	getValue: (
		values: {commandLine: Record<string, unknown>},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		more?: any,
	) => {
		value: Type;
		source: string;
	};
	setConfig: (value: Type) => void;
};

export type AnyRemotionOption<T> = RemotionOption<string, T>;

// Intentional any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToOptions<T extends Record<string, AnyRemotionOption<any>>> = {
	[K in keyof T]: TypeOfOption<T[K]>;
};
