import {useColorMode} from '@docusaurus/theme-common';
import React from 'react';
import styles from './action-row.module.css';

const link: React.CSSProperties = {
	color: 'var(--ifm-color-primary)',
	cursor: 'pointer',
};

export const ActionRow: React.FC = () => {
	const {colorMode, setColorMode} = useColorMode();

	const toggleTheme = () => {
		setColorMode(colorMode === 'dark' ? 'light' : 'dark');
	};

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
					<a style={link} onClick={toggleTheme}>
						Switch to {colorMode === 'dark' ? 'light' : 'dark'} mode
					</a>{' '}
					and see the video adjust!
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
