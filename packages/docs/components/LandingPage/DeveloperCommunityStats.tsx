import React from 'react';
import {
	Contributors,
	DiscordMembers,
	GitHubStars,
	InstallsPerMonth,
	PagesOfDocs,
	TemplatesAndExamples,
} from './DeveloperCommunityStats-StatComponents';
import styles from './DeveloperCommunityStats.module.css';

const DeveloperCommunityStats: React.FC = () => (
	<div className={styles.container}>
		<h2 className={styles.title}>Developer community stats</h2>
		<p className={styles.subtitle}>A thriving community of developers.</p>
		<div className={styles.statsGrid}>
			<InstallsPerMonth />
			<PagesOfDocs />
			<TemplatesAndExamples />
			<GitHubStars />
			<DiscordMembers />
			<Contributors />
		</div>
	</div>
);

export default DeveloperCommunityStats;
