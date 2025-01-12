import React from 'react';
import {
	Contributors,
	DiscordMembers,
	GitHubStars,
	InstallsPerMonth,
	PagesOfDocs,
	TemplatesAndExamples,
} from './CommunityStatsItems';
import {SectionTitle} from './VideoAppsTitle';

const SectionLink: React.FC<{
	readonly href: string;
	readonly children: React.ReactNode;
}> = ({href, children}) => (
	<a
		target="_blank"
		href={href}
		className={'no-underline text-inherit contents'}
	>
		{children}
	</a>
);

const CommunityStats: React.FC = () => (
	<div className={'m-auto max-w-[700px] text-center'}>
		<SectionTitle>Never build alone</SectionTitle>
		<div className={'fontbrand text-center mb-10'}>
			Join a thriving community of developers.
		</div>
		<div className={'flex flex-wrap justify-between gap-4 w-full items-center'}>
			<SectionLink href="https://www.npmjs.com/package/remotion">
				<InstallsPerMonth />
			</SectionLink>
			<SectionLink href="https://www.remotion.dev/docs/">
				<PagesOfDocs />
			</SectionLink>
			<SectionLink href="https://www.remotion.dev/templates">
				<TemplatesAndExamples />
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
