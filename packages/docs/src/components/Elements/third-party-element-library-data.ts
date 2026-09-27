export type ThirdPartyElementLibrary = {
	readonly bannerUrl: string | null;
	readonly browseUrl: string;
	readonly libraryUrl: string;
	readonly displayName: string;
};

export const thirdPartyElementLibraries = [
	{
		bannerUrl:
			'https://remotion.media/elements/third-party-libraries/remocn.png',
		browseUrl: 'https://remocn.dev/docs/components',
		libraryUrl: 'https://remocn.dev/docs/typography',
		displayName: 'Remocn',
	},
	{
		bannerUrl:
			'https://remotion.media/elements/third-party-libraries/lexington-themes.png',
		browseUrl: 'https://lexingtonthemes.com/remotion/free-templates',
		libraryUrl: 'https://lexingtonthemes.com/remotion/free-templates',
		displayName: 'Lexington Themes',
	},
] as const satisfies readonly ThirdPartyElementLibrary[];
