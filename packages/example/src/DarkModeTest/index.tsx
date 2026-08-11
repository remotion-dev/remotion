import React from 'react';
import {AbsoluteFill} from 'remotion';
import styles from './styles.module.css';

export const DarkModeTest: React.FC = () => {
	return (
		<AbsoluteFill className={styles.container}>
			<div className={styles.title}>Dark Mode Test</div>
			<div className={styles.subtitle}>
				Theme switches automatically based on system preferences
			</div>
		</AbsoluteFill>
	);
};
