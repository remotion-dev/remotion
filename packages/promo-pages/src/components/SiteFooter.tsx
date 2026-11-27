import type {ComponentType} from 'react';
import {
	gitHubMark,
	instagramMark,
	linkedInMark,
	tikTokMark,
	xMark,
	youTubeMark,
} from './icons/social-media.js';

const socialLinks = [
	{
		label: 'GitHub',
		href: 'https://github.com/remotion-dev/remotion',
		icon: gitHubMark,
	},
	{label: 'X', href: 'https://x.com/remotion', icon: xMark},
	{
		label: 'Instagram',
		href: 'https://instagram.com/remotion',
		icon: instagramMark,
	},
	{
		label: 'LinkedIn',
		href: 'https://www.linkedin.com/company/remotion-dev/',
		icon: linkedInMark,
	},
	{
		label: 'YouTube',
		href: 'https://youtube.com/@remotion_dev',
		icon: youTubeMark,
	},
	{label: 'TikTok', href: 'https://www.tiktok.com/@remotion', icon: tikTokMark},
];

type FooterLink =
	| readonly [label: string, url: string]
	| readonly [
			label: string,
			url: string,
			kind: 'docs' | 'pro' | 'local' | 'external' | 'same-tab',
	  ];

type FooterRow = FooterLink | {inline: [FooterLink, ...FooterLink[]]};

const columns: {title: string; links: FooterRow[]}[] = [
	{
		title: 'Remotion',
		links: [
			['Getting started', '/docs/'],
			['Agent Plugins', '/docs/agents/plugins'],
			['Studio', '/docs/studio'],
			['Elements', '/elements/libraries'],
			['API Reference', '/docs/api'],
			['Player', '/player'],
			['Lambda', '/lambda'],
		],
	},
	{
		title: 'Community',
		links: [
			['GitHub', 'https://github.com/remotion-dev/remotion', 'external'],
			['Discord', 'https://remotion.dev/discord', 'external'],
			['Experts', '/experts'],
			['Success Stories', '/success-stories'],
			['Showcase', '/showcase'],
			['Resources', '/docs/resources'],
			['Contributing', '/docs/contributing'],
		],
	},
	{
		title: 'License & Legal',
		links: [
			['License', 'https://remotion.dev/license', 'external'],
			['Pricing', 'https://www.remotion.dev/pricing', 'same-tab'],
			['Dashboard', '/dashboard', 'pro'],
			['Terms', '/docs/terms'],
			['Privacy', '/docs/privacy'],
			{
				inline: [
					['DPA', '/docs/dpa'],
					['DPIA', '/docs/dpia'],
				],
			},
			['Acknowledgments', '/docs/acknowledgements'],
		],
	},
	{
		title: 'Company',
		links: [
			['About Us', '/about'],
			['Blog', '/blog'],
			['Contact Us', '/contact', 'local'],
			['Book a license call', 'https://cal.com/remotion/evaluate', 'external'],
			['Investors', '/docs/investors'],
			['Brand', 'https://remotion.dev/brand', 'external'],
		],
	},
	{
		title: 'More',
		links: [
			['Changelog', 'https://remotion.dev/changelog', 'external'],
			['Support', '/docs/get-help'],
			['FAQ', '/docs/license/faq'],
			['Accessibility Statement', '/docs/accessibility/dev'],
			['Sitemap', '/sitemap.xml', 'same-tab'],
		],
	},
];

type Props = {
	readonly site: 'docs' | 'pro';
	readonly pathname: string;
	readonly LinkComponent: ComponentType<{
		href: string;
		children: string;
		'aria-current': 'page' | undefined;
	}>;
};

export const SiteFooter = ({site, pathname, LinkComponent}: Props) => {
	const currentPath = pathname.replace(/\/$/, '');
	const renderLink = ([label, url, kind = 'docs']: FooterLink) => {
		if (kind === 'local' || kind === site) {
			return (
				<LinkComponent
					key={url}
					href={url}
					aria-current={
						currentPath === url.replace(/\/$/, '') ? 'page' : undefined
					}
				>
					{label}
				</LinkComponent>
			);
		}

		const remoteDocs = kind === 'docs';
		const href =
			remoteDocs || kind === 'pro' ? `https://www.remotion.dev${url}` : url;
		const newTab = remoteDocs || kind === 'external';
		return (
			<a
				key={url}
				href={href}
				target={newTab ? '_blank' : undefined}
				rel={newTab ? 'noopener noreferrer' : undefined}
			>
				{label}
				{kind === 'external' ? <span aria-hidden="true">&nbsp;↗</span> : null}
			</a>
		);
	};

	return (
		<footer className="remotion-site-footer">
			<div className="remotion-site-footer__inner">
				<div>
					<img
						className="remotion-site-footer__logo"
						src={
							site === 'docs' ? '/img/new-logo.png' : '/remotion-wordmark.png'
						}
						alt="Remotion"
						width={135}
						height={32}
					/>
					<ul
						className="remotion-site-footer__socials"
						aria-label="Social media"
					>
						{socialLinks.map(({label, href, icon}) => (
							<li key={label}>
								<a
									href={href}
									aria-label={label}
									aria-description="Opens in a new tab"
									title={label}
									target="_blank"
									rel="noopener noreferrer"
								>
									<svg
										viewBox={icon.viewBox}
										width={icon.width}
										height={icon.height}
										fill="currentColor"
										aria-hidden="true"
										focusable="false"
									>
										<path d={icon.path} />
									</svg>
								</a>
							</li>
						))}
					</ul>
					<p>© Copyright {new Date().getFullYear()} Remotion AG.</p>
				</div>
				<nav aria-label="Footer">
					{columns.map(({title, links}) => (
						<div key={title}>
							<h2>{title}</h2>
							<ul>
								{links.map((row) =>
									'inline' in row ? (
										<li
											key={row.inline[0][1]}
											className="remotion-site-footer__inline-links"
										>
											{row.inline.map(renderLink)}
										</li>
									) : (
										<li key={row[1]}>{renderLink(row)}</li>
									),
								)}
							</ul>
						</div>
					))}
				</nav>
			</div>
		</footer>
	);
};
