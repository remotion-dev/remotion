// Adjustments to the EvaluateRemotionSection.tsx to separate the flex box into two boxes
// with specified alignment and positioning requirements.

import React, {useEffect, useState} from 'react';
import {BlueButton} from '../layout/Button';
import styles from './EvaluateRemotionSection.module.css';

const EvaluateRemotionSection: React.FC = () => {
	const [dailyAvatars, setDailyAvatars] = useState<string[]>([]);

	useEffect(() => {
		const avatars = [
			'/img/freelancers/alex.jpeg',
			'/img/freelancers/antoine.jpeg',
			'/img/freelancers/ayush.png',
			'/img/freelancers/benjamin.jpeg',
			'/img/freelancers/florent.jpeg',
			'/img/freelancers/karel.jpeg',
			'/img/freelancers/lorenzo.jpeg',
			'/img/freelancers/mickael.jpeg',
			'/img/freelancers/mohit.jpeg',
			'/img/freelancers/pramod.jpg',
			'/img/freelancers/pranav.jpg',
			'/img/freelancers/rahul.png',
			'/img/freelancers/ray.jpeg',
			'/img/freelancers/stephen.png',
			'/img/freelancers/umungo.png',
			'/img/freelancers/yehor.jpeg',
			// Add more avatar paths here
		];

		const selectedAvatars = [];
		for (let i = 0; i < 3; i++) {
			const index = Math.floor(Math.random() * avatars.length);
			selectedAvatars.push(avatars[index]);
			avatars.splice(index, 1); // Remove selected avatar to avoid duplicates
		}

		setDailyAvatars(selectedAvatars);
	}, []);

	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<div className={styles.contentWrapper}>
					<h3 className={styles.title}>Evaluate Remotion for your company</h3>
					<p className={styles.description}>
						Book a 20 minute call with us to get all your questions answered.
					</p>
				</div>
				<a
					className={styles.aknow}
					target="_blank"
					href="https://cal.com/remotion/evaluate"
					style={{textDecoration: 'none'}}
				>
					<BlueButton size="sm" fullWidth={false} loading={false}>
						Schedule a call
					</BlueButton>
				</a>
			</div>
			<div className={styles.card}>
				<div className={styles.contentWrapper}>
					<h3 className={styles.title}>Get help for your projects</h3>
					<p className={styles.description}>
						Contact our experts for help and work.
					</p>
				</div>
				<div className={styles.expertsSection}>
					<a
						className={styles.aknow}
						href="/experts"
						style={{textDecoration: 'none'}}
					>
						<BlueButton size="sm" fullWidth={false} loading={false}>
							Remotion Experts
						</BlueButton>
					</a>
					<div className={styles.avatars}>
						{dailyAvatars.map((avatar) => (
							<div
								key={avatar}
								className={styles.avatar}
								style={{backgroundImage: `url(${avatar})`}}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default EvaluateRemotionSection;
