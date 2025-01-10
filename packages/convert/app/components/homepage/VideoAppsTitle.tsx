import React from 'react';
import styles from './remotionvideoappstitle.module.css';

export const VideoAppsTitle: React.FC = () => {
	return (
		<div className={styles.container}>
			<h2 className={styles.title}>
				Build video <span className={styles.highlight}>apps</span>
			</h2>
			<p>
				Use our suite of tools to build apps that lets others create videos.
			</p>
		</div>
	);
};

export const PricingTitle: React.FC = () => {
	return (
		<div className={styles.container}>
			<h2 className={styles.title}>Pricing</h2>
			<br />
		</div>
	);
};

export const DemoTitle: React.FC = () => {
	return (
		<div className={styles.container}>
			<h2 className={styles.title}>Demo</h2>
			<br />
		</div>
	);
};
