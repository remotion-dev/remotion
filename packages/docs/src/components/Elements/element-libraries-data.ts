export type ElementLibraryEntry = {
	readonly bannerUrl: string | null;
	readonly browseUrl: string;
	readonly captionStylesUrl: string | null;
	readonly libraryUrl: string;
	readonly displayName: string;
	readonly markdownIndexUrl: string | null;
};

export const elementLibraries = [
	{
		bannerUrl: '/img/elements-og.png',
		browseUrl: '/elements',
		captionStylesUrl: 'https://www.remotion.dev/elements/captions',
		libraryUrl: 'https://www.remotion.dev/elements',
		displayName: 'Remotion Elements',
		markdownIndexUrl: 'https://www.remotion.dev/elements/index.md',
	},
	{
		bannerUrl:
			'https://remotion.media/elements/third-party-libraries/remocn.png',
		browseUrl: 'https://remocn.dev/docs/components',
		captionStylesUrl: null,
		libraryUrl: 'https://remocn.dev/docs/typography',
		displayName: 'Remocn',
		markdownIndexUrl: 'https://remocn.dev/llms-components.txt',
	},
	{
		bannerUrl:
			'https://remotion.media/elements/third-party-libraries/lexington-themes.png',
		browseUrl: 'https://lexingtonthemes.com/remotion/free-templates',
		captionStylesUrl: null,
		libraryUrl: 'https://lexingtonthemes.com/remotion/free-templates',
		displayName: 'Lexington Themes',
		markdownIndexUrl: null,
	},
	{
		bannerUrl:
			'https://remotion.media/elements/third-party-libraries/snapcn.webp',
		browseUrl: 'https://snapcn.dev/docs/components',
		captionStylesUrl: null,
		libraryUrl: 'https://snapcn.dev/docs/components',
		displayName: 'snapcn',
		markdownIndexUrl: 'https://snapcn.dev/llms-components.txt',
	},
] as const satisfies readonly ElementLibraryEntry[];
