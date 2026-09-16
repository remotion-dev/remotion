export type ThirdPartyElementLibrary = {
	readonly bannerUrl: string | null;
	readonly browseUrl: string;
	readonly catalogUrl: string;
	readonly displayName: string;
};

export const thirdPartyElementLibraries = [
	{
		bannerUrl:
			'https://remotion.media/elements/third-party-libraries/remocn.png',
		browseUrl: 'https://remocn.dev/docs/components',
		catalogUrl: 'https://remocn.dev/docs/typography',
		displayName: 'Remocn',
	},
] as const satisfies readonly ThirdPartyElementLibrary[];
