import React from 'react';
import {BlueButton} from '../layout/Button';
import styles from './footer.module.css';

const container: React.CSSProperties = {
	maxWidth: 1000,
	paddingLeft: 16,
	paddingRight: 16,
	margin: 'auto',
};

const half: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'row',
};

const inner: React.CSSProperties = {
	textAlign: 'center',
	display: 'flex',
	flexDirection: 'column',
	padding: 16,
	paddingTop: 80,
	borderRadius: 10,
	flex: 1,
	backgroundColor: 'var(--background)',
	width: '100%',
};

export const PlayerPageFooter: React.FC = () => {
	return (
		<div
			style={{backgroundColor: '#0B84F3', paddingTop: 20, paddingBottom: 20}}
		>
			<div className={styles.footerrow} style={container}>
				<div
					style={{
						...half,
						justifyContent: 'flex-end',
					}}
				>
					<div style={inner}>
						<h2 className={styles.title}>New to Remotion?</h2>
						<p>Learn about how to make videos in React.</p>
						<div style={{height: 100}} />

						<a href="/" style={{textDecoration: 'none'}}>
							<BlueButton loading={false} fullWidth size="sm">
								Learn Remotion
							</BlueButton>
						</a>
					</div>
				</div>
				<div style={{width: 20, height: 20}} />
				<div style={{...half, backgroundColor: '#0B84F3'}}>
					<div style={inner}>
						<h2 className={styles.title}>Already used Remotion?</h2>
						<p>Let{"'"}s get setup with the Player.</p>
						<div style={{height: 100}} />
						<a href="/docs/player" style={{textDecoration: 'none'}}>
							<BlueButton loading={false} fullWidth size="sm">
								Installation
							</BlueButton>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};
