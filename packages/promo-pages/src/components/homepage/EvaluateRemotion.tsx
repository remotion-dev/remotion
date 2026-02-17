// Adjustments to the EvaluateRemotionSection.tsx to separate the flex box into two boxes
// with specified alignment and positioning requirements.

import React, {useEffect, useState} from 'react';
import {experts} from '../experts';
import {BlueButton} from './layout/Button';

const EvaluateRemotionSection: React.FC = () => {
	const [dailyAvatars, setDailyAvatars] = useState<string[]>([]);

	useEffect(() => {
		const avatars = experts.map((expert) => expert.image);

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
					Questions about our license?
				</div>
				<p className={'text-muted fontbrand leading-snug'}>
					Book a 20 minute call or write us an email to get all your questions
					answered.
				</p>
				<div className="flex-1" />
				<div className="flex flex-row flex-wrap gap-2">
					<a
						target="_blank"
						href="https://cal.com/remotion/evaluate"
						style={{textDecoration: 'none'}}
					>
						<BlueButton size="sm" loading={false}>
							Schedule a call
						</BlueButton>
					</a>
					<a
						target="_blank"
						href="mailto:hi@remotion.dev"
						style={{textDecoration: 'none'}}
					>
						<BlueButton size="sm" loading={false}>
							Write an email
						</BlueButton>
					</a>
				</div>
			</div>
			<div className={'card flex-1 flex flex-col'}>
				<div className={'fontbrand text-2xl font-bold'}>
					Get help with your Remotion project
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
