import React from 'react';
import {
	Contributors,
	DiscordMembers,
	GitHubStars,
	InstallsPerMonth,
	PagesOfDocs,
	TemplatesAndExamples,
} from './DeveloperCommunityStats6-StatComponents';
import './DeveloperCommunityStats6.module.css';

const DeveloperCommunityStats6: React.FC = () => (
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

export default DeveloperCommunityStats6;
