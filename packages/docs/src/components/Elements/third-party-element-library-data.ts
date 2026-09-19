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
	{
		bannerUrl:
			'https://remotion.media/elements/third-party-libraries/lexington-themes.png',
		browseUrl: 'https://lexingtonthemes.com/remotion/free-templates',
		catalogUrl: 'https://lexingtonthemes.com/remotion/free-templates',
		displayName: 'Lexington Themes',
	},
	{
		bannerUrl: null,
		browseUrl: 'https://snapcn.dev/docs/components',
		catalogUrl: 'https://snapcn.dev/docs/components',
		displayName: 'snapcn',
	},
] as const satisfies readonly ThirdPartyElementLibrary[];
