import {useColorMode} from '@docusaurus/theme-common';
import React from 'react';
import styles from './action-row.module.css';

export const ActionRow: React.FC = () => {
	const {colorMode} = useColorMode();

	return (
		<div className={styles.row}>
			<div className={styles.action}>
				<h2 className={styles['action-title']}>Drag & Drop</h2>
				<p>
					The video is interactive. Drag the cards around to change the video.
				</p>
			</div>
			<div className={styles.action}>
				<h2 className={styles['action-title']}>
					{colorMode === 'dark' ? 'Light theme' : 'Dark theme'}
				</h2>
				<p>
					Switch to {colorMode === 'dark' ? 'light' : 'dark'} mode and see the
					video adjust!
				</p>
			</div>
			<div className={styles.action}>
				<h2 className={styles['action-title']}>Render a video</h2>
				<p>
					Invoke a distributed render using{' '}
					<a href="/lambda">Remotion Lambda</a>.
				</p>
			</div>
		</div>
	);
};
