import type React from 'react';

export type RemotionOption<
	SsrName extends string,
	Type extends Zod.ZodTypeAny
> = {
	name: string;
	cliFlag: string;
	ssrName: SsrName;
	description: React.ReactNode;
	docLink: string;
	type: Type;
};

export type AnyRemotionOption = RemotionOption<string, Zod.ZodTypeAny>;
