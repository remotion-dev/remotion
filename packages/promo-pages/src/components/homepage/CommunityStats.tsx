import React from 'react';
import {
	Contributors,
	DiscordMembers,
	GitHubStars,
	InstallsPerMonth,
	PagesOfDocs,
	Since2021,
} from './CommunityStatsItems';

const SectionLink: React.FC<{
	readonly href: string;
	readonly children: React.ReactNode;
}> = ({href, children}) => (
	<a
		target="_blank"
		href={href}
		className="flex min-w-[200px] flex-1 text-[var(--subtitle)] no-underline transition-colors duration-150 ease-out hover:text-[var(--text-color)] hover:no-underline min-[900px]:min-w-0 min-[900px]:flex-none"
	>
		{children}
	</a>
);

const CommunityStats: React.FC = () => (
	<div className="m-auto max-w-[700px] text-center min-[900px]:max-w-none [.experimental-homepage_&]:max-w-none">
		<div className="mx-auto flex max-w-[700px] flex-wrap justify-between gap-4 w-full items-center min-[900px]:max-w-none min-[900px]:flex-nowrap">
			<SectionLink href="https://www.remotion.dev/about">
				<Since2021 />
			</SectionLink>
			<SectionLink href="https://www.npmjs.com/package/remotion">
				<InstallsPerMonth />
			</SectionLink>
			<SectionLink href="https://www.remotion.dev/docs/">
				<PagesOfDocs />
			</SectionLink>
			<SectionLink href="https://github.com/remotion-dev/remotion">
				<GitHubStars />
			</SectionLink>
			<SectionLink href="https://remotion.dev/discord">
				<DiscordMembers />
			</SectionLink>
			<SectionLink href="https://github.com/remotion-dev/remotion/graphs/contributors">
				<Contributors />
			</SectionLink>
		</div>
	</div>
);

export default CommunityStats;
