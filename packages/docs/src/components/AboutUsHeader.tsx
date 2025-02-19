import React from 'react';
import styles from './AboutUsHeader.module.css';

export const AboutUsHeader: React.FC = () => {
	return (
		<div className={styles.writeincss}>
			<div style={{flex: 1}}>
				<h1 className={styles.writeincsstitle}>
					The programmatic video dream.
				</h1>
				<p>
					Remotion was born from a desire to bring the benefits that we know
					from programming - composability, version control, parametrization -
					into video editing. Started as a side project, we are now a company in
					Zurich, Switzerland and are pushing to combine the powers of video
					editing and programming!
				</p>
			</div>
		</div>
	);
};
