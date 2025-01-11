import React from 'react';
import {GetStarted} from './GetStartedStrip';
import styles from './writeinreact.module.css';

export const WriteInReact: React.FC = () => {
	return (
		<div>
			<h1 className={styles.writeincsstitle}>Make videos programmatically.</h1>
			<br />
			<p
				style={{
					textAlign: 'center',
					fontSize: '1.2em',
					fontWeight: 500,
				}}
				className={styles.text}
			>
				Create real MP4 videos with React. <br />
				Parametrize content, render server-side and build applications.
			</p>
			<br />
			<div className={styles.writeincss}>
				<GetStarted />
			</div>
			<br />
			<br />
			<div>{/* <ChooseTemplate /> */}</div>
		</div>
	);
};
