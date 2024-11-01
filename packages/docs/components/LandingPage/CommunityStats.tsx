import React from 'react';
import {
	Contributors,
	DiscordMembers,
	GitHubStars,
	InstallsPerMonth,
	PagesOfDocs,
	TemplatesAndExamples,
} from './CommunityStatItems';
import styles from './CommunityStats.module.css';

const CommunityStats: React.FC = () => (
	<div className={styles.container}>
		<h2 className={styles.title}>Never build alone</h2>
		<p className={styles.subtitle}>Join a thriving community of developers.</p>
		<div className={styles.statsGrid}>
			<a
				target="_blank"
				href="https://www.npmjs.com/package/remotion"
				className={styles.statItemLink}
			>
				<InstallsPerMonth />
			</a>
			<a href="https://www.remotion.dev/docs/" className={styles.statItemLink}>
				<PagesOfDocs />
			</a>
			<a
				href="https://www.remotion.dev/templates"
				className={styles.statItemLink}
			>
				<TemplatesAndExamples />
			</a>
			<a
				target="_blank"
				href="https://github.com/remotion-dev/remotion"
				className={styles.statItemLink}
			>
				<GitHubStars />
			</a>
			<a
				target="_blank"
				href="https://remotion.dev/discord"
				className={styles.statItemLink}
			>
				<DiscordMembers />
			</a>
			<a
				target="_blank"
				href="https://github.com/remotion-dev/remotion/graphs/contributors"
				className={styles.statItemLink}
			>
				<Contributors />
			</a>
		</div>
	</div>
);

export default CommunityStats;
