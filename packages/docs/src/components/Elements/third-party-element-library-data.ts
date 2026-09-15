export type ThirdPartyElementLibrary = {
	readonly browseUrl: string;
	readonly catalogUrl: string;
	readonly description: string;
	readonly displayName: string;
};

export const thirdPartyElementLibraries = [
	{
		browseUrl: 'https://remocn.dev/docs/components',
		catalogUrl: 'https://remocn.dev/docs/typography',
		description:
			'A shadcn-style library of production-ready Remotion components for product demo videos made with AI agents.',
		displayName: 'Remocn',
	},
] as const satisfies readonly ThirdPartyElementLibrary[];
