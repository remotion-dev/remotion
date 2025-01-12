// Adjustments to the EvaluateRemotionSection.tsx to separate the flex box into two boxes
// with specified alignment and positioning requirements.

import React, {useEffect, useState} from 'react';
import {BlueButton} from './layout/Button';

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

		const selectedAvatars: string[] = [];
		for (let i = 0; i < 3; i++) {
			const index = Math.floor(Math.random() * avatars.length);
			selectedAvatars.push(avatars[index]);
			avatars.splice(index, 1); // Remove selected avatar to avoid duplicates
		}

		setDailyAvatars(selectedAvatars);
	}, []);

	return (
		<div className="flex flex-col lg:flex-row gap-2">
			<div className={'card flex-1 flex flex-col'}>
				<div className={'fontbrand text-2xl font-bold'}>
					Evaluate Remotion for your company
				</div>
				<p className={'text-muted fontbrand leading-snug'}>
					Book a 20 minute call with us to get all your questions answered.
				</p>
				<div className="flex-1" />
				<a
					target="_blank"
					href="https://cal.com/remotion/evaluate"
					style={{textDecoration: 'none'}}
				>
					<BlueButton size="sm" loading={false}>
						Schedule a call
					</BlueButton>
				</a>
			</div>
			<div className={'card flex-1 flex flex-col'}>
				<div className={'fontbrand text-2xl font-bold'}>
					Get help for your projects
				</div>
				<p className={'text-muted fontbrand leading-snug'}>
					Contact our experts for help and work.
				</p>
				<div className="flex-1" />
				<div className={'flex flex-row justify-between'}>
					<a href="/experts" style={{textDecoration: 'none'}}>
						<BlueButton size="sm" loading={false}>
							Remotion Experts
						</BlueButton>
					</a>
					<div className={'flex justify-end items-end gap-3'}>
						{dailyAvatars.map((avatar) => (
							<div
								key={avatar}
								className={
									'w-12 h-12 rounded-full bg-muted bg-cover bg-center -ml-5 border-2 border-black'
								}
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
