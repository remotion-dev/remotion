import type {Config} from '@docusaurus/types';
import elementSourceDependencies from './plugins/element-source-dependencies.js';
import remarkElementSource from './plugins/remark-element-source.js';
import remarkExportRaw from './plugins/remark-export-raw.js';
import {elementRegistry} from './src/components/Elements/element-registry';

const showGitLastUpdate =
	process.env.REMOTION_DOCS_DISABLE_GIT_LAST_UPDATE !== '1';

const config: Config = {
	title: 'Remotion | Make videos programmatically',
	tagline: 'Make videos programmatically',
	url: 'https://www.remotion.dev',
	baseUrl: '/',
	onBrokenLinks: 'throw',
	onBrokenAnchors: 'throw',
	markdown: {
		hooks: {
			onBrokenMarkdownLinks: 'warn',
		},
	},
	favicon: 'img/favicon.png',
	organizationName: 'remotion-dev', // Usually your GitHub org/user name.
	projectName: 'remotion', // Usually your repo name.
	future: {
		faster: true,
		v4: {
			removeLegacyPostBuildHeadAttribute: true,
		},
	},
	themeConfig: {
		algolia: {
			appId: 'PLSDUOL1CA',
			apiKey: '3e42dbd4f895fe93ff5cf40d860c4a85',
			indexName: 'remotion',
			contextualSearch: false,
		},
		image: 'img/social-preview.png',
		navbar: {
			logo: {
				alt: 'Remotion Logo',
				src: 'img/new-logo.png',
				srcDark: 'img/remotion-white.png',
			},
			items: [
				{
					to: '/docs',
					label: 'Docs',
					position: 'left',
					type: 'docSidebar',
					sidebarId: 'mainSidebar',
				},
				{
					to: '/docs/api',
					label: 'API',
					position: 'left',
					type: 'docSidebar',
					sidebarId: 'apiSidebar',
				},
				{
					type: 'dropdown',
					label: 'Products',
					position: 'left',
					items: [
						{to: '/docs/ai/plugins', label: 'Plugins'},
						{to: '/player', label: 'Player'},
						{to: '/lambda', label: 'Lambda'},
						{to: '/docs/editor-starter', label: 'Editor Starter'},
						{to: '/docs/timeline', label: 'Timeline'},
						{to: '/docs/recorder', label: 'Recorder'},
						{to: 'https://remotion.dev/convert', label: 'Convert'},
					],
				},
				{
					type: 'dropdown',
					label: 'Resources',
					position: 'left',
					items: [
						{to: '/elements', label: 'Elements'},
						{to: '/templates', label: 'Templates'},
						{to: 'https://remotion.dev/prompts', label: 'Prompts'},
						{to: 'learn', label: 'Learn'},
						{
							to: '/docs/resources',
							label: 'Resources',
						},
						{to: 'https://remotion.media', label: 'Test media'},
						{to: 'blog', label: 'Blog'},
						{to: 'showcase', label: 'Showcase'},
						{to: '/docs/support', label: 'Support'},
					],
				},
				{
					type: 'dropdown',
					label: 'Commercial',
					position: 'left',
					items: [
						{to: '/docs/license/pricing', label: 'License + Pricing'},
						{to: 'https://remotion.pro/store', label: 'Store'},
						{to: 'success-stories', label: 'Success Stories'},
						{to: 'experts', label: 'Experts'},
						{to: 'about', label: 'About us'},
						{to: '/docs/investors', label: 'Investors'},
						{to: 'contact', label: 'Contact us'},
					],
				},

				{
					href: 'https://github.com/remotion-dev/remotion',
					position: 'right',
					className: 'header-github-link',
					'aria-label': 'GitHub repository',
				},
				{
					href: 'https://remotion.dev/discord',
					position: 'right',
					className: 'header-discord-link',
					'aria-label': 'Discord',
				},
				{
					href: 'https://x.com/remotion',
					position: 'right',
					className: 'header-x-link',
					'aria-label': 'X / Twitter',
				},
			].filter(Boolean),
		},
		footer: {
			style: 'light',
			links: [
				{
					title: 'Remotion',
					items: [
						{
							label: 'Getting started',
							to: '/docs/',
						},
						{
							label: 'Elements',
							to: '/elements',
						},
						{
							label: 'Templates',
							to: '/templates',
						},
						{
							label: 'API Reference',
							to: '/docs/api',
						},
						{
							label: 'Player',
							to: '/player',
						},
						{
							label: 'Lambda',
							to: '/lambda',
						},
						{
							label: 'Convert a video',
							to: 'https://convert.remotion.dev',
						},
						{
							label: 'Store',
							href: 'https://remotion.pro/store',
						},
						{
							label: 'GitHub',
							href: 'https://github.com/remotion-dev/remotion',
						},
						{
							label: 'Changelog',
							href: 'https://remotion.dev/changelog',
						},
						{
							label: 'License & Pricing',
							to: '/docs/license/pricing',
						},
					],
				},
				{
					title: 'Community',
					items: [
						{
							label: 'Prompt Showcase',
							to: 'https://remotion.dev/prompts',
						},
						{
							label: 'Showcase',
							to: 'showcase',
						},
						{
							label: 'Success Stories',
							to: 'success-stories',
						},
						{
							label: 'Experts',
							to: 'experts',
						},
						{
							label: 'Discord',
							href: 'https://remotion.dev/discord',
						},
						{
							label: 'X',
							href: 'https://x.com/remotion',
						},
						{
							label: 'YouTube',
							href: 'https://youtube.com/@remotion_dev',
						},
						{
							label: 'LinkedIn',
							href: 'https://www.linkedin.com/company/remotion-dev/',
						},
						{
							label: 'Instagram',
							href: 'https://instagram.com/remotion',
						},
						{
							label: 'TikTok',
							href: 'https://www.tiktok.com/@remotion',
						},
					],
				},
				{
					title: 'Company',
					items: [
						{
							label: 'About Us',
							to: 'about',
						},
						{
							label: 'Contact Us',
							to: 'contact',
						},
						{
							label: 'Investors',
							to: '/docs/investors',
						},
						{
							label: 'Brand',
							href: 'https://remotion.dev/brand',
						},
					],
				},
				{
					title: 'Legal & Trust',
					items: [
						{
							label: 'Terms and Conditions',
							to: '/docs/terms',
						},
						{
							label: 'Privacy Policy',
							to: '/docs/privacy',
						},
						{
							label: 'DPA Statement',
							to: '/docs/dpa',
						},
						{
							label: 'DPIA Statement',
							to: '/docs/dpia',
						},
						{
							label: 'Acknowledgments',
							to: '/docs/acknowledgements',
						},
					],
				},
				{
					title: 'More',
					items: [
						{
							label: 'Blog',
							to: 'blog',
						},
						{
							label: 'Support',
							to: '/docs/support',
						},
						{
							label: 'Accessibility',
							to: '/docs/accessibility',
						},
					],
				},
			],
		},
		colorMode: {
			respectPrefersColorScheme: true,
		},
	},
	presets: [
		[
			'classic',
			{
				docs: {
					path: 'docs',
					sidebarPath: './sidebars.ts',
					editUrl:
						'https://github.com/remotion-dev/remotion/edit/main/packages/docs/',
					showLastUpdateTime: showGitLastUpdate,
					remarkPlugins: [remarkExportRaw],
				},
				blog: {
					onInlineAuthors: 'ignore',
					onUntruncatedBlogPosts: 'ignore',
					showReadingTime: true,
					// Please change this to your repo.
					editUrl:
						'https://github.com/remotion-dev/remotion/edit/main/packages/docs/blog/',
				},
				theme: {
					customCss: [
						require.resolve('./src/css/custom.css'),
						require.resolve('./docusaurus-theme-shiki-twoslash/theme/CodeBlock/styles.css'),
					],
				},
			},
		],
		[
			'./shiki',
			{
				vfsRoot: process.cwd(),
				themes: ['github-dark'],
				defaultCompilerOptions: {
					types: ['node'],
				},
			},
		],
	],
	plugins: [
		elementSourceDependencies,
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'elements',
				path: './elements',
				routeBasePath: 'elements',
				sidebarPath: './elements-sidebars.ts',
				editUrl:
					'https://github.com/remotion-dev/remotion/edit/main/packages/docs/',
				showLastUpdateTime: showGitLastUpdate,
				beforeDefaultRemarkPlugins: [[remarkElementSource, {elementRegistry}]],
				remarkPlugins: [remarkExportRaw],
			},
		],
		[
			'@docusaurus/plugin-content-blog',
			{
				/**
				 * Required for any multi-instance plugin
				 */
				id: 'success-stories',
				/**
				 * URL route for the blog section of your site.
				 * *DO NOT* include a trailing slash.
				 */
				routeBasePath: 'success-stories',
				/**
				 * Path to data on filesystem relative to site dir.
				 */
				path: './success-stories',
				blogSidebarTitle: 'Success stories',
				onUntruncatedBlogPosts: 'ignore',
				onInlineAuthors: 'ignore',
			},
		],
		[
			'@docusaurus/plugin-content-blog',
			{
				/**
				 * Required for any multi-instance plugin
				 */
				id: 'learn',
				/**
				 * URL route for the blog section of your site.
				 * *DO NOT* include a trailing slash.
				 */
				routeBasePath: 'learn',
				/**
				 * Path to data on filesystem relative to site dir.
				 */
				path: './learn',
				blogSidebarTitle: 'Learn',
				onUntruncatedBlogPosts: 'ignore',
				onInlineAuthors: 'ignore',
				remarkPlugins: [remarkExportRaw],
			},
		],
		'./route-plugin',
	],
};

export default config;
