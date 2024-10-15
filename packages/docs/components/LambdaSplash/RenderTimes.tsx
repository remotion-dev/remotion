import React from 'react';
import styles from './rendertimes.module.css';

export const RenderTimes: React.FC = () => {
	return (
		<div className={styles.row}>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					flex: 1,
				}}
			>
				<div className={styles.stat}>
					<p>80 sec video rendered in</p>
					<h1>
						15 sec<sup>1)</sup>
					</h1>
				</div>
				<div className={styles.stat}>
					<p>2 hr video rendered in</p>
					<h1>
						12 min<sup>2)</sup>
					</h1>
				</div>
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					flex: 1,
				}}
			>
				<div className={styles.stat}>
					<p>Concurrency up to</p>
					<h1>200x</h1>
				</div>
				<div className={styles.stat}>
					<p>Cost per minute</p>
					<h1>
						from $0.01<sup>3)</sup>
					</h1>
				</div>
			</div>
		</div>
	);
};
