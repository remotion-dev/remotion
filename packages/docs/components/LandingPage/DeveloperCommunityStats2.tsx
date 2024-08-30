import React from 'react';
import {
	Contributors,
	DiscordMembers,
	GitHubStars,
	InstallsPerMonth,
	PagesOfDocs,
	TemplatesAndExamples,
} from './DeveloperCommunityStats2-StatComponents';
import './DeveloperCommunityStats2.module.css';

const DeveloperCommunityStats2: React.FC = () => (
	<div className="developer-stats-container">
		<h2 className="developer-stats-title">Developer community stats</h2>
		<p className="developer-stats-subtitle">
			A thriving community of developers.
		</p>
		<div className="developer-stats-grid">
			<InstallsPerMonth />
			<PagesOfDocs />
			<TemplatesAndExamples />
			<GitHubStars />
			<DiscordMembers />
			<Contributors />
		</div>
	</div>
);

export default DeveloperCommunityStats2;
