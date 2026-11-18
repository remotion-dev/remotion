export type ThirdPartyElementLibrary = {
	readonly bannerUrl: string | null;
	readonly browseUrl: string;
	readonly libraryUrl: string;
	readonly displayName: string;
	readonly markdownIndexUrl: string | null;
};

export const thirdPartyElementLibraries = [
	{
		bannerUrl:
			'https://remotion.media/elements/third-party-libraries/remocn.png',
		browseUrl: 'https://remocn.dev/docs/components',
		libraryUrl: 'https://remocn.dev/docs/typography',
		displayName: 'Remocn',
		markdownIndexUrl: 'https://remocn.dev/llms-components.txt',
	},
	{
		bannerUrl:
			'https://remotion.media/elements/third-party-libraries/lexington-themes.png',
		browseUrl: 'https://lexingtonthemes.com/remotion/free-templates',
		libraryUrl: 'https://lexingtonthemes.com/remotion/free-templates',
		displayName: 'Lexington Themes',
		markdownIndexUrl: null,
	},
	{
		bannerUrl:
			'https://remotion.media/elements/third-party-libraries/snapcn.webp',
		browseUrl: 'https://snapcn.dev/docs/components',
		libraryUrl: 'https://snapcn.dev/docs/components',
		displayName: 'snapcn',
		markdownIndexUrl: 'https://snapcn.dev/llms-components.txt',
	},
] as const satisfies readonly ThirdPartyElementLibrary[];
