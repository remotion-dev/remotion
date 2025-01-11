import React from 'react';
import styles from './CommunityStats.module.css';
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
	<a target="_blank" href={href} className={styles.statItemLink}>
		{children}
	</a>
);

const CommunityStats: React.FC = () => (
	<div className={styles.container}>
		<SectionTitle>Never build alone</SectionTitle>
		<div className={'font-brand text-center mb-10'}>
			Join a thriving community of developers.
		</div>
		<div className={styles.statsGrid}>
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
